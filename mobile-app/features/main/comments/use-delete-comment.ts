import { axiosInstance } from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../_shared/query-keys";

export type DeleteCommentRequest = {
  teamId: string;
  commentId: string;
};

export async function deleteComment({
  teamId,
  commentId,
}: DeleteCommentRequest): Promise<void> {
  await axiosInstance.delete(`/api/teams/${teamId}/comments/${commentId}`);
}

export const useDeleteComment = (cardId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DeleteCommentRequest) => deleteComment(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.comments(variables.teamId, cardId),
      });
    },
  });
};
