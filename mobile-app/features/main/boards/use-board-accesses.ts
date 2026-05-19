import { ApiResponse, axiosInstance } from "@/lib/axios";
import { queryKeys } from "../_shared/query-keys";
import { useQuery } from "@tanstack/react-query";

export type MemberAccessEntry = {
  memberId: string;
  name: string;
  email: string;
  hasAccess: boolean;
};

export type BoardAccessesResponse = {
  canManage: boolean;
  allAccess: boolean;
  members: MemberAccessEntry[];
};

async function getBoardAccesses(teamId: string, boardId: string) {
  const response = await axiosInstance.get<ApiResponse<BoardAccessesResponse>>(
    `/api/teams/${teamId}/boards/${boardId}/accesses`,
  );
  return response.data.data;
}

export const useBoardAccesses = (teamId: string, boardId: string) => {
  return useQuery({
    queryKey: queryKeys.boardAccesses(teamId, boardId),
    queryFn: () => getBoardAccesses(teamId, boardId),
    enabled: !!teamId && !!boardId,
  });
};
