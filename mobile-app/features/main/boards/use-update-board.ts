import { axiosInstance } from "@/lib/axios";
import { queryKeys } from "../_shared/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type UpdateBoardRequest = {
  teamId: string;
  boardId: string;
  name: string;
  allAccess?: boolean;
  retainedMemberIds?: string[];
  autoClosePeriodDays?: number | null;
};

async function updateBoard({
  teamId,
  boardId,
  name,
  allAccess,
  retainedMemberIds,
  autoClosePeriodDays,
}: UpdateBoardRequest) {
  await axiosInstance.put(`/api/teams/${teamId}/boards/${boardId}`, {
    name,
    allAccess,
    retainedMemberIds,
    autoClosePeriodDays,
  });
}

export const useUpdateBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBoard,
    onSuccess: (_, { teamId, boardId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.boards(teamId) });
      queryClient.invalidateQueries({
        queryKey: queryKeys.boardAccesses(teamId, boardId),
      });
    },
  });
};
