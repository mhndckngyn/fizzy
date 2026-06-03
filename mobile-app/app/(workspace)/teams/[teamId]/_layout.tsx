import { TeamBottomBar } from "@/components/team-bottom-bar";
import { useCurrentTeamParams } from "@/features/main/_shared/hooks";
import { useCurrentMemberStore } from "@/features/main/members/use-current-member-store";
import { Slot } from "expo-router";
import { useEffect } from "react";
import { YStack, View } from "tamagui";

export default function TeamLayout() {
  const { teamId } = useCurrentTeamParams();
  const fetchCurrentMember = useCurrentMemberStore((s) => s.fetch);
  const resetCurrentMember = useCurrentMemberStore((s) => s.reset);

  useEffect(() => {
    fetchCurrentMember(teamId);
    return resetCurrentMember;
  }, [teamId, fetchCurrentMember, resetCurrentMember]);

  return (
    <YStack f={1}>
      <View f={1}>
        <Slot />
      </View>
      <TeamBottomBar />
    </YStack>
  );
}
