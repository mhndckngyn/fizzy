import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrentTeamParams } from "../_shared/hooks";
import { queryKeys } from "../_shared/query-keys";
import { axiosInstance } from "@/lib/axios";

export const useSetBoardWatch = () => {
  const queryClient = useQueryClient();
  const { teamId } = useCurrentTeamParams();

  return useMutation({
    mutationFn: ({ boardId, watch }: { boardId: string; watch: boolean }) =>
      axiosInstance.put(
        `/api/teams/${teamId}/boards/${boardId}/${watch ? "watch" : "unwatch"}`,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.boards(teamId) });
    },
  });
};
