import { CardEvent } from "@/features/main/events/use-card-events";
import { SquareKanban } from "@tamagui/lucide-icons-2";
import { format } from "date-fns";
import { Text, XStack, YStack } from "tamagui";

export default function EventItem({ event }: { event: CardEvent }) {
  return (
    <XStack
      gap="$3"
      ai="center"
      p="$2.5"
      backgroundColor="$gray3"
      borderRadius="$2"
    >
      <SquareKanban size="$1" color="$gray10" />
      <YStack flex={1} gap="$0.5">
        <Text fontSize="$4" fontWeight="bold">
          {event.title}
        </Text>
        <Text fontSize="$3" color="$gray10">
          {format(new Date(event.createdAt), "EEE, MMM d, h:mm a")}
        </Text>
      </YStack>
    </XStack>
  );
}
