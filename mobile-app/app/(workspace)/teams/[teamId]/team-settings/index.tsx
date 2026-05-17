import { useHeaderStore } from "@/components/workspace-header/use-header-store";
import { MembersSection } from "@/features/main/team-settings/components/members-section";
import { ArrowLeft } from "@tamagui/lucide-icons-2";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import { ScrollView, YStack, Text } from "tamagui";

export default function TeamSettingsScreen() {
  const router = useRouter();
  const setHeader = useHeaderStore((s) => s.setHeader);
  const resetHeader = useHeaderStore((s) => s.resetHeader);

  useFocusEffect(
    useCallback(() => {
      setHeader({
        leftAction: { icon: ArrowLeft, onPress: () => router.back() },
      });
      return resetHeader;
    }, [setHeader, resetHeader, router]),
  );

  return (
    <YStack f={1} bg="$background">
      <YStack px="$4" paddingBlock="$3">
        <Text fontSize="$6" fontWeight="700" color="$color" textAlign="center">
          Team Settings
        </Text>
      </YStack>

      <ScrollView>
        <YStack px="$4" pb="$4">
          <MembersSection />
        </YStack>
      </ScrollView>
    </YStack>
  );
}
