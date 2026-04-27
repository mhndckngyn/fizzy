import { useQuery } from "@tanstack/react-query";
import { useCurrentTeamParams } from "../_shared/hooks";
import { queryKeys } from "../_shared/query-keys";
import { ApiResponse, axiosInstance } from "@/lib/axios";
import { Member } from "./types";

export type MemberListRequest = {
  teamId: string;
};

export type MemberListResponse = {
  members: Member[];
};

export async function getMembers({ teamId }: MemberListRequest) {
  const response = await axiosInstance.get<ApiResponse<MemberListResponse>>(
    `/api/teams/${teamId}/members`,
  );

  return response.data.data;
}

export const useMembers = () => {
  const { teamId } = useCurrentTeamParams();

  return useQuery({
    queryKey: queryKeys.members(teamId),
    queryFn: () => getMembers({ teamId }),
  });
};
