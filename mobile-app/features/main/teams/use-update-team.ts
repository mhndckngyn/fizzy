import { axiosInstance } from "@/lib/axios";
import { queryKeys } from "../_shared/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type UpdateTeamRequest = {
  teamId: string;
  name: string;
  autoClosePeriodDays?: number;
};

async function updateTeam({
  teamId,
  name,
  autoClosePeriodDays,
}: UpdateTeamRequest) {
  await axiosInstance.put(`/api/teams/${teamId}`, {
    name,
    autoClosePeriodDays,
  });
}

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTeam,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.teams() }),
  });
};
