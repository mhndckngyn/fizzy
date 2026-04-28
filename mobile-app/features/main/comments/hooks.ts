import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentTeamParams } from "../_shared/hooks";
import { queryKeys } from "../_shared/query-keys";
import { createComment, deleteComment, editComment, getComments } from "./api";
import {
  CreateCommentRequest,
  DeleteCommentRequest,
  EditCommentRequest,
} from "./types";

export const useComments = (cardId: string) => {
  const { teamId } = useCurrentTeamParams();

  return useQuery({
    queryKey: queryKeys.comments(teamId, cardId),
    queryFn: () => getComments({ teamId, cardId }),
    enabled: !!teamId && !!cardId,
    select: (data) => data.comments,
  });
};

export const useCreateComment = (cardId: string) => {
  const queryClient = useQueryClient();
  const { teamId } = useCurrentTeamParams();

  return useMutation({
    mutationFn: (data: CreateCommentRequest) => createComment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.comments(teamId, cardId),
      });
    },
  });
};

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

export const useDeleteComment = (cardId: string) => {
  const queryClient = useQueryClient();
  const { teamId } = useCurrentTeamParams();

  return useMutation({
    mutationFn: (data: DeleteCommentRequest) => deleteComment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.comments(teamId, cardId),
      });
    },
  });
};
