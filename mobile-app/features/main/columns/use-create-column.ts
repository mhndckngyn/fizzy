import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../_shared/query-keys";
import { ApiResponse, axiosInstance } from "@/lib/axios";
import { Column, ColumnCreateResponse } from "./types";

export type ColumnCreateRequest = Pick<Column, "name" | "color"> & {
  teamId: string;
  boardId: string;
};

export async function createColumn(request: ColumnCreateRequest) {
  const { teamId, boardId, ...payload } = request;

  const response = await axiosInstance.post<ApiResponse<ColumnCreateResponse>>(
    `/api/teams/${teamId}/boards/${boardId}/columns`,
    payload,
  );

  return response.data.data;
}

export const useCreateColumn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: ColumnCreateRequest) => createColumn(request),
    onSuccess: (_, request) =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.columns(request.teamId, request.boardId),
      }),
  });
};
