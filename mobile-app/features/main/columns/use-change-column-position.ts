import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../_shared/query-keys";
import { ApiResponse, axiosInstance } from "@/lib/axios";

export type ColumnChangePositionRequest = {
  teamId: string;
  boardId: string;
  columnId: string;
  direction: "left" | "right";
};

export async function changeColumnPosition({
  teamId,
  boardId,
  columnId,
  direction,
}: ColumnChangePositionRequest) {
  const url = `/api/teams/${teamId}/boards/${boardId}/columns/${columnId}/${direction}`;

  const response = await axiosInstance.patch<ApiResponse>(url);

  return response.data.data;
}

export const useChangeColumnPosition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: ColumnChangePositionRequest) =>
      changeColumnPosition(request),
    onSuccess: (_, request) =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.columns(request.teamId, request.boardId),
      }),
  });
};
