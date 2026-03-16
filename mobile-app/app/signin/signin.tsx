import { FizzyLogo } from "@/components/FizzyLogo";
import { GoogleIcon } from "@/components/GoogleIcon";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import { Button, Input, Text, View, XStack, YStack } from "tamagui";

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const router = useRouter();

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
              <YStack ai="center" gap="$2">
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
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  size="$5"
                  onSubmitEditing={() => {
                    if (email.trim())
                      router.push({
                        pathname: "/signin/verify",
                        params: { email },
                      });
                  }}
                  returnKeyType="go"
                />
              </YStack>

              {/* Button */}
              <Button
                bg="$blue9"
                size="$5"
                br="$4"
                disabled={!email.trim()}
                opacity={email.trim() ? 1 : 0.45}
                onPress={() =>
                  router.push({ pathname: "/signin/verify", params: { email } })
                }
              >
                <Text col="white" fontSize={16} fontWeight="600">
                  {"Let's go →"}
                </Text>
              </Button>

              {/* Divider */}
              <XStack ai="center" gap="$3">
                <View flex={1} h={1} bg="$borderColor" />
                <Text fontSize={12} color="$colorSubtle">
                  or continue with
                </Text>
                <View flex={1} h={1} bg="$borderColor" />
              </XStack>

              {/* Google */}
              <Button variant="outlined" size="$5" br="$4" icon={GoogleIcon}>
                Continue with Google
              </Button>

              {/* Footer */}
              <Text
                fontSize={12}
                color="$colorSubtle"
                ta="center"
                lh={18}
                mt="$4"
              >
                By continuing, you agree to our{"\n"}
                <Text color="$blue10">Terms of Service</Text>
                {" & "}
                <Text color="$blue10">Privacy Policy</Text>
              </Text>
            </YStack>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
