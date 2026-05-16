import { useQuery } from "@tanstack/react-query";
import { ApiResponse, axiosInstance } from "@/lib/axios";
import { queryKeys } from "../_shared/query-keys";

export type TagDto = {
  tagId: string;
  title: string;
  color: string;
  cardCount: number;
  isAssigned: boolean;
};

async function fetchTags(teamId: string, cardId?: string): Promise<TagDto[]> {
  const params = cardId ? { cardId } : undefined;
  const res = await axiosInstance.get<ApiResponse<TagDto[]>>(
    `/api/teams/${teamId}/tags`,
    { params },
  );
  return res.data.data;
}

export function useTags(teamId: string, cardId?: string) {
  return useQuery({
    queryKey: queryKeys.tags(teamId),
    queryFn: () => fetchTags(teamId, cardId),
    enabled: !!teamId,
  });
}
