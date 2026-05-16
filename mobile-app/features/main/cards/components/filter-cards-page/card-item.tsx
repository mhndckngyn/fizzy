import { TouchableOpacity } from "react-native";
import { View, Text, XStack, YStack, Separator } from "tamagui";
import { RefreshCw } from "@tamagui/lucide-icons-2";
import { CardSummary } from "@/features/main/cards/use-filter-cards";

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

function AvatarCircle({ name, color }: { name: string; color: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <View
      width={36}
      height={36}
      borderRadius={18}
      backgroundColor={color + "90"}
      ai="center"
      jc="center"
    >
      <Text color="white" fontSize={12} fontWeight="700">
        {initials}
      </Text>
    </View>
  );
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
              color={colColor}
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
            color={colColor}
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

          <XStack ai="center" gap="$2" mt="$0.5">
            {creatorName ? (
              <AvatarCircle name={creatorName} color={colColor} />
            ) : null}

            <YStack gap="$1">
              <XStack ai="center" gap="$2">
                <Text fontSize={11} color={colColor} fontWeight="600">
                  ADDED {addedDays} DAYS AGO
                </Text>

                <Separator vertical borderColor={colColor} height={12} />

                <RefreshCw size={11} color={colColor} />

                <Text fontSize={11} color={colColor} fontWeight="600">
                  {updatedText}
                </Text>
              </XStack>
              {creatorName ? (
                <Text fontSize={11} color={colColor} fontWeight="600" ml="$0.5">
                  {creatorName.toUpperCase()}
                </Text>
              ) : null}
            </YStack>
          </XStack>
        </YStack>
      </View>
    </TouchableOpacity>
  );
}
