import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../_shared/query-keys";
import { ApiResponse, axiosInstance } from "@/lib/axios";

export async function deleteColumn({
  teamId,
  boardId,
  columnId,
}: {
  teamId: string;
  boardId: string;
  columnId: string;
}) {
  const response = await axiosInstance.delete<
    ApiResponse<{ success: boolean }>
  >(`/api/teams/${teamId}/boards/${boardId}/columns/${columnId}`);
  return response.data.data;
}

export const useDeleteColumn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: {
      teamId: string;
      boardId: string;
      columnId: string;
    }) => deleteColumn(request),
    onSuccess: (_, request) =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.columns(request.teamId, request.boardId),
      }),
  });
};
