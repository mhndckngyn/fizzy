import { useQuery } from "@tanstack/react-query";
import { useCurrentTeamParams } from "../_shared/hooks";
import { queryKeys } from "../_shared/query-keys";
import { ApiResponse, axiosInstance } from "@/lib/axios";

type InvitationCodeResponse = {
  invitationCode: string;
};

async function getInvitationCode(teamId: string) {
  const response = await axiosInstance.get<ApiResponse<InvitationCodeResponse>>(
    `/api/teams/${teamId}/invitation-code`,
  );
  return response.data.data;
}

export const useInvitationCode = (enabled: boolean) => {
  const { teamId } = useCurrentTeamParams();

  return useQuery({
    queryKey: queryKeys.invitationCode(teamId),
    queryFn: () => getInvitationCode(teamId),
    enabled,
  });
};
