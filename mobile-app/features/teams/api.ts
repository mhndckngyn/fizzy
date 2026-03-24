import { ApiResponse, axiosInstance } from "@/lib/axios";
import { GetTeamsResponse } from "./types";

export const fetchTeams = async (): Promise<GetTeamsResponse> => {
  const response =
    await axiosInstance.get<ApiResponse<GetTeamsResponse>>("/api/teams");
  return response.data.data;
};
