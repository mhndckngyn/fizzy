import { ApiResponse, axiosInstance } from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrentTeamParams } from "../_shared/hooks";
import { queryKeys } from "../_shared/query-keys";
import { Comment } from "./types";

export type EditCommentRequest = {
  teamId: string;
  commentId: string;
  body: string;
};

export async function editComment({
  teamId,
  commentId,
  body,
}: EditCommentRequest): Promise<Comment> {
  const response = await axiosInstance.put<ApiResponse<Comment>>(
    `/api/teams/${teamId}/comments/${commentId}`,
    { body },
  );
  return response.data.data;
}

export const useEditComment = (cardId: string) => {
  const queryClient = useQueryClient();
  const { teamId } = useCurrentTeamParams();

  return useMutation({
    mutationFn: (data: EditCommentRequest) => editComment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.comments(teamId, cardId),
      });
    },
  });
};
