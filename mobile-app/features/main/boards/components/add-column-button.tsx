import { Plus } from "@tamagui/lucide-icons-2";
import React from "react";
import { Text, View, XStack, YStack } from "tamagui";

interface AddColumnButtonProps {
  onPress: () => void;
}

export default function AddColumnButton({ onPress }: AddColumnButtonProps) {
  return (
    <YStack
      width={60}
      bg="$color2"
      br="$4"
      ai="center"
      jc="center"
      pressStyle={{ opacity: 0.7 }}
      onPress={onPress}
    >
      <View
        width={200}
        ai="center"
        jc="center"
        style={{ transform: [{ rotate: "90deg" }] }}
      >
        <XStack ai="center" gap="$2">
          <Plus size={20} col="$color" />
          <Text fontSize={16} fontWeight="bold" col="$color">
            Add a column
          </Text>
        </XStack>
      </View>
    </YStack>
  );
}
