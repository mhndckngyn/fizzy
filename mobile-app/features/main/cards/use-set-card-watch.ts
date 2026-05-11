import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrentTeamParams } from "../_shared/hooks";
import { queryKeys } from "../_shared/query-keys";
import { axiosInstance } from "@/lib/axios";

export const useSetCardWatch = (cardId: string) => {
  const queryClient = useQueryClient();
  const { teamId } = useCurrentTeamParams();

  return useMutation({
    mutationFn: (watch: boolean) =>
      axiosInstance.put(
        `/api/teams/${teamId}/cards/${cardId}/${watch ? "watch" : "unwatch"}`,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.card(teamId, cardId),
      });
    },
  });
};
