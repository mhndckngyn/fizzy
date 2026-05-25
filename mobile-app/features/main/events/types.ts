export type FeedEventType = "Added" | "Updated" | "Done";

export interface FeedEvent {
  eventId: string;
  cardId: string;
  cardNo: number;
  title: string;
  boardName: string;
  creatorName: string;
  columnColor?: string;
  createdAt: string;
  type: FeedEventType;
}
