import { useMemo } from "react";
import { useColumnsbyBoardId } from "../columns/use-get-columns";
import { ColumnWithCards } from "../columns/types";
import { useBoardCards } from "./use-board-cards";
import { Card } from "./types";

export const useGroupedBoardCards = (boardId: string) => {
  const { data: columns } = useColumnsbyBoardId(boardId);
  const { data: cardsQuery } = useBoardCards(boardId);

  const groupedData = useMemo(() => {
    if (!columns || !cardsQuery) return;

    const maybeCards: Card[] = [];
    const doneCards: Card[] = [];
    const notNowCards: Card[] = [];
    const columnGroups: Record<string, ColumnWithCards> = {};

    columns.forEach(
      (column) => (columnGroups[column.columnId] = { ...column, cards: [] }),
    );

    cardsQuery.cards.forEach((card) => {
      if (card.columnId && columnGroups[card.columnId]) {
        columnGroups[card.columnId].cards.push(card);
      } else if (card.maybeId) maybeCards.push(card);
      else if (card.doneId) doneCards.push(card);
      else if (card.notNowId) notNowCards.push(card);
    });

    return {
      columnCards: Object.values(columnGroups).sort(
        (a, b) => a.position - b.position,
      ),
      maybeCards,
      doneCards,
      notNowCards,
    };
  }, [columns, cardsQuery]);

  return groupedData;
};
