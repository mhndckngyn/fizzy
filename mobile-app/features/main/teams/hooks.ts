import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTeam, getTeams } from "./api";
import { TeamCreatePayload } from "./types";
import { queryKeys } from "../_shared/query-keys";

export const useTeams = () => {
  return useQuery({
    queryKey: queryKeys.teams(),
    queryFn: getTeams,
    refetchOnWindowFocus: true,
  });
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: TeamCreatePayload) => createTeam(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams() });
    },
  });
};
