import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useMemo } from "react";
import { useCurrentBoardParams, useCurrentTeamParams } from "../_shared/hooks";
import { queryKeys } from "../_shared/query-keys";
import { useColumns } from "../columns/hooks";
import { ColumnWithCards } from "../columns/types";
import {
  getCard,
  getCardsByBoard,
  getCardsForMention,
  createCard,
  assignCard,
  unassignCard,
  updateCard,
  moveCardToMaybe,
  moveCardToDone,
  moveCardToNotNow,
  moveCardToUserColumn,
  moveCardToBoard,
} from "./api";
import {
  Card,
  CardsMentionResponse,
  CreateCardRequest,
  AssignCardRequest,
  UpdateCardRequest,
  CardMoveRequest,
  CardMoveToColumnRequest,
  MoveCardToBoardRequest,
} from "./types";
import { EditorMentionItem } from "@/components/tiptap/tiptap-templates/simple/mention-suggestion";

export const useCard = (teamId: string, cardId: string) =>
  useQuery({
    queryKey: queryKeys.card(teamId, cardId),
    queryFn: () => getCard({ teamId, cardId }),
    enabled: !!teamId && !!cardId,
  });

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
    if (!columnsQuery || !cardsQuery) return;

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
    select: (data: CardsMentionResponse): EditorMentionItem[] =>
      data.map((card) => ({
        id: card.cardId,
        name: `${card.no} - ${card.title}`,
      })),
  });
};

export const useCreateCard = (boardId: string) => {
  const queryClient = useQueryClient();
  const { teamId } = useCurrentTeamParams();

  return useMutation({
    mutationFn: (data: CreateCardRequest) => createCard(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.boardCards(teamId, boardId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.members(teamId),
      });
    },
  });
};

export const useUpdateCard = (boardId: string) => {
  const queryClient = useQueryClient();
  const { teamId } = useCurrentTeamParams();

  return useMutation({
    mutationFn: (data: UpdateCardRequest) => updateCard(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.boardCards(teamId, boardId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.card(teamId, variables.cardId),
      });
    },
  });
};

export const useAssignCard = (boardId: string) => {
  const queryClient = useQueryClient();
  const { teamId } = useCurrentTeamParams();

  return useMutation({
    mutationFn: (data: AssignCardRequest) => assignCard(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.boardCards(teamId, boardId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.members(teamId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.card(teamId, variables.cardId),
      });
    },
  });
};

export const useUnassignCard = (boardId: string) => {
  const queryClient = useQueryClient();
  const { teamId } = useCurrentTeamParams();

  return useMutation({
    mutationFn: (data: AssignCardRequest) => unassignCard(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.boardCards(teamId, boardId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.members(teamId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.card(teamId, variables.cardId),
      });
    },
  });
};

function useInvalidateCardQueries(boardId: string) {
  const queryClient = useQueryClient();
  const { teamId } = useCurrentTeamParams();

  return (cardId?: string) => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.boardCards(teamId, boardId),
    });
    if (cardId) {
      queryClient.invalidateQueries({
        queryKey: queryKeys.card(teamId, cardId),
      });
    }
  };
}

export const useMoveCardToMaybe = (boardId: string) => {
  const invalidate = useInvalidateCardQueries(boardId);
  return useMutation({
    mutationFn: (data: CardMoveRequest) => moveCardToMaybe(data),
    onSuccess: (_, variables) => invalidate(variables.cardId),
  });
};

export const useMoveCardToDone = (boardId: string) => {
  const invalidate = useInvalidateCardQueries(boardId);
  return useMutation({
    mutationFn: (data: CardMoveRequest) => moveCardToDone(data),
    onSuccess: (_, variables) => invalidate(variables.cardId),
  });
};

export const useMoveCardToNotNow = (boardId: string) => {
  const invalidate = useInvalidateCardQueries(boardId);
  return useMutation({
    mutationFn: (data: CardMoveRequest) => moveCardToNotNow(data),
    onSuccess: (_, variables) => invalidate(variables.cardId),
  });
};

export const useMoveCardToColumn = (boardId: string) => {
  const invalidate = useInvalidateCardQueries(boardId);
  return useMutation({
    mutationFn: (data: CardMoveToColumnRequest) => moveCardToUserColumn(data),
    onSuccess: (_, variables) => invalidate(variables.cardId),
  });
};

export const useMoveCardToBoard = (boardId: string) => {
  const invalidate = useInvalidateCardQueries(boardId);
  return useMutation({
    mutationFn: (data: MoveCardToBoardRequest) => moveCardToBoard(data),
    onSuccess: (_, variables) => invalidate(variables.cardId),
  });
};
