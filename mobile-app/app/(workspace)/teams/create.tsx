import { useCreateTeam } from "@/features/main/teams/use-create-team";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import { Button, Input, Label, Text, View, YStack } from "tamagui";

export default function CreateTeam() {
  const router = useRouter();

  const { mutate, isPending, error } = useCreateTeam();

  const [teamName, setTeamName] = useState("");
  const [memberName, setMemberName] = useState("");

  const handleCreate = () => {
    if (!teamName.trim()) return;

    mutate(
      { teamName, memberName },
      {
        onSuccess: (data) => {
          router.replace(`/teams/${data.teamId}`);
        },
      },
    );
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
            <YStack gap="$5" py="$4">
              {/* Header */}
              <YStack gap="$1" ai="center">
                <Text fontSize={28} fontWeight="800" col="$color">
                  New team
                </Text>
                <Text fontSize={15} col="$colorSubtle" ta="center">
                  Create a workspace for your crew.
                </Text>
              </YStack>

              <View
                bg="$yellow2"
                bw={1}
                bc="$yellow5"
                br="$4"
                p="$4"
                shadowColor="$shadowColor"
              >
                <Text fontSize={13} lh={18} ta="center">
                  💡 {"You'll be the "}
                  <Text fontWeight="700">Owner</Text>
                  {" of this team. You can invite members later."}
                </Text>
              </View>

              <YStack gap="$2">
                {/* Team Name Field */}
                <YStack gap="$0.5">
                  <Label fontSize={12} col="$colorSubtle" fontWeight="bold">
                    TEAM NAME
                  </Label>
                  <Input
                    placeholder="Apollo Crew"
                    placeholderTextColor="$color8"
                    value={teamName}
                    onChangeText={setTeamName}
                    size="$4"
                  />
                </YStack>

                {/* Member Name Field */}
                <YStack gap="$0.5">
                  <Label fontSize={12} col="$colorSubtle" fontWeight="bold">
                    DISPLAY NAME
                  </Label>
                  <Input
                    placeholder="What should others call you?"
                    placeholderTextColor="$color8"
                    value={memberName}
                    onChangeText={setMemberName}
                    size="$4"
                  />
                </YStack>
              </YStack>

              {/* Actions */}
              <Button
                bg="$blue9"
                size="$4"
                br="$5"
                onPress={handleCreate}
                disabled={!teamName.trim() || isPending}
                opacity={!teamName.trim() || isPending ? 0.5 : 1}
              >
                <Text col="white" fontSize={16} fontWeight="700">
                  {isPending ? "Creating..." : "Create Team"}
                </Text>
              </Button>
            </YStack>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
