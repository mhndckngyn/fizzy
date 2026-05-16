import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { queryKeys } from "../_shared/query-keys";
import { TagDto } from "./use-list-tags";

async function removeTagFromCard(
  teamId: string,
  boardId: string,
  cardId: string,
  tagId: string,
): Promise<void> {
  await axiosInstance.delete(
    `/api/teams/${teamId}/boards/${boardId}/cards/${cardId}/tags/${tagId}`,
  );
}

export function useRemoveTagFromCard(
  teamId: string,
  boardId: string,
  cardId: string,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tagId: string) =>
      removeTagFromCard(teamId, boardId, cardId, tagId),
    onSuccess: (_, tagId) => {
      qc.setQueryData<TagDto[]>(queryKeys.tags(teamId), (old) =>
        old?.map((t) => (t.tagId === tagId ? { ...t, isAssigned: false } : t)),
      );
      qc.invalidateQueries({ queryKey: queryKeys.card(teamId, cardId) });
      qc.invalidateQueries({ queryKey: queryKeys.boardCards(teamId, boardId) });
    },
    onError: (err: any) => {
      console.error(
        "[useRemoveTagFromCard] status:",
        err?.response?.status,
        "body:",
        JSON.stringify(err?.response?.data),
      );
    },
  });
}
