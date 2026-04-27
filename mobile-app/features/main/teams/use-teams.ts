import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../_shared/query-keys";
import { ApiResponse, axiosInstance } from "@/lib/axios";
import { Team } from "./types";

export type TeamListResponse = {
  teams: Team[];
};

export async function getTeams() {
  const response =
    await axiosInstance.get<ApiResponse<TeamListResponse>>("/api/teams");

  return response.data.data;
}

export const useTeams = () => {
  return useQuery({
    queryKey: queryKeys.teams(),
    queryFn: getTeams,
    refetchOnWindowFocus: true,
  });
};
