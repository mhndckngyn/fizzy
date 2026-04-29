import { useMutation } from "@tanstack/react-query";
import { ApiResponse, axiosInstance } from "@/lib/axios";

export type InvitationInfoResponse = {
  teamName: string;
  memberCount: number;
};

export async function getInvitationInfo(code: string) {
  const response = await axiosInstance.get<ApiResponse<InvitationInfoResponse>>(
    `/api/teams/join/${code}`,
  );

  return response.data.data;
}

export const useGetInvitationInfoMutation = () => {
  return useMutation({
    mutationFn: (code: string) => getInvitationInfo(code),
  });
};
