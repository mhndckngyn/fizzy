export interface Card {
  cardId: string;
  no: number;
  title: string;
  boardId: string;
  columnId?: string | null;
  creatorName: string;
  createdAt: string;
  updatedAt: string | null;
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

export type MoveCardToBoardRequest = {
  boardId: string;
  cardId: string;
  targetBoardId: string;
};

export type CardsMentionRequest = {
  teamId: string;
};

export type CardsMentionResponse = CardMention[];

export type CardMention = Pick<Card, "cardId" | "no" | "title">;

export type CreateCardRequest = {
  teamId: string;
  boardId: string;
  title?: string;
  body?: string;
  assignedMemberIds?: string[];
};

export type CreateCardResponse = {
  cardId: string;
  no: number;
  title: string | null;
};

export type UpdateCardRequest = {
  boardId: string;
  cardId: string;
  title?: string;
  body?: string;
};

export type UpdateCardResponse = {
  cardId: string;
  no: number;
  title: string | null;
};

export type AssignCardRequest = {
  boardId: string;
  cardId: string;
  memberId: string;
};

export type AssignCardResponse = {
  assignmentId: string;
  cardId: string;
  assigneeMemberId: string;
  assigneeName: string;
};
