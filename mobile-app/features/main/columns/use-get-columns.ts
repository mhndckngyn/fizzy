import { useQuery } from "@tanstack/react-query";
import { useCurrentTeamParams } from "../_shared/hooks";
import { queryKeys } from "../_shared/query-keys";
import { ApiResponse, axiosInstance } from "@/lib/axios";
import { ColumnListResponse } from "./types";

export type ColumnListRequest = {
  teamId: string;
  boardId: string;
};

export async function getColumns({ teamId, boardId }: ColumnListRequest) {
  const response = await axiosInstance.get<ApiResponse<ColumnListResponse>>(
    `/api/teams/${teamId}/boards/${boardId}/columns`,
  );

  return response.data.data;
}

export const useColumnsbyBoardId = (boardId: string) => {
  const { teamId } = useCurrentTeamParams();
  return useQuery({
    queryKey: queryKeys.columns(teamId, boardId),
    queryFn: () => getColumns({ teamId, boardId }),
    select: (data) => data.columns.sort((a, b) => a.position - b.position),
    enabled: !!teamId && !!boardId,
  });
};
