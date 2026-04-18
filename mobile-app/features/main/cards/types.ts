export interface Card {
  cardId: string;
  no: number;
  title: string;
  boardId: string;
  columnId?: string;

  creatorName: string;
  createdAt: string;
  updatedAt: string | null;

  maybeId?: string | null;
  doneId?: string | null;
  notNowId?: string | null;
}

export type CardsGetByBoardRequest = {
  teamId: string;
  boardId: string;
};

export type CardsGetByBoardResponse = {
  cards: Card[];
};

export type CardMoveRequest = {
  teamId: string;
  boardId: string;
  cardId: string;
};

export type CardMoveToColumnRequest = CardMoveRequest & {
  columnId: string;
};

export type CardsMentionRequest = {
  teamId: string;
};

export type CardsMentionResponse = CardMention[];

export type CardMention = Pick<Card, "cardId" | "no" | "title">;
