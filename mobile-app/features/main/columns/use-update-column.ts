import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../_shared/query-keys";
import { ApiResponse, axiosInstance } from "@/lib/axios";
import { ColumnCreateRequest } from "./use-create-column";

export type ColumnUpdateRequest = ColumnCreateRequest & {
  columnId: string;
};

export async function updateColumn(request: ColumnUpdateRequest) {
  const { teamId, boardId, columnId, ...payload } = request;

  const response = await axiosInstance.put<ApiResponse>(
    `/api/teams/${teamId}/boards/${boardId}/columns/${columnId}`,
    payload,
  );

  return response.data.data;
}

export const useUpdateColumn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: ColumnUpdateRequest) => updateColumn(request),
    onSuccess: (_, request) =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.columns(request.teamId, request.boardId),
      }),
  });
};
