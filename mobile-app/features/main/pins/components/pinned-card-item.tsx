import { getDarkTint } from "@/features/main/_shared/helpers";
import { PinnedCard } from "@/features/main/pins/use-pins";
import { Link } from "expo-router";
import { Separator, Text, View, XStack, YStack } from "tamagui";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export function PinnedCardItem({
  pin,
  teamId,
}: {
  pin: PinnedCard;
  teamId: string;
}) {
  const columnColor = pin.columnColor ?? "#3d4e65";
  const bgColor = `${columnColor}18`;
  const columnName = pin.columnName?.toUpperCase() ?? "";
  const titleColor = pin.columnColor ? getDarkTint(pin.columnColor) : "$gray12";

  return (
    <Link href={`/teams/${teamId}/cards/${pin.cardId}`} asChild>
      <View
        backgroundColor={bgColor}
        borderRadius="$1"
        overflow="hidden"
        pressStyle={{ opacity: 0.75 }}
        cursor="pointer"
      >
        <XStack ai="stretch">
          <XStack
            ai="center"
            gap="$2"
            backgroundColor={columnColor}
            paddingHorizontal="$2.5"
            paddingVertical="$1"
            borderTopLeftRadius="$1"
            borderBottomRightRadius="$1"
          >
            <Text color="white" fontWeight="900" fontSize="$1">
              {pin.no}
            </Text>
            <Separator vertical borderColor="white" opacity={0.5} height={12} />
            <Text
              color="white"
              fontWeight="700"
              fontSize="$1"
              textTransform="uppercase"
              letterSpacing={1}
            >
              {pin.boardName}
            </Text>
          </XStack>

          <View flex={1} />

          {!!columnName && (
            <XStack
              ai="center"
              backgroundColor={columnColor}
              paddingHorizontal="$2.5"
              paddingVertical="$1"
              borderTopRightRadius="$1"
              borderBottomLeftRadius="$1"
            >
              <Text
                color="white"
                fontWeight="800"
                fontSize="$1"
                letterSpacing={0.5}
              >
                {columnName}
              </Text>
            </XStack>
          )}
        </XStack>

        <YStack
          paddingHorizontal="$3"
          paddingTop="$2.5"
          paddingBottom="$3"
          gap="$1"
        >
          <Text
            fontWeight="700"
            fontSize="$5"
            color={titleColor}
            numberOfLines={2}
          >
            {pin.title ?? "(Untitled)"}
          </Text>
          <Text fontSize="$3" color="$gray9">
            {timeAgo(pin.updatedAt || pin.pinnedAt)}
          </Text>
        </YStack>
      </View>
    </Link>
  );
}
