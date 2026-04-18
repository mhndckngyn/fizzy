import { ApiResponse, axiosInstance } from "@/lib/axios";
import { MemberListRequest, MemberListResponse } from "./types";

export async function getMembers({ teamId }: MemberListRequest) {
  const response = await axiosInstance.get<ApiResponse<MemberListResponse>>(
    `/api/teams/${teamId}/members`,
  );

  return response.data.data;
}
