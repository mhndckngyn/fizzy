import { Card } from "../cards/types";

export type Column = {
  columnId: string;
  boardId: string;
  accountId: string;
  position: number;
  name: string;
  color: string;
};

export type ColumnListRequest = {
  teamId: string;
  boardId: string;
};

export type ColumnListResponse = {
  columns: Pick<Column, "columnId" | "name" | "position" | "color">[];
};

export type ColumnCreateRequest = Pick<Column, "name" | "color"> & {
  teamId: string;
  boardId: string;
};

export type ColumnUpdateRequest = ColumnCreateRequest & {
  columnId: string;
};

export type ColumnCreateResponse = Pick<Column, "columnId">;

export type ColumnChangePositionRequest = {
  teamId: string;
  boardId: string;
  columnId: string;
  direction: "left" | "right";
};

type ColumnSummary = ColumnListResponse["columns"][number];
export interface ColumnWithCards extends ColumnSummary {
  cards: Card[];
}
