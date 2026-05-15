import { useQuery } from "@tanstack/react-query";
import { ApiResponse, axiosInstance } from "@/lib/axios";
import { queryKeys } from "../_shared/query-keys";

export type TagDto = {
  tagId: string;
  title: string;
  color: string;
  cardCount: number;
};

async function fetchTags(teamId: string): Promise<TagDto[]> {
  const res = await axiosInstance.get<ApiResponse<TagDto[]>>(
    `/api/teams/${teamId}/tags`,
  );
  return res.data.data;
}

export function useTags(teamId: string) {
  return useQuery({
    queryKey: queryKeys.tags(teamId),
    queryFn: () => fetchTags(teamId),
    enabled: !!teamId,
  });
}
