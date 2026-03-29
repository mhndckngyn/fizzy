import { useSession } from "@/features/user/hooks";
import { Redirect, Stack } from "expo-router";

export default function SigninLayout() {
  const { data: user, isLoading } = useSession();

  if (isLoading) return null;

  if (user) {
    return <Redirect href="/teams" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="verify" />
    </Stack>
  );
}
