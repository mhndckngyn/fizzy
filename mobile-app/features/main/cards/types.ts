export interface Card {
  cardId: string;
  no: number;
  title: string;
  boardId: string;
  columnId?: string | null;
  creatorName: string;
  createdAt: string;
  updatedAt: string | null;
  lastActiveAt: string;
  autoClosePeriodDays: number;
  isGolden: boolean;
  maybeId?: string | null;
  doneId?: string | null;
  notNowId?: string | null;
}

export type CardAssignee = {
  memberId: string;
  name: string;
};

export interface CardDetail {
  cardId: string;
  no: number;
  title: string | null;
  body: string | null;
  boardId: string;
  columnId: string | null;
  maybeId: string | null;
  doneId: string | null;
  notNowId: string | null;
  creatorName: string;
  createdAt: string;
  updatedAt: string | null;
  assignments: CardAssignee[];
  isWatching: boolean;
  tags: { tagId: string; title: string; color: string }[];
  isGolden: boolean;
}

export type CardMention = Pick<Card, "cardId" | "no" | "title">;
