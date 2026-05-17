import { useHeaderStore } from "@/components/workspace-header/use-header-store";
import { useCurrentTeamParams } from "@/features/main/_shared/hooks";
import { usePinnedCards } from "@/features/main/pins/use-pins";
import {
  Plus,
  SquareKanban,
  Pin,
  SlidersHorizontal,
  Bell,
  X,
  LayoutGrid,
} from "@tamagui/lucide-icons-2";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { TouchableOpacity } from "react-native";
import { Text, View, YStack } from "tamagui";

export default function TeamHomepage() {
  const router = useRouter();
  const { teamId } = useCurrentTeamParams();

  const setHeader = useHeaderStore((s) => s.setHeader);
  const resetHeader = useHeaderStore((s) => s.resetHeader);
  const { data: pinnedCards } = usePinnedCards();
  const [menuOpen, setMenuOpen] = useState(false);

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

      <YStack position="absolute" bottom={36} right={24} ai="center" gap="$3">
        {menuOpen && (
          <>
            <TouchableOpacity
              onPress={() => {
                setMenuOpen(false);
                router.push(`/teams/${teamId}/filter-cards`);
              }}
              activeOpacity={0.7}
            >
              <View
                backgroundColor="#dbeafe"
                borderWidth={0.5}
                borderColor="#93c5fd"
                borderRadius="$10"
                width={54}
                height={54}
                ai="center"
                jc="center"
              >
                <SlidersHorizontal size={24} color="#1d4ed8" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setMenuOpen(false);
                //router.push(`/teams/${teamId}/notifications`);
              }}
              activeOpacity={0.7}
            >
              <View
                backgroundColor="#fef9c3"
                borderWidth={0.5}
                borderColor="#fde047"
                borderRadius="$10"
                width={54}
                height={54}
                ai="center"
                jc="center"
              >
                <Bell size={24} color="#a16207" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setMenuOpen(false);
                router.push(`/teams/${teamId}/pinned`);
              }}
              activeOpacity={0.7}
            >
              <View>
                <View
                  backgroundColor="#dcfce7"
                  borderWidth={0.5}
                  borderColor="#86efac"
                  borderRadius="$10"
                  width={54}
                  height={54}
                  ai="center"
                  jc="center"
                >
                  <Pin size={24} color="#15803d" />
                </View>
                {!!pinnedCards?.length && (
                  <View
                    position="absolute"
                    top={-5}
                    right={-5}
                    backgroundColor="#15803d"
                    borderRadius="$10"
                    minWidth={20}
                    height={20}
                    paddingHorizontal="$1"
                    ai="center"
                    jc="center"
                  >
                    <Text fontSize={11} fontWeight="700" color="white">
                      {pinnedCards.length}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          onPress={() => setMenuOpen((prev) => !prev)}
          activeOpacity={0.7}
        >
          <View
            backgroundColor={menuOpen ? "#fce7f3" : "#3d4e6518"}
            borderWidth={0.5}
            borderColor={menuOpen ? "#f9a8d4" : "#3d4e6550"}
            borderRadius="$10"
            width={54}
            height={54}
            ai="center"
            jc="center"
          >
            {menuOpen ? (
              <X size={24} color="#be185d" />
            ) : (
              <LayoutGrid size={24} color="#3d4e65" />
            )}
          </View>
        </TouchableOpacity>
      </YStack>
    </View>
  );
}
