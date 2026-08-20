import type { ChannelModel, ConfirmChannel, Options, Replies } from "amqplib";
import * as amqp from "amqplib";
import "../lib/load-env";
import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";

declare module "fastify" {
  interface FastifyInstance {
    mqPublish: PublishFn;
  }
}

export type PublishInput<T> = {
  event: T;
  routingKey: string;
};

export type PublishFn = (input: PublishInput<unknown>) => Promise<void>;

function getRabbitMQConfig() {
  return {
    url: process.env.RABBITMQ_URL ?? "amqp://localhost:5672",
    exchange: process.env.RABBITMQ_AUTH_EVENTS_EXCHANGE ?? "auth.events",
  };
}

function makePublisher(channel: ConfirmChannel, exchange: string): PublishFn {
  return async (input: PublishInput<unknown>) => {
    const { routingKey, event } = input;

    const content = Buffer.from(JSON.stringify(event));
    const options: Options.Publish = {
      contentType: "application/json",
      persistent: true,
    };

    await new Promise<void>((resolve, reject) => {
      channel.publish(
        exchange,
        routingKey,
        content,
        options,
        (error: Error | null, _ok: Replies.Empty) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        },
      );
    });
  };
}

const rabbitMQPlugin: FastifyPluginAsync = async (fastify) => {
  const { url, exchange } = getRabbitMQConfig();
  const connection: ChannelModel = await amqp.connect(url);
  const channel = await connection.createConfirmChannel();

  await channel.assertExchange(exchange, "topic", { durable: true });

  connection.on("error", (error) => {
    fastify.log.error({ error }, "RabbitMQ connection error");
  });

  channel.on("error", (error) => {
    fastify.log.error({ error }, "RabbitMQ channel error");
  });

  fastify.decorate("mqPublish", makePublisher(channel, exchange));

  fastify.addHook("preClose", async () => {
    await channel.close();
    await connection.close();
  });
};

export { rabbitMQPlugin };
export default fp(rabbitMQPlugin, {
  name: "rabbitmq",
});
