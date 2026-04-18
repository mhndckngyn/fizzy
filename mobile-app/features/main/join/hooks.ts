import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getInvitationInfo, joinTeam } from "./api";
import { JoinTeamPayload } from "./types";
import { queryKeys } from "../_shared/query-keys";

export const useGetInvitationInfoMutation = () => {
  return useMutation({
    mutationFn: (code: string) => getInvitationInfo(code),
  });
};

export const useJoinTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: JoinTeamPayload) => joinTeam(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams() });
    },
  });
};
