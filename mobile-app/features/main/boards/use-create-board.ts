import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrentTeamParams } from "../_shared/hooks";
import { queryKeys } from "../_shared/query-keys";
import { ApiResponse, axiosInstance } from "@/lib/axios";
import { Board } from "./types";

export type BoardCreatePayload = Pick<Board, "name">;

export type BoardCreateResponse = Pick<Board, "boardId">;

export async function createBoard(teamId: string, request: BoardCreatePayload) {
  const response = await axiosInstance.post<ApiResponse<BoardCreateResponse>>(
    `/api/teams/${teamId}/boards`,
    request,
  );

  return response.data.data;
}

export const useCreateBoard = () => {
  const queryClient = useQueryClient();

  const { teamId } = useCurrentTeamParams();

  return useMutation({
    mutationFn: (request: BoardCreatePayload) => createBoard(teamId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.boards(teamId) });
    },
  });
};
