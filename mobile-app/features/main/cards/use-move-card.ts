import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrentTeamParams } from "../_shared/hooks";
import { queryKeys } from "../_shared/query-keys";
import { ApiResponse, axiosInstance } from "@/lib/axios";

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

export async function moveCardToMaybe({
  teamId,
  boardId,
  cardId,
}: CardMoveRequest) {
  const response = await axiosInstance.put<ApiResponse<{ success: boolean }>>(
    `/api/teams/${teamId}/boards/${boardId}/cards/${cardId}/maybe`,
  );
  return response.data.data;
}

export async function moveCardToNotNow({
  teamId,
  boardId,
  cardId,
}: CardMoveRequest) {
  const response = await axiosInstance.put<ApiResponse<{ success: boolean }>>(
    `/api/teams/${teamId}/boards/${boardId}/cards/${cardId}/not-now`,
  );
  return response.data.data;
}

export async function moveCardToDone({
  teamId,
  boardId,
  cardId,
}: CardMoveRequest) {
  const response = await axiosInstance.put<ApiResponse<{ success: boolean }>>(
    `/api/teams/${teamId}/boards/${boardId}/cards/${cardId}/done`,
  );
  return response.data.data;
}

export async function moveCardToUserColumn({
  teamId,
  boardId,
  cardId,
  columnId,
}: CardMoveToColumnRequest) {
  const response = await axiosInstance.put<ApiResponse<{ success: boolean }>>(
    `/api/teams/${teamId}/boards/${boardId}/columns/${columnId}/cards/${cardId}`,
  );
  return response.data.data;
}

export async function moveCardToBoard({
  boardId,
  cardId,
  targetBoardId,
}: MoveCardToBoardRequest): Promise<void> {
  await axiosInstance.put(`/api/boards/${boardId}/cards/${cardId}/board`, {
    targetBoardId,
  });
}

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
