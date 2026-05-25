import { CardEvent } from "@/features/main/events/use-card-events";
import { format } from "date-fns";
import { Activity } from "@tamagui/lucide-icons-2";
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
      <Activity size={14} color="$color" />
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
