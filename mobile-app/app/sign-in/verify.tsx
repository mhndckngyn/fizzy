import { FizzyLogo } from "@/components/fizzy-logo";
import { useVerifyOtp } from "@/features/user/hooks";
import { authClient } from "@/lib/auth-client";
import { ArrowRight } from "@tamagui/lucide-icons-2";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Keyboard, Platform, TextInput } from "react-native";
import { Button, Text, View, XStack, YStack } from "tamagui";

const OTP_LENGTH = 6;
const TIMER_SECONDS = 10 * 60;

export default function VerifyEmailScreen() {
  const { email = "hello@example.com" } = useLocalSearchParams<{
    email: string;
  }>();
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const { mutate: verify, isPending, error } = useVerifyOtp();

  async function handleVerifyOtp() {
    if (!isComplete || isExpired) return;

    verify(
      { email, otp },
      {
        onError: (err) => {
          setOtp("");
          inputRef.current?.focus();
        },
        onSuccess: () => {
          // TODO
        },
      },
    );
  }

  async function resend() {
    setOtp("");
    setTimeLeft(TIMER_SECONDS);

    await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "sign-in",
    });
  }

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const isExpired = timeLeft <= 0;
  const isComplete = otp.length === OTP_LENGTH;

  return (
    <View flex={1} bg="$background" px="$5">
      <YStack flex={1} ai="center" jc="center" gap="$5">
        {/* Logo */}
        <FizzyLogo />

        {/* Title */}
        <YStack ai="center" gap="$2">
          <Text fontSize={28} fontWeight="600" col="$color" ls={-0.5}>
            Check your email
          </Text>
          <Text fontSize={15} col="$colorSubtle" ta="center" lh={22}>
            Enter the verification code{"\n"}sent to your inbox.
          </Text>
        </YStack>

        {/* OTP display */}
        <View w="100%">
          <XStack
            bg="$backgroundStrong"
            bw={1.5}
            bc={error ? "$red8" : isFocused ? "$blue9" : "$borderColor"}
            br="$5"
            py="$4"
            px="$6"
            jc="center"
            gap="$4"
            onPress={() => inputRef.current?.focus()}
          >
            {Array.from({ length: OTP_LENGTH }).map((_, i) => (
              <View key={i} w={24} h={30} ai="center" jc="center">
                {otp[i] ? (
                  <Text
                    fontSize={20}
                    fontWeight="600"
                    color={otp[i] ? "$color" : "$placeholderColor"}
                  >
                    {otp[i]}
                  </Text>
                ) : (
                  <View w={12} h={12} br="$10" bg="$borderColor" />
                )}
              </View>
            ))}
          </XStack>

          {/* Hidden real input */}
          <TextInput
            ref={inputRef}
            value={otp}
            onChangeText={(val) => {
              const cleaned = val.replace(/\D/g, "").slice(0, OTP_LENGTH);
              setOtp(cleaned);

              if (cleaned.length === OTP_LENGTH) {
                Keyboard.dismiss();
              }
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            keyboardType="number-pad"
            maxLength={OTP_LENGTH}
            caretHidden
            autoCorrect={false}
            autoComplete="one-time-code"
            textContentType="oneTimeCode"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: Platform.OS === "android" ? 0.01 : 0,
              fontSize: 1,
              color: "transparent",
            }}
          />
        </View>

        {/* Error message */}
        {error ? (
          <Text fontSize={13} col="$red10" ta="center">
            {error}
          </Text>
        ) : (
          /* Email hint */
          <Text fontSize={13} col="$colorSubtle" ta="center">
            Code sent to{" "}
            <Text col="$color" fontWeight="500">
              {email}
            </Text>
          </Text>
        )}

        {/* Timer chip */}
        <XStack
          ai="center"
          gap="$2"
          bg={isExpired ? "#1a1010" : "$backgroundStrong"}
          bw={1}
          bc={isExpired ? "#2e1c1c" : "$borderColor"}
          br="$10"
          px="$4"
          py="$2"
        >
          <View w={6} h={6} br="$10" bg={isExpired ? "#f87171" : "$blue9"} />
          <Text
            fontFamily="$mono"
            fontSize={13}
            fontWeight="500"
            col={isExpired ? "#f87171" : "$blue10"}
          >
            {isExpired ? "Code expired" : `${formatTime(timeLeft)} remaining`}
          </Text>
        </XStack>

        {/* Verify button */}
        <Button
          w="100%"
          bg="$blue9"
          size="$5"
          br="$4"
          disabled={!isComplete || isExpired || isPending}
          opacity={!isComplete || isExpired || isPending ? 0.4 : 1}
          onPress={handleVerifyOtp}
        >
          {isPending ? (
            <Text col="white" fontSize={16} fontWeight="600">
              Verifying...
            </Text>
          ) : (
            <XStack alignItems="center" gap="$1">
              <Text col="white" fontSize={16} fontWeight="600">
                Verify code
              </Text>
              <ArrowRight col="white" size={16} fontWeight={"600"} />
            </XStack>
          )}
        </Button>

        {/* Resend */}
        <XStack ai="center" gap="$1">
          <Text fontSize={13} col="$colorSubtle">
            Did not receive the code?{" "}
          </Text>
          <Text fontSize={13} col="$blue10" fontWeight="500" onPress={resend}>
            Resend
          </Text>
        </XStack>
      </YStack>
    </View>
  );
}
