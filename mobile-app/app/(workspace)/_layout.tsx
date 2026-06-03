import WorkspaceHeader from "@/components/workspace-header";
import { useNotificationHub } from "@/features/main/notifications/use-notification-hub";
import { useSession } from "@/features/user/use-session";
import { Redirect, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Spinner, YStack } from "tamagui";

export default function WorkspaceLayout() {
  const notification = useNotificationHub();
  const { data: user, isLoading } = useSession();

  if (isLoading) {
    return (
      <YStack f={1} ai="center" jc="center" bg="$background">
        <Spinner size="large" color="$primary" />
      </YStack>
    );
  }

  if (!user) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          header: (props) => <WorkspaceHeader />,
        }}
      >
        <Stack.Screen name="teams" />
      </Stack>
    </SafeAreaView>
  );
}
