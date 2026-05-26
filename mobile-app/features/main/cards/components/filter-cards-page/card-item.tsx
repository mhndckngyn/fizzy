import { getInitials, getTextTint } from "@/features/main/_shared/helpers";
import { CardSummary } from "@/features/main/cards/use-filter-cards";
import { MessageSquare, RefreshCw } from "@tamagui/lucide-icons-2";
import { TouchableOpacity } from "react-native";
import { Avatar, Separator, Text, View, XStack, YStack } from "tamagui";

function daysAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  return days;
}

function updatedLabel(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "TODAY";
  if (days === 1) return "YESTERDAY";
  if (days < 7) return `${days} DAYS AGO`;
  return `${Math.floor(days / 7)}W AGO`;
}

export function CardItem({
  card,
  onPress,
}: {
  card: CardSummary;
  onPress: () => void;
}) {
  const colColor = card.columnColor ?? "#3d4e65";
  const boardName = card.boardName?.toUpperCase() ?? "";
  const colName = card.columnName?.toUpperCase() ?? "";
  const creatorName = card.assignees?.[0]?.name ?? card.creatorName ?? "";
  const addedDays = daysAgo(card.createdAt);
  const updatedText = updatedLabel(card.updatedAt ?? card.createdAt);
  const bgColor = `${colColor}18`;
  const { initials, color } = getInitials(card.creatorName);
  const comCount = card.commentsCount ?? 0;
  const textColor = getTextTint(colColor);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.78}>
      <View backgroundColor={bgColor} borderRadius="$2" overflow="hidden">
        <XStack ai="center" jc="space-between">
          <XStack
            ai="center"
            backgroundColor={colColor}
            gap="$2"
            paddingHorizontal="$2.5"
            paddingVertical="$1"
            borderTopLeftRadius="$2"
            borderBottomRightRadius="$2"
          >
            <XStack ai="center" px="$2.5" py="$1.5" gap="$2">
              <Text color="white" fontWeight="900" fontSize={13}>
                {card.no}
              </Text>
              <Separator
                vertical
                borderColor="rgba(255,255,255,0.4)"
                height={12}
              />
              <Text
                color="white"
                fontWeight="700"
                fontSize={11}
                letterSpacing={0.8}
              >
                {boardName}
              </Text>
            </XStack>
          </XStack>

          <View
            backgroundColor={bgColor}
            px="$2.5"
            py="$1.5"
            borderBottomLeftRadius={8}
          >
            <Text
              fontSize={11}
              fontWeight="800"
              color={textColor}
              letterSpacing={0.5}
            >
              {colName}
            </Text>
          </View>
        </XStack>

        <YStack px="$3" pt="$2.5" pb="$3" gap="$2">
          <Text
            fontWeight="700"
            fontSize={15}
            color={textColor}
            numberOfLines={2}
            lineHeight={22}
          >
            {card.title ?? "(Untitled)"}
          </Text>

          {card.tags?.length > 0 && (
            <XStack gap="$1.5" flexWrap="wrap">
              {card.tags.map((tag) => (
                <View
                  key={tag.tagId}
                  backgroundColor={tag.color + "30"}
                  borderRadius={4}
                  px="$1.5"
                  py="$0.5"
                >
                  <Text fontSize={10} fontWeight="700" color={tag.color}>
                    {tag.title}
                  </Text>
                </View>
              ))}
            </XStack>
          )}

          <XStack ai="flex-end" jc="space-between" mt="$0.5">
            <XStack ai="center" gap="$2" flex={1}>
              <Avatar circular size="$3" borderWidth={0}>
                <Avatar.Fallback
                  ai="center"
                  jc="center"
                  backgroundColor={color}
                >
                  <Text color="white" fontWeight="bold" fontSize={15}>
                    {initials}
                  </Text>
                </Avatar.Fallback>
              </Avatar>

              <YStack gap="$1">
                <XStack ai="center" gap="$2">
                  <Text fontSize={11} color={textColor} fontWeight="600">
                    ADDED {addedDays} DAYS AGO
                  </Text>

                  <Separator vertical borderColor={colColor} height={12} />

                  <RefreshCw size={11} color={colColor} />

                  <Text fontSize={11} color={textColor} fontWeight="600">
                    {updatedText}
                  </Text>
                </XStack>
                {creatorName ? (
                  <Text
                    fontSize={11}
                    color={textColor}
                    fontWeight="600"
                    ml="$0.5"
                  >
                    {creatorName.toUpperCase()}
                  </Text>
                ) : null}
              </YStack>
            </XStack>

            {comCount > 0 && (
              <XStack ai="center" gap="$1" borderRadius="$2" px="$1.5" py="$1">
                <MessageSquare size={15} color={colColor} />
                <Text fontSize={15} fontWeight="700" color={textColor}>
                  {comCount}
                </Text>
              </XStack>
            )}
          </XStack>
        </YStack>
      </View>
    </TouchableOpacity>
  );
}
