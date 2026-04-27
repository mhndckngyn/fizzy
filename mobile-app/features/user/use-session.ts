import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";

export const useSession = () => {
  return useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      try {
        const { data, error } = await authClient.getSession();
        if (error || !data) return null;
        return data.user;
      } catch (e) {
        console.log(e);
        return null;
      }
    },
    staleTime: 1000 * 60 * 30, // Session valid for 30 minutes
  });
};
