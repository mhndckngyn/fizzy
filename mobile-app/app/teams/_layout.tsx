import { Stack } from "expo-router";

export default function TeamsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="createteam" />
      <Stack.Screen name="teams" />
    </Stack>
  );
}
