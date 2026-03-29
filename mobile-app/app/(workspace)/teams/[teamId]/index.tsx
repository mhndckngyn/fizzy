import { useHeaderStore } from "@/components/workspace-header/use-header-store";
import { Plus, SquareKanban } from "@tamagui/lucide-icons-2";
import { useFocusEffect } from "expo-router";
import React, { useCallback } from "react";
import { Text, View } from "tamagui";

export default function TeamHomepage() {
  const setHeader = useHeaderStore((s) => s.setHeader);
  const resetHeader = useHeaderStore((s) => s.resetHeader);

  useFocusEffect(
    useCallback(() => {
      setHeader({
        leftAction: {
          icon: Plus,
          onPress: () => console.log("TODO: Navigate to create card"),
        },
        rightAction: {
          icon: SquareKanban,
          onPress: () => console.log("TODO: Navigate to add board"),
        },
      });

      return resetHeader;
    }, [setHeader, resetHeader]),
  );

  return (
    <View f={1} bg="$background">
      <Text>Wow, such empty</Text>
    </View>
  );
}
