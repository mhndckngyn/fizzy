import { format } from "date-fns";
import { Separator, Text, View, YStack } from "tamagui";
import { ListItem } from "./feed-list";
import { FeedEventItem } from "./feed-event-item";

export function ListItemRenderer({ item }: { item: ListItem }) {
  switch (item.kind) {
    case "type-header":
      return (
        <Text
          marginTop="$3"
          textTransform="uppercase"
          textAlign="center"
          color="#000221"
        >
          <Text color="#000221" fontWeight="bold">
            {item.type} {format(new Date(item.date), "eeee, MMM d")}{" "}
          </Text>
          ({item.count})
        </Text>
      );

    case "event":
      return (
        <View marginTop="$2">
          <FeedEventItem event={item.event} />
        </View>
      );

    case "hour-footer":
      return (
        <Text
          marginTop="$2"
          textAlign="center"
          color="$gray9"
          fontWeight="bold"
        >
          {item.time}
        </Text>
      );

    case "divider":
      return (
        <Separator
          borderColor="black"
          opacity={0.1}
          marginTop="$4"
          marginBottom="$1"
        />
      );

    case "gap":
      return (
        <YStack marginTop="$6" marginBottom="$4" gap="$1" alignItems="center">
          {item.inactiveDays >= 1 && (
            <Text fontSize="$5" fontWeight="bold" color="#000221">
              {format(item.gapStart, "eeee, MMM d")}
              {item.inactiveDays > 1 && (
                <>
                  {" – "}
                  {format(item.gapEnd, "eeee, MMM d")}
                </>
              )}
            </Text>
          )}
          <Text color="#000221">
            {item.inactiveDays === 1
              ? "No activity"
              : `No activity for ${item.inactiveDays} days`}
          </Text>
        </YStack>
      );

    case "end":
      return (
        <Text marginBlock="$4" fontSize="$4" textAlign="center" color="$gray9">
          You have reached the end.
        </Text>
      );
  }
}
