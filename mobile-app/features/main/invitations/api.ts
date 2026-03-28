import { ApiResponse, axiosInstance } from "@/lib/axios";
import {
  InvitationInfoResponse,
  JoinTeamPayload,
  JoinTeamResponse,
} from "./types";

export async function getInvitationInfo(code: string) {
  const response = await axiosInstance.get<ApiResponse<InvitationInfoResponse>>(
    `/api/invitations`,
    { params: { invitionCode: code } },
  );

  return response.data.data;
}

export async function joinTeam(request: JoinTeamPayload) {
  const response = await axiosInstance.post<ApiResponse<JoinTeamResponse>>(
    `/api/invitations/${request.invitationCode}/join`,
    {
      invitationCode: request.invitationCode,
      memberName: request.memberName,
    },
  );

  return response.data.data;
}
