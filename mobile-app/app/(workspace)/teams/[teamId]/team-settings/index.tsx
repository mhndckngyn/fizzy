import { useHeaderStore } from "@/components/workspace-header/use-header-store";
import { useCurrentMemberStore } from "@/features/main/members/use-current-member-store";
import { MembersSection } from "@/features/main/team-settings/components/members-section";
import { TeamNameSection } from "@/features/main/team-settings/components/team-name-section";
import { ArrowLeft } from "@tamagui/lucide-icons-2";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import { ScrollView, Separator, YStack, Text } from "tamagui";

export default function TeamSettingsScreen() {
  const router = useRouter();
  const setHeader = useHeaderStore((s) => s.setHeader);
  const resetHeader = useHeaderStore((s) => s.resetHeader);
  const canManageTeam = useCurrentMemberStore(
    (s) => s.currentMember?.canManageTeam ?? false,
  );

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
        <YStack px="$4" pb="$4" gap="$4">
          <TeamNameSection canEdit={canManageTeam} />
          <Separator borderColor="$gray4" />
          <MembersSection />
        </YStack>
      </ScrollView>
    </YStack>
  );
}
