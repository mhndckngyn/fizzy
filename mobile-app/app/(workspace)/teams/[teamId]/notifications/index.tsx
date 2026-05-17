import { useHeaderStore } from "@/components/workspace-header/use-header-store";
import { useCurrentTeamParams } from "@/features/main/_shared/hooks";
import { NotificationItem } from "@/features/main/notifications/components/notification-item";
import { useNotification } from "@/features/main/notifications/use-notifications";
import { ArrowLeft } from "@tamagui/lucide-icons-2";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import { ScrollView, Spinner, Text, View, YStack } from "tamagui";

export default function NotificationsScreen() {
  const { teamId } = useCurrentTeamParams();
  const router = useRouter();
  const setHeader = useHeaderStore((s) => s.setHeader);
  const resetHeader = useHeaderStore((s) => s.resetHeader);

  const { data, isLoading } = useNotification(teamId);

  useFocusEffect(
    useCallback(() => {
      setHeader({
        leftAction: { icon: ArrowLeft, onPress: () => router.back() },
      });
      return resetHeader;
    }, [setHeader, resetHeader, router]),
  );

  if (isLoading) {
    return (
      <View f={1} ai="center" jc="center">
        <Spinner size="large" />
      </View>
    );
  }

  const notifications = data?.notifications ?? [];
  const unread = notifications.filter((n) => !n.readAt);
  const read = notifications.filter((n) => !!n.readAt);

  if (!notifications.length) {
    return (
      <View f={1} ai="center" jc="center">
        <Text color="$gray9" fontSize="$3">
          No notifications
        </Text>
      </View>
    );
  }

  return (
    <ScrollView>
      <YStack p="$3" gap="$2.5">
        {unread.length > 0 && (
          <>
            <Text
              fontSize="$3"
              fontWeight="700"
              color="$gray11"
              letterSpacing={0.5}
              textTransform="uppercase"
            >
              New for you
            </Text>
            {unread.map((n) => (
              <NotificationItem
                key={n.notificationId}
                item={n}
                teamId={teamId}
              />
            ))}
          </>
        )}

        {read.length > 0 && (
          <>
            <Text
              fontSize="$3"
              fontWeight="700"
              color="$gray9"
              letterSpacing={0.5}
              textTransform="uppercase"
              marginTop={unread.length > 0 ? "$2" : 0}
            >
              Previously seen
            </Text>
            {read.map((n) => (
              <NotificationItem
                key={n.notificationId}
                item={n}
                teamId={teamId}
              />
            ))}
          </>
        )}
      </YStack>
    </ScrollView>
  );
}
