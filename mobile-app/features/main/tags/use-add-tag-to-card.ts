import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiResponse, axiosInstance } from "@/lib/axios";
import { queryKeys } from "../_shared/query-keys";
import { TagDto } from "./use-list-tags";

type AddTagResponse = {
  cardTagId: string;
  tagId: string;
  title: string;
  color: string;
};

async function addTagToCard(
  teamId: string,
  boardId: string,
  cardId: string,
  tagId: string,
): Promise<AddTagResponse> {
  const res = await axiosInstance.post<ApiResponse<AddTagResponse>>(
    `/api/teams/${teamId}/boards/${boardId}/cards/${cardId}/tags`,
    { tagId },
  );
  return res.data.data;
}

export function useAddTagToCard(
  teamId: string,
  boardId: string,
  cardId: string,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tagId: string) => addTagToCard(teamId, boardId, cardId, tagId),
    onSuccess: (_, tagId) => {
      qc.setQueryData<TagDto[]>(queryKeys.tags(teamId), (old) =>
        old?.map((t) => (t.tagId === tagId ? { ...t, isAssigned: true } : t)),
      );
      qc.invalidateQueries({ queryKey: queryKeys.card(teamId, cardId) });
      qc.invalidateQueries({ queryKey: queryKeys.boardCards(teamId, boardId) });
    },
    onError: (err: any) => {
      console.error(
        "[useAddTagToCard] status:",
        err?.response?.status,
        "body:",
        JSON.stringify(err?.response?.data),
      );
    },
  });
}
