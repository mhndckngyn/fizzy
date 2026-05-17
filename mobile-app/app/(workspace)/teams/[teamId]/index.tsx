import { useHeaderStore } from "@/components/workspace-header/use-header-store";
import { useCurrentTeamParams } from "@/features/main/_shared/hooks";
import { Plus, SquareKanban } from "@tamagui/lucide-icons-2";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback } from "react";
import { Text, View } from "tamagui";

export default function TeamHomepage() {
  const router = useRouter();
  const { teamId } = useCurrentTeamParams();

  const setHeader = useHeaderStore((s) => s.setHeader);
  const resetHeader = useHeaderStore((s) => s.resetHeader);
  useFocusEffect(
    useCallback(() => {
      setHeader({
        leftAction: {
          icon: Plus,
          onPress: () => router.push(`/teams/${teamId}/cards/create`),
        },
        rightAction: {
          icon: SquareKanban,
          onPress: () => router.push(`/teams/${teamId}/boards/create`),
        },
      });

      return resetHeader;
    }, [teamId, setHeader, resetHeader, router]),
  );

  return (
    <View f={1} bg="$background">
      <Text>Wow, such empty</Text>
    </View>
  );
}
