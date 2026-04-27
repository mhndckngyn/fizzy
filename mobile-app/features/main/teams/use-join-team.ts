import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../_shared/query-keys";
import { ApiResponse, axiosInstance } from "@/lib/axios";

export type JoinTeamPayload = {
  invitationCode: string;
  memberName: string;
};

export type JoinTeamResponse = {
  teamId: string;
  memberId: string;
};

export async function joinTeam(request: JoinTeamPayload) {
  const response = await axiosInstance.post<ApiResponse<JoinTeamResponse>>(
    `/api/teams/join`,
    {
      invitationCode: request.invitationCode,
      memberName: request.memberName,
    },
  );

  return response.data.data;
}

export const useJoinTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: JoinTeamPayload) => joinTeam(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams() });
    },
  });
};
