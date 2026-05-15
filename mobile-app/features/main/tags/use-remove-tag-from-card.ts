import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { queryKeys } from "../_shared/query-keys";

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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.card(teamId, cardId) });
      qc.invalidateQueries({ queryKey: queryKeys.boardCards(teamId, boardId) });
    },
  });
}
