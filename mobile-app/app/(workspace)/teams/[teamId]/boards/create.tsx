import { useCurrentTeamParams } from "@/features/main/_shared/hooks";
import { useCreateBoard } from "@/features/main/boards/hooks";
import { ArrowRight } from "@tamagui/lucide-icons-2";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import { Button, Input, Text, View, XStack, YStack } from "tamagui";

export default function CreateBoard() {
  const router = useRouter();

  const { teamId } = useCurrentTeamParams();

  const { mutate, isPending, error } = useCreateBoard();

  const [boardName, setBoardName] = useState("");

  const handleCreate = () => {
    if (!boardName.trim()) {
      return;
    }

    mutate(
      { name: boardName },
      {
        onSuccess: (data) => {
          router.push(`/teams/${teamId}/boards/${data.boardId}`);
        },
      },
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View flex={1} px="$5" minHeight="100%">
            <YStack flex={1} jc="center" gap="$5" py="$8">
              <Text ta="center" fontSize={28} fontWeight="800" col="$color">
                Create a new board
              </Text>

              <YStack gap="$3">
                <Input
                  placeholder="Name it..."
                  placeholderTextColor="$color8"
                  value={boardName}
                  onChangeText={setBoardName}
                  size="$4"
                />

                <Button
                  bg="$blue9"
                  size="$4"
                  br="$5"
                  onPress={handleCreate}
                  disabled={!boardName.trim() || isPending}
                  opacity={!boardName.trim() || isPending ? 0.5 : 1}
                >
                  {isPending ? (
                    <Text col="white" fontSize={16} fontWeight="bold">
                      Creating...
                    </Text>
                  ) : (
                    <XStack alignItems="center" gap="$1">
                      <Text col="white" fontSize={16} fontWeight="bold">
                        Create board
                      </Text>
                      <ArrowRight col="white" size={16} />
                    </XStack>
                  )}
                </Button>
              </YStack>
            </YStack>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
