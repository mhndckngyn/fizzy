import {
  getBackgroundTint,
  getLightTint,
  getInitials,
  getTextTint,
} from "@/features/main/_shared/helpers";
import { useCurrentTeamParams } from "@/features/main/_shared/hooks";
import { Link } from "expo-router";
import { Card, Separator, Text, View, XStack } from "tamagui";
import { FeedEvent } from "../../types";

export function FeedEventItem({ event }: { event: FeedEvent }) {
  const SPECIAL_COLOR = "#3d4e65";
  const { initials, color } = getInitials(event.creatorName);
  const { teamId } = useCurrentTeamParams();

  const textColor = getTextTint(event.columnColor ?? SPECIAL_COLOR);

  return (
    <Link
      href={{
        pathname: "/teams/[teamId]/cards/[cardId]",
        params: { teamId: teamId, cardId: event.cardId },
      }}
      asChild
    >
      <Card
        backgroundColor={getBackgroundTint(event.columnColor ?? SPECIAL_COLOR)}
        borderColor={getLightTint(event.columnColor ?? SPECIAL_COLOR, 0.6)}
        borderWidth={1}
        paddingInline="$2.5"
        paddingBlock="$2"
      >
        <XStack paddingLeft="$1" gap="$2" alignItems="center">
          <Text fontSize="$3" fontWeight="bold" color={textColor}>
            {event.cardNo}
          </Text>

          <Separator vertical borderColor="black" opacity={0.35} height={15} />

          <Text fontSize="$3" fontWeight="bold" color={textColor}>
            {event.boardName}
          </Text>
        </XStack>

        <XStack mt="$1.5" gap="$2.5">
          <View
            width={40}
            height={40}
            borderRadius={20}
            backgroundColor={color}
            ai="center"
            jc="center"
            flexShrink={0}
          >
            <Text color="white" fontSize="$5" fontWeight="700">
              {initials}
            </Text>
          </View>
          <Text fontSize="$5" fontWeight="bold" color={textColor}>
            {event.title}
          </Text>
        </XStack>
      </Card>
    </Link>
  );
}
