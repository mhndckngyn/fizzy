import { getTextTint, getInitials } from "@/features/main/_shared/helpers";
import { Notification } from "@/features/main/notifications/types";
import { useReadNotification } from "@/features/main/notifications/use-read-notification";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";
import { Separator, Text, View, XStack, YStack } from "tamagui";
const CARD_COLOR = "#3d4e65";

export function NotificationItem({
  item,
  teamId,
}: {
  item: Notification;
  teamId: string;
}) {
  const themeColor = item.columnColor ?? CARD_COLOR;
  const bgColor = `${themeColor}18`;
  const actorName = item.actorName ?? "Someone";
  const { initials, color } = getInitials(actorName);
  const titleColor = getTextTint(themeColor);
  const isUnread = !item.readAt;
  const router = useRouter();
  const { mutate: readNotification } = useReadNotification(teamId);

  const handlePress = () => {
    readNotification(item.notificationId);
    router.push(`/teams/${teamId}/cards/${item.cardId}`);
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.75}>
      <View backgroundColor={bgColor} borderRadius="$1" overflow="hidden">
        {/* Header row */}
        <XStack>
          <XStack
            alignSelf="flex-start"
            ai="center"
            gap="$2"
            backgroundColor={themeColor}
            paddingHorizontal="$2.5"
            paddingVertical="$1"
            borderTopLeftRadius="$1"
            borderBottomRightRadius="$1"
          >
            <Text color="white" fontWeight="900" fontSize="$1">
              {item.cardNo}
            </Text>
            <Separator vertical borderColor="white" opacity={0.5} height={12} />
            <Text
              color="white"
              fontWeight="700"
              fontSize="$1"
              textTransform="uppercase"
              letterSpacing={1}
            >
              {item.boardName}
            </Text>
          </XStack>

          <View flex={1} />

          <XStack
            ai="center"
            gap="$1.5"
            paddingHorizontal="$2"
            paddingBottom="$1"
            paddingTop="$1"
          >
            <Text fontSize="$2" color="$gray11">
              {format(new Date(item.updatedAt), "MMM dd")}
            </Text>
            {isUnread && (
              <View
                backgroundColor="$red9"
                borderRadius="$10"
                minWidth={16}
                height={16}
                paddingHorizontal={item.unreadCount > 1 ? 4 : 0}
                ai="center"
                jc="center"
              >
                {item.unreadCount > 1 && (
                  <Text fontSize={11} fontWeight="700" color="white">
                    {item.unreadCount}
                  </Text>
                )}
              </View>
            )}
          </XStack>
        </XStack>

        {/* Body */}
        <XStack
          paddingHorizontal="$3"
          paddingTop="$2"
          paddingBottom="$3"
          gap="$3"
          ai="center"
        >
          <View
            width={36}
            height={36}
            borderRadius={18}
            backgroundColor={color}
            ai="center"
            jc="center"
            flexShrink={0}
          >
            <Text fontSize="$4" fontWeight="700" color="white">
              {initials}
            </Text>
          </View>

          <YStack flex={1} gap="$0.5">
            <Text
              fontWeight="700"
              fontSize="$5"
              color={titleColor}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text fontSize="$3" color={titleColor} numberOfLines={2}>
              {item.description}
            </Text>
          </YStack>
        </XStack>
      </View>
    </TouchableOpacity>
  );
}
