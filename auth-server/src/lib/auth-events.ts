import { PublishFn } from "../plugins/rabbitmq";

type UserDeletedEvent = {
  userId: string;
  email: string;
};

const userDeletedRoutingKey = "user.deleted";

type PublishUserDeleted = (event: UserDeletedEvent) => Promise<void>;

export function makePublishUserDeletedFn(
  publishFn: PublishFn,
): PublishUserDeleted {
  return async (event) => {
    return publishFn({ event, routingKey: userDeletedRoutingKey });
  };
}

export type { PublishUserDeleted, UserDeletedEvent };
