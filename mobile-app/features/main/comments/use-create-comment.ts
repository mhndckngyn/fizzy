import { ApiResponse, axiosInstance } from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../_shared/query-keys";
import { Comment } from "./types";

export type CreateCommentRequest = {
  teamId: string;
  cardId: string;
  body: string;
};

export async function createComment({
  teamId,
  cardId,
  body,
}: CreateCommentRequest): Promise<Comment> {
  const response = await axiosInstance.post<ApiResponse<Comment>>(
    `/api/teams/${teamId}/cards/${cardId}/comments`,
    { body },
  );
  return response.data.data;
}

export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCommentRequest) => createComment(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.comments(variables.teamId, variables.cardId),
      });
    },
  });
};
