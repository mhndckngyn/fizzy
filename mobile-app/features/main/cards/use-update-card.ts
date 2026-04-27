import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrentTeamParams } from "../_shared/hooks";
import { queryKeys } from "../_shared/query-keys";
import { ApiResponse, axiosInstance } from "@/lib/axios";

export type UpdateCardRequest = {
  boardId: string;
  cardId: string;
  title?: string;
  body?: string;
};

export type UpdateCardResponse = {
  cardId: string;
  no: number;
  title: string | null;
};

export async function updateCard({
  boardId,
  cardId,
  title,
  body,
}: UpdateCardRequest) {
  const response = await axiosInstance.put<ApiResponse<UpdateCardResponse>>(
    `/api/boards/${boardId}/cards/${cardId}`,
    { title, body },
  );
  return response.data.data;
}

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
