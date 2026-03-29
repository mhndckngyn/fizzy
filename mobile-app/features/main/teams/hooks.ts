import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTeam, getTeams } from "./api";
import { TeamCreatePayload } from "./types";

export const useTeams = () => {
  return useQuery({
    queryKey: ["teams"],
    queryFn: getTeams,
    refetchOnWindowFocus: true,
  });
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: TeamCreatePayload) => createTeam(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
};
