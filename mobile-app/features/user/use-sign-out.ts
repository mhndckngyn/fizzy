import { authClient } from "@/lib/auth-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useSignOut = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await authClient.signOut();
    },
    onSuccess: () => {
      queryClient.setQueryData(["session"], null);
      queryClient.clear();
    },
    onError: (error) => {
      console.error("Sign out failed:", error);
    },
  });
};
