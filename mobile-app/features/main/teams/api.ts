import { ApiResponse, axiosInstance } from "@/lib/axios";
import {
  TeamCreatePayload,
  TeamCreateResponse,
  TeamListResponse,
} from "./types";

/* Teams */
export async function getTeams() {
  const response =
    await axiosInstance.get<ApiResponse<TeamListResponse>>("/api/teams");

  return response.data.data;
}

export async function createTeam(request: TeamCreatePayload) {
  const response = await axiosInstance.post<ApiResponse<TeamCreateResponse>>(
    "/api/teams",
    request,
  );

  return response.data.data;
}
