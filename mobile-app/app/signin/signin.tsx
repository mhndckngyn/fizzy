import { FizzyLogo } from "@/components/FizzyLogo";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import { Button, Input, Text, View, YStack } from "tamagui";

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleContinue = async () => {
    if (!email.trim()) return;
    setError("");
    setLoading(true);

    const { error } = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "sign-in",
    });

    setLoading(false);

    if (error) {
      setError(error.message || "Something went wrong.");
    } else {
      router.push({ pathname: "/signin/verify", params: { email } });
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View flex={1} bg="$background" px="$5" minHeight="100%">
            <YStack flex={1} jc="center" gap="$4" py="$8">
              {/* Logo */}
              <YStack ai="center" pb="$2">
                <FizzyLogo />
              </YStack>

              {/* Title */}
              <YStack ai="center" gap="$5">
                <Text fontSize={28} fontWeight="600" color="$color">
                  Get into Fizzy
                </Text>
                <Text fontSize={15} color="$colorSubtle" ta="center" lh={22}>
                  Enter your email to sign in{"\n"}or create a new account.
                </Text>
              </YStack>

              {/* Input */}
              <YStack gap="$2">
                <Text
                  fontSize={11}
                  fontWeight="500"
                  color="$colorSubtle"
                  tt="uppercase"
                  ls={0.8}
                >
                  Email address
                </Text>
                <Input
                  placeholder="hello@example.com"
                  placeholderTextColor="$color8"
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    if (error) setError("");
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  size="$5"
                  onSubmitEditing={handleContinue}
                  returnKeyType="go"
                  borderColor={error ? "$red8" : undefined}
                />
                {error ? (
                  <Text fontSize={13} color="$red10">
                    {error}
                  </Text>
                ) : null}
              </YStack>

              {/* Button */}
              <Button
                bg="$blue9"
                size="$5"
                br="$4"
                disabled={!email.trim() || loading}
                opacity={!email.trim() || loading ? 0.45 : 1}
                onPress={handleContinue}
              >
                <Text col="white" fontSize={16} fontWeight="600">
                  {loading ? "Sending…" : "Let's go →"}
                </Text>
              </Button>
            </YStack>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
