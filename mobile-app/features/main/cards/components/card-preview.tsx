import { RotateCcw, StarFull } from "@tamagui/lucide-icons-2";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { useRouter } from "expo-router";
import { Separator, Text, XStack, YStack } from "tamagui";
import { useCurrentTeamParams } from "../../_shared/hooks";
import { Card } from "../types";

interface CardPreviewProps {
  card: Card;
  boardName: string;
  columnColor: string;
}

export default function CardPreview({
  card,
  boardName,
  columnColor,
}: CardPreviewProps) {
  const router = useRouter();

  const { teamId } = useCurrentTeamParams();

  const handlePress = () => {
    router.push(`/teams/${teamId}/cards/${card.cardId}`);
  };

  // Create a light version of the column color for the background
  const backgroundColor = `${columnColor}15`; // 15 is ~8% opacity in hex

  const createdAtLabel = `Added ${formatDistanceToNow(card.createdAt)} ago`;

  const isAboutToClose =
    card.autoClosePeriodDays > 0 &&
    card.notNowId == null &&
    (() => {
      const daysInactive = differenceInCalendarDays(
        new Date(),
        parseISO(card.lastActiveAt),
      );
      const daysLeft = card.autoClosePeriodDays - daysInactive;
      return (
        daysLeft >= 0 && daysLeft <= Math.ceil(card.autoClosePeriodDays / 2)
      );
    })();

  // Updated at with first letter capitalized
  const rawLabel =
    (card.updatedAt
      ? formatDistanceToNow(new Date(card.updatedAt))
      : formatDistanceToNow(new Date(card.createdAt))) + " ago";
  const updatedAtLabel = rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1);

  return (
    <YStack
      onPress={handlePress} // 2. Add the trigger
      pressStyle={{ opacity: 0.85, scale: 0.98 }} // 3. Add feedback
      hoverStyle={{ cursor: "pointer", borderColor: columnColor }}
      backgroundColor={backgroundColor}
      borderWidth={1}
      borderColor={"$gray7"}
      borderRadius="$1.5"
      overflow="hidden"
      width="100%"
      shadowColor="$shadowColor"
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.1}
    >
      {/* Header Bar */}
      <XStack ai="center" paddingRight="$2">
        <XStack
          gap="$2"
          ai="center"
          backgroundColor={columnColor}
          paddingHorizontal="$3"
          paddingVertical="$1.5"
          borderBottomRightRadius="$1"
          display={"inline"}
        >
          <Text color="white" fontWeight="900" fontSize="$1">
            {card.no}
          </Text>
          <Separator vertical borderColor="white" opacity={0.5} height={15} />
          <Text
            color="white"
            fontWeight="700"
            fontSize="$1"
            textTransform="uppercase"
            letterSpacing={1}
          >
            {boardName}
          </Text>
        </XStack>

        <XStack flex={1} />

        <XStack mt={4} gap="$1.5">
          {card.isGolden && (
            <StarFull size={18} color="#efbb00" style={{ marginRight: 6 }} />
          )}

          {isAboutToClose && (
            <XStack
              width={18}
              height={18}
              borderRadius={10}
              backgroundColor="#e8a020"
              ai="center"
              jc="center"
              mr="$2"
            >
              <Text
                color="white"
                fontWeight="900"
                fontSize={12}
                lineHeight={13}
              >
                !
              </Text>
            </XStack>
          )}
        </XStack>
      </XStack>

      {/* Card Content */}
      <YStack padding="$2.5" paddingTop="$2" gap="$2">
        {/* Main Title */}
        <Text
          color="$color9"
          fontSize="$6"
          fontWeight="700"
          lineHeight="$4"
          style={{
            color: "rgba(0,0,0,0.8)",
            shadowColor: columnColor,
            shadowRadius: 1,
            shadowOpacity: 0.2,
          }}
        >
          {card.title}
        </Text>

        {/* Footer Metadata */}
        <XStack ai="center" gap="$3">
          {/* Details Grid */}
          <YStack f={1}>
            <XStack jc="space-between" ai="center" opacity={0.7} pb="$1">
              <Text fontSize="$1" fontWeight="700" color={columnColor}>
                {createdAtLabel}
              </Text>
            </XStack>

            <XStack jc="space-between" ai="center" pt="$1" opacity={0.7}>
              <Text fontSize="$1" fontWeight="700" color={columnColor}>
                By {card.creatorName.toUpperCase()}
              </Text>
              <XStack ai="center" gap="$1">
                <RotateCcw size={10} color={columnColor} />
                <Text fontSize="$1" fontWeight="700" color={columnColor}>
                  {updatedAtLabel}
                </Text>
              </XStack>
            </XStack>
          </YStack>
        </XStack>
      </YStack>
    </YStack>
  );
}
