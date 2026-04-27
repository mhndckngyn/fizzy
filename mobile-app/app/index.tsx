// app/index.tsx
import { useSession } from "@/features/user/use-session";
import { Redirect } from "expo-router";
import { Spinner, YStack } from "tamagui";

export default function Index() {
  const { data: user, isLoading } = useSession();

  if (isLoading) {
    return (
      <YStack f={1} ai="center" jc="center" bg="$background">
        <Spinner size="large" color="$primary" />
      </YStack>
    );
  }

  return <Redirect href={user ? "/teams" : "/sign-in"} />;
}
