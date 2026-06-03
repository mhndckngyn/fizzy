import { Card } from "../cards/types";

export type Column = {
  columnId: string;
  boardId: string;
  accountId: string;
  position: number;
  name: string;
  color: string;
};

export type ColumnListResponse = {
  columns: Pick<Column, "columnId" | "name" | "position" | "color">[];
};

export type ColumnCreateResponse = Pick<Column, "columnId">;

type ColumnSummary = ColumnListResponse["columns"][number];
export interface ColumnWithCards extends ColumnSummary {
  cards: Card[];
}
