import { axiosInstance } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchTeams } from "./api";

export const useTeams = () => {
  return useQuery({
    queryKey: ["teams"],
    queryFn: fetchTeams,
    refetchOnWindowFocus: true,
  });
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      teamName,
      memberName,
    }: {
      teamName: string;
      memberName: string;
    }) => {
      const { data } = await axiosInstance.post("/api/teams", {
        teamName,
        memberName,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
};
