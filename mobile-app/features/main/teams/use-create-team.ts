import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../_shared/query-keys";
import { ApiResponse, axiosInstance } from "@/lib/axios";

export type TeamCreatePayload = {
  teamName: string;
  memberName: string;
};

export type TeamCreateResponse = {
  teamId: string;
  memberId: string;
};

export async function createTeam(request: TeamCreatePayload) {
  const response = await axiosInstance.post<ApiResponse<TeamCreateResponse>>(
    "/api/teams",
    request,
  );

  return response.data.data;
}

export const useCreateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: TeamCreatePayload) => createTeam(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams() });
    },
  });
};
