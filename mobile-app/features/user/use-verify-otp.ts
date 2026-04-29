import { authClient } from "@/lib/auth-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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
