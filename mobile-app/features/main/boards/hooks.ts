import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentTeamParams } from "../_shared/hooks";
import { createBoard, getBoards } from "./api";
import { BoardCreatePayload } from "./types";

export const useBoards = () => {
  const { teamId } = useCurrentTeamParams();

  return useQuery({
    queryKey: ["teams", teamId, "boards"],
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
      queryClient.invalidateQueries({ queryKey: ["teams", teamId, "boards"] });
    },
  });
};
