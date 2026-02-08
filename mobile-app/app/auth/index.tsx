import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { Button, Text, View } from "react-native";

export default function Index() {
  const { data: session } = authClient.useSession();
  const [token, setToken] = useState("");

  const getToken = async () => {
    const { data } = await authClient.token();
    if (data) {
      setToken(data.token);
    }
  };

  return (
    <View>
      <Text>Welcome, {session?.user.name}</Text>
      <Button title="Get token" onPress={getToken} />
      {token && <Text>Your token: {token}</Text>}
    </View>
  );
}
