export type Board = {
  boardId: string;
  name: string;
};

export type BoardListResponse = {
  boards: Board[];
};

export type BoardCreatePayload = Pick<Board, "name">;

export type BoardCreateResponse = Pick<Board, "boardId">;
