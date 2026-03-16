import { Stack } from "expo-router";

export default function SigninLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="signin" />
      <Stack.Screen name="verify" />
    </Stack>
  );
}
