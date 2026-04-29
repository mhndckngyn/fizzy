import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrentTeamParams } from "../_shared/hooks";
import { queryKeys } from "../_shared/query-keys";
import { ApiResponse, axiosInstance } from "@/lib/axios";

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

export async function assignCard({
  boardId,
  cardId,
  memberId,
}: AssignCardRequest) {
  const response = await axiosInstance.post<ApiResponse<AssignCardResponse>>(
    `/api/boards/${boardId}/cards/${cardId}/assignments`,
    { memberId },
  );
  return response.data.data;
}

export async function unassignCard({
  boardId,
  cardId,
  memberId,
}: AssignCardRequest) {
  const response = await axiosInstance.delete<
    ApiResponse<{ success: boolean }>
  >(`/api/boards/${boardId}/cards/${cardId}/assignments/${memberId}`);
  return response.data.data;
}

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
