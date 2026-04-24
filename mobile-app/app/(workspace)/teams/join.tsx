import { getInitials } from "@/features/main/_shared/helpers";
import {
  useGetInvitationInfoMutation,
  useJoinTeam,
} from "@/features/main/join/hooks";
import { InvitationInfoResponse } from "@/features/main/join/types";
import { ClipboardPaste } from "@tamagui/lucide-icons-2";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import {
  Avatar,
  Button,
  Input,
  Label,
  Text,
  View,
  XStack,
  YStack,
} from "tamagui";

export default function JoinTeamPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [code, setCode] = useState("");
  const [memberName, setMemberName] = useState("");
  const [teamInfo, setTeamInfo] = useState<InvitationInfoResponse | null>(null);

  const { mutateAsync: getInfo, isPending: isLoadingInfo } =
    useGetInvitationInfoMutation();
  const { mutateAsync: performJoin, isPending: isJoining } = useJoinTeam();

  const handleNext = async () => {
    if (!code) return;

    // Normalize and validate
    const alphanumeric = code.replace(/[^a-zA-Z0-9]/g, "");
    if (alphanumeric.length !== 12) {
      Alert.alert(
        "Invalid Code",
        "The invitation code isn't in the correct format. Please try again!",
      );
      return;
    }

    // Auto-insert hyphens
    const formattedCode = `${alphanumeric.slice(0, 4)}-${alphanumeric.slice(4, 8)}-${alphanumeric.slice(8, 12)}`;
    setCode(formattedCode);

    try {
      const info = await getInfo(formattedCode);
      setTeamInfo(info);
      setStep(2);
    } catch (e: any) {
      Alert.alert("Error", e.message || "Invalid invitation code.");
    }
  };

  const handlePaste = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text) setCode(text);
    } catch (e) {
      console.log("Failed to paste:", e);
    }
  };

  const handleJoin = async () => {
    if (!memberName) return;
    try {
      await performJoin({ invitationCode: code, memberName });
      router.replace("/teams");
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to join team.");
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
        >
          <View flex={1} bg="$background" px="$5">
            {/* Input invitation code */}
            <YStack gap="$5" py="$4">
              {step === 1 ? (
                <YStack gap="$4">
                  <YStack gap="$1" ai="center">
                    <Text fontSize={28} fontWeight="800" col="$color">
                      Join a team
                    </Text>
                    <Text fontSize={15} col="$colorSubtle" ta="center">
                      Enter the invitation code to join an existing team.
                    </Text>
                  </YStack>

                  <YStack gap="$0.5">
                    <Label fontSize={12} col="$colorSubtle" fontWeight="bold">
                      INVITATION CODE
                    </Label>
                    <XStack gap="$2" ai="center">
                      <Input
                        f={1}
                        size="$4"
                        value={code}
                        onChangeText={setCode}
                        placeholder="XXXX-XXXX-XXXX"
                        placeholderTextColor="$color8"
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                      <Button
                        theme="alt1"
                        size="$4"
                        icon={ClipboardPaste}
                        onPress={handlePaste}
                        borderWidth={1}
                        borderColor="$borderColor"
                        hoverStyle={{ borderColor: "$borderColorHover" }}
                        pressStyle={{ borderColor: "$borderColorFocus" }}
                      />
                    </XStack>
                  </YStack>

                  <YStack gap="$3" mt="$2">
                    <Button
                      bg="$blue9"
                      size="$4"
                      br="$5"
                      onPress={handleNext}
                      disabled={!code || isLoadingInfo}
                      opacity={!code || isLoadingInfo ? 0.5 : 1}
                    >
                      <Text col="white" fontSize={16} fontWeight="700">
                        {isLoadingInfo ? "Checking..." : "Next"}
                      </Text>
                    </Button>
                  </YStack>
                </YStack>
              ) : (
                /* Input member name */
                <YStack gap="$4">
                  <YStack gap="$1" ai="center">
                    <Text fontSize={28} fontWeight="800" col="$color">
                      You&apos;re invited!
                    </Text>
                    {teamInfo && <TeamAvatarInfo teamInfo={teamInfo} />}
                  </YStack>

                  <YStack gap="$0.5">
                    <Label fontSize={12} col="$colorSubtle" fontWeight="bold">
                      DISPLAY NAME
                    </Label>
                    <Input
                      size="$4"
                      value={memberName}
                      onChangeText={setMemberName}
                      placeholder="What should others call you?"
                      autoFocus
                    />
                  </YStack>

                  <YStack gap="$3" mt="$2">
                    <Button
                      bg="$blue9"
                      size="$4"
                      br="$5"
                      onPress={handleJoin}
                      disabled={!memberName || isJoining}
                      opacity={!memberName || isJoining ? 0.5 : 1}
                    >
                      <Text col="white" fontSize={16} fontWeight="700">
                        {isJoining ? "Joining..." : "Join Team"}
                      </Text>
                    </Button>
                  </YStack>
                </YStack>
              )}
            </YStack>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

function TeamAvatarInfo({ teamInfo }: { teamInfo: InvitationInfoResponse }) {
  const { initials, color } = getInitials(teamInfo.teamName);

  return (
    <YStack ai="center" mt="$4" mb="$2" gap="$3">
      <Avatar circular size="$8" bg={color}>
        <Text col="white" fontSize={28} fontWeight="800">
          {initials}
        </Text>
      </Avatar>
      <YStack ai="center" gap="$1">
        <Text fontSize={20} fontWeight="bold" col="$color">
          {teamInfo.teamName}
        </Text>
        <Text fontSize={14} col="$colorSubtle">
          {teamInfo.memberCount} members
        </Text>
      </YStack>
    </YStack>
  );
}
