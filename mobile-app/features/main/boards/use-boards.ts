import { useQuery } from "@tanstack/react-query";
import { useCurrentTeamParams } from "../_shared/hooks";
import { queryKeys } from "../_shared/query-keys";
import { ApiResponse, axiosInstance } from "@/lib/axios";
import { Board } from "./types";

export type BoardListResponse = {
  boards: Board[];
};

export async function getBoards(teamId: string) {
  const response = await axiosInstance.get<ApiResponse<BoardListResponse>>(
    `/api/teams/${teamId}/boards`,
  );

  return response.data.data;
}

export const useBoards = () => {
  const { teamId } = useCurrentTeamParams();

  return useQuery({
    queryKey: queryKeys.boards(teamId),
    queryFn: () => getBoards(teamId),
    enabled: !!teamId,
  });
};
