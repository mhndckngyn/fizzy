import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentTeamParams } from "../_shared/hooks";
import { queryKeys } from "../_shared/query-keys";
import {
  changeColumnPosition,
  createColumn,
  getColumns,
  updateColumn,
} from "./api";
import {
  ColumnChangePositionRequest,
  ColumnCreateRequest,
  ColumnUpdateRequest,
} from "./types";

export const useColumnsbyBoardId = (boardId: string) => {
  const { teamId } = useCurrentTeamParams();
  return useQuery({
    queryKey: queryKeys.columns(teamId, boardId),
    queryFn: () => getColumns({ teamId, boardId }),
    select: (data) => data.columns.sort((a, b) => a.position - b.position), // TODO maybe let backend do this
    enabled: !!teamId && !!boardId,
  });
};

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
