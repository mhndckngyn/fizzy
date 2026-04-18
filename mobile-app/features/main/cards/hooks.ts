import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useCurrentBoardParams, useCurrentTeamParams } from "../_shared/hooks";
import { queryKeys } from "../_shared/query-keys";
import { useColumns } from "../columns/hooks";
import { ColumnWithCards } from "../columns/types";
import { getCardsByBoard, getCardsForMention } from "./api";
import { Card, CardsMentionResponse } from "./types";
import { EditorMentionItem } from "@/components/tiptap/tiptap-templates/simple/mention-suggestion";

export const useBoardCards = () => {
  const { teamId } = useCurrentTeamParams();
  const boardId = useCurrentBoardParams();

  return useQuery({
    queryKey: queryKeys.boardCards(teamId, boardId),
    queryFn: () => getCardsByBoard({ teamId, boardId }),
    enabled: !!teamId && !!boardId,
  });
};

export const useGroupedBoardCards = () => {
  const { data: columnsQuery } = useColumns();
  const { data: cardsQuery } = useBoardCards();

  const groupedData = useMemo(() => {
    if (!columnsQuery || !cardsQuery) {
      return;
    }

    const maybeCards: Card[] = [];
    const doneCards: Card[] = [];
    const notNowCards: Card[] = [];
    const columnGroups: Record<string, ColumnWithCards> = {};

    columnsQuery.columns.forEach(
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
  }, [columnsQuery, cardsQuery]);

  return groupedData;
};

export const useCardMention = () => {
  const { teamId } = useCurrentTeamParams();

  return useQuery({
    queryKey: queryKeys.mentionCard(teamId),
    queryFn: () => getCardsForMention({ teamId }),
    select: (data: CardsMentionResponse): EditorMentionItem[] => {
      return data.map((card) => ({
        id: card.cardId,
        name: `${card.no} - ${card.title}`,
      }));
      // TODO order by updated date
    },
  });
};
