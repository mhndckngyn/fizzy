import { authClient } from "@/lib/auth-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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

export const useVerifyOtp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, otp }: { email: string; otp: string }) => {
      const { data, error } = await authClient.signIn.emailOtp({ email, otp });

      if (error) {
        throw new Error(error.message || "Invalid code. Please try again.");
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["session"], data.user);
    },
  });
};

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
