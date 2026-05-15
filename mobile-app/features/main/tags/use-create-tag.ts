import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiResponse, axiosInstance } from "@/lib/axios";
import { queryKeys } from "../_shared/query-keys";

export type TagDto = {
  tagId: string;
  title: string;
  color: string;
  cardCount: number;
};

async function createTag(
  teamId: string,
  payload: { title: string; color: string },
): Promise<TagDto> {
  const res = await axiosInstance.post<ApiResponse<TagDto>>(
    `/api/teams/${teamId}/tags`,
    payload,
  );
  return res.data.data;
}

export function useCreateTag(teamId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { title: string; color: string }) =>
      createTag(teamId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.tags(teamId) });
    },
  });
}
