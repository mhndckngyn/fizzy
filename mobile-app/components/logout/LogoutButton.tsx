import { Button, Text } from "tamagui";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "expo-router";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      console.log("Logged out");
      router.replace("/sign-in");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <Button
      backgroundColor="#ff4d4f"
      onPress={handleLogout}
      borderRadius={10}
      paddingHorizontal={20}
      paddingVertical={0}
      height={40}
    >
      <Text color="white" fontWeight="bold">
        Logout
      </Text>
    </Button>
  );
}
