import WorkspaceHeader from "@/components/workspace-header";
import { useSession } from "@/features/user/use-session";
import { Redirect, Stack } from "expo-router";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Spinner, YStack } from "tamagui";

export default function WorkspaceLayout() {
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
