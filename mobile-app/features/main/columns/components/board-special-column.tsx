import React from "react";
import { ScrollView } from "react-native";
import { Text, XStack, YStack } from "tamagui";
import CardPreview from "../../cards/components/card-preview";
import { Card } from "../../cards/types";

interface BoardSpecialColumnProps {
  name: "Not Now" | "Maybe" | "Done";
  cards: Card[];
  boardName: string;
  width: number;
}

export function BoardSpecialColumn({
  name,
  cards,
  boardName,
  width,
}: BoardSpecialColumnProps) {
  return (
    <YStack width={width} bg="$color2" br="$4" p="$3">
      {/* Column Header */}
      <XStack ai="center" gap="$2" mb="$3">
        <Text fontSize={16} fontWeight="bold" col="$color">
          {name} ({cards.length})
        </Text>
      </XStack>

      {/* Cards Area */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack gap="$2" flex={1}>
          {cards.map((card) => (
            <CardPreview
              key={card.cardId}
              card={card}
              columnColor="#3d4e65"
              boardName={boardName}
            />
          ))}
        </YStack>
      </ScrollView>
    </YStack>
  );
}
