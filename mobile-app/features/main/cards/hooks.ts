import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useCurrentTeamParams } from "../_shared/hooks";
import { queryKeys } from "../_shared/query-keys";
import { useColumnsbyBoardId } from "../columns/hooks";
import { ColumnWithCards } from "../columns/types";
import {
  assignCard,
  createCard,
  getCard,
  getCardsByBoard,
  getCardsForMention,
  moveCardToBoard,
  moveCardToDone,
  moveCardToMaybe,
  moveCardToNotNow,
  moveCardToUserColumn,
  unassignCard,
  updateCard,
} from "./api";
import {
  AssignCardRequest,
  Card,
  CardMoveRequest,
  CardMoveToColumnRequest,
  CreateCardRequest,
  MoveCardToBoardRequest,
  UpdateCardRequest,
} from "./types";

export const useCard = (teamId: string, cardId: string) =>
  useQuery({
    queryKey: queryKeys.card(teamId, cardId),
    queryFn: () => getCard({ teamId, cardId }),
    enabled: !!teamId && !!cardId,
  });

export const useBoardCards = (boardId: string) => {
  const { teamId } = useCurrentTeamParams();

  return useQuery({
    queryKey: queryKeys.boardCards(teamId, boardId),
    queryFn: () => getCardsByBoard({ teamId, boardId }),
    enabled: !!teamId && !!boardId,
  });
};

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

export const useCardMention = () => {
  const { teamId } = useCurrentTeamParams();

  return useQuery({
    queryKey: queryKeys.mentionCard(teamId),
    queryFn: () => getCardsForMention({ teamId }),
    select: (data) =>
      data.cards.map((card) => ({
        id: card.cardId,
        name: `${card.no} - ${card.title}`,
      })),
  });
};

export const useCreateCard = () => {
  const queryClient = useQueryClient();
  const { teamId } = useCurrentTeamParams();

  return useMutation({
    mutationFn: (data: CreateCardRequest) => createCard(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.boardCards(teamId, variables.boardId),
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
