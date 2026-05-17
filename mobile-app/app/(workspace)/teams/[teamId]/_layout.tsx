import { useCurrentTeamParams } from "@/features/main/_shared/hooks";
import { useCurrentMemberStore } from "@/features/main/members/use-current-member-store";
import { useNotification } from "@/features/main/notifications/use-notifications";
import { useTeams } from "@/features/main/teams/use-teams";
import { Bell, Pin } from "@tamagui/lucide-icons-2";
import { Link, Slot, usePathname } from "expo-router";
import { useEffect } from "react";
import { Text, View, YStack } from "tamagui";

const ICON_COLOR = "#3c4b61";

export default function TeamLayout() {
  const { teamId } = useCurrentTeamParams();
  const { data: notificationData } = useNotification(teamId);
  const { data: teamsData } = useTeams();
  const pathname = usePathname();

  const fetchCurrentMember = useCurrentMemberStore((s) => s.fetch);
  const resetCurrentMember = useCurrentMemberStore((s) => s.reset);

  useEffect(() => {
    fetchCurrentMember(teamId);
    return resetCurrentMember;
  }, [teamId, fetchCurrentMember, resetCurrentMember]);

  const hasUnread = notificationData?.notifications.some((n) => !n.readAt);
  const isPinned = pathname.endsWith("/pinned");
  const isNotifications = pathname.endsWith("/notifications");
  const teamName = teamsData?.teams.find((t) => t.teamId === teamId)?.name;

  return (
    <YStack f={1}>
      <View f={1}>
        <Slot />
      </View>

      <View
        backgroundColor="$background"
        borderTopWidth={1}
        borderTopColor="$gray4"
        height={52}
        flexDirection="row"
        alignItems="center"
        paddingHorizontal="$4"
        justifyContent="space-between"
      >
        <Link href={`/teams/${teamId}/pinned`} asChild>
          <View pressStyle={{ opacity: 0.5 }} cursor="pointer">
            <Pin
              size={22}
              color={ICON_COLOR}
              fill={isPinned ? ICON_COLOR : "transparent"}
            />
          </View>
        </Link>

        {!!teamName && (
          <Text
            fontSize="$5"
            fontWeight="700"
            textAlign="center"
            color={ICON_COLOR}
          >
            {teamName}
          </Text>
        )}

        <Link href={`/teams/${teamId}/notifications`} asChild>
          <View
            pressStyle={{ opacity: 0.5 }}
            cursor="pointer"
            position="relative"
          >
            <Bell
              size={22}
              color={ICON_COLOR}
              fill={isNotifications ? ICON_COLOR : "transparent"}
            />
            {hasUnread && (
              <View
                position="absolute"
                top={-2}
                right={0}
                width={10}
                height={10}
                borderRadius={5}
                backgroundColor="$red9"
              />
            )}
          </View>
        </Link>
      </View>
    </YStack>
  );
}
