import Fastify from "fastify";
import { createAuth } from "./lib/auth";
import fastifyCors from "@fastify/cors";
import rabbitMQPlugin from "./plugins/rabbitmq";
import { makePublishUserDeletedFn } from "./lib/auth-events";

const fastify = Fastify({ logger: true });

async function main() {
  await fastify.register(rabbitMQPlugin);

  const auth = createAuth({
    publishUserDeleted: makePublishUserDeletedFn(fastify.mqPublish),
  });

  await fastify.register(fastifyCors, {
    origin: ["http://localhost:3000", "http://localhost:8081", "fizzy://"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
    maxAge: 86400,
  });

  fastify.route({
    method: ["GET"],
    url: "/api/auth/.well-known/openid-configuration",
    async handler(_, reply) {
      reply.code(200).send({
        issuer: "http://localhost:4000",
        jwks_uri: "http://localhost:4000/api/auth/jwks",
      });
    },
  });

  fastify.route({
    method: ["GET", "POST"],
    url: "/api/auth/*",
    async handler(request, reply) {
      try {
        // Construct request URL
        const url = new URL(request.url, `http://${request.headers.host}`);

        // Convert Fastify headers to standard Headers object
        const headers = new Headers();
        Object.entries(request.headers).forEach(([key, value]) => {
          if (value) headers.append(key, value.toString());
        });

        // Create Fetch API-compatible request
        const req = new Request(url.toString(), {
          method: request.method,
          headers,
          ...(request.body ? { body: JSON.stringify(request.body) } : {}),
        });

        // Process authentication request
        const response = await auth.handler(req);

        // Forward response to client
        reply.status(response.status);
        response.headers.forEach((value, key) => reply.header(key, value));
        reply.send(response.body ? await response.text() : null);
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          error: "Internal authentication error",
          code: "AUTH_FAILURE",
        });
      }
    },
  });

  await fastify.listen({ port: 4000 });
  fastify.log.info("Server running on port 4000");
}

main().catch((error) => {
  fastify.log.error(error);
  process.exit(1);
});
