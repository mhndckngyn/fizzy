import { useHeaderStore } from "@/components/workspace-header/use-header-store";
import { useCurrentTeamParams } from "@/features/main/_shared/hooks";
import { usePinnedCards } from "@/features/main/pins/use-pins";
import { Plus, SquareKanban, Pin } from "@tamagui/lucide-icons-2";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback } from "react";
import { TouchableOpacity } from "react-native";
import { Text, View, XStack } from "tamagui";

export default function TeamHomepage() {
  const router = useRouter();
  const { teamId } = useCurrentTeamParams();

  const setHeader = useHeaderStore((s) => s.setHeader);
  const resetHeader = useHeaderStore((s) => s.resetHeader);
  const { data: pinnedCards } = usePinnedCards();

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

      {/* Pinned shortcut */}
      <TouchableOpacity
        onPress={() => router.push(`/teams/${teamId}/pinned`)}
        style={{ position: "absolute", bottom: 24, left: 16 }}
        activeOpacity={0.7}
      >
        <XStack
          ai="center"
          gap="$2"
          backgroundColor="$gray3"
          borderWidth={0.5}
          borderColor="$gray5"
          borderRadius="$10"
          paddingHorizontal="$3"
          paddingVertical="$2"
        >
          <Pin size={16} color={pinnedCards?.length ? "$yellow10" : "$gray9"} />
          <Text fontSize={13} fontWeight="600" color="$gray11">
            Pinned
          </Text>
          {!!pinnedCards?.length && (
            <View
              backgroundColor="$yellow9"
              borderRadius="$10"
              paddingHorizontal="$1.5"
              minWidth={18}
              height={18}
              ai="center"
              jc="center"
            >
              <Text fontSize={10} fontWeight="700" color="white">
                {pinnedCards.length}
              </Text>
            </View>
          )}
        </XStack>
      </TouchableOpacity>
    </View>
  );
}
