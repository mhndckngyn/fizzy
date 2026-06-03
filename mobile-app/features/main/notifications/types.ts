import { z } from "zod";

export const NotificationSchema = z.object({
  notificationId: z.string(),
  teamId: z.string(),
  title: z.string(),
  description: z.string(),
  cardNo: z.number(),
  cardId: z.string(),
  boardName: z.string(),
  columnColor: z.string().nullable().optional(),
  unreadCount: z.number(),
  updatedAt: z.iso.datetime(),

  // api sends these but prolly dont need
  actorName: z.string().nullable().optional(),
  readAt: z.iso.datetime().nullable().optional(),
});

export type Notification = z.infer<typeof NotificationSchema>;
