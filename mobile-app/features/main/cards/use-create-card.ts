import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrentTeamParams } from "../_shared/hooks";
import { queryKeys } from "../_shared/query-keys";
import { ApiResponse, axiosInstance } from "@/lib/axios";

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

export async function createCard({
  teamId,
  boardId,
  title,
  body,
  assignedMemberIds,
}: CreateCardRequest) {
  const response = await axiosInstance.post<ApiResponse<CreateCardResponse>>(
    `/api/teams/${teamId}/boards/${boardId}/cards`,
    { title, body, assignedMemberIds },
  );
  return response.data.data;
}

export const useCreateCard = () => {
  const queryClient = useQueryClient();
  const { teamId } = useCurrentTeamParams();

  return useMutation({
    mutationFn: (data: CreateCardRequest) => createCard(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.boardCards(teamId, variables.boardId),
      });
    },
  });
};
