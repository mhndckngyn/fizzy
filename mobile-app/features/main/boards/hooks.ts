import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentTeamParams } from "../_shared/hooks";
import { queryKeys } from "../_shared/query-keys";
import { createBoard, getBoards } from "./api";
import { BoardCreatePayload } from "./types";

export const useBoards = () => {
  const { teamId } = useCurrentTeamParams();

  return useQuery({
    queryKey: queryKeys.boards(teamId),
    queryFn: () => getBoards(teamId),
    enabled: !!teamId,
  });
};

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
