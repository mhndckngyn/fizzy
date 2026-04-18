import React from "react";
import { ScrollView } from "react-native";
import { Text, View, XStack, YStack } from "tamagui";
import { Card } from "../../cards/types";

interface BoardSpecialColumnProps {
  name: "Not Now" | "Maybe" | "Done";
  cards: Card[];
  width: number;
}

export function BoardSpecialColumn({
  name,
  cards,
  width,
}: BoardSpecialColumnProps) {
  return (
    <YStack width={width} bg="$color2" br="$4" p="$3">
      {/* Column Header */}
      <XStack ai="center" gap="$2" mb="$3">
        {/* TODO select different color if needed */}
        <View width={12} height={12} br="$10" bg="$accentBackground" />
        <Text fontSize={16} fontWeight="bold" col="$color">
          {name}
        </Text>
      </XStack>

      {/* Cards Area */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack gap="$2" flex={1}>
          {/* Card list goes here */}
        </YStack>
      </ScrollView>
    </YStack>
  );
}
