import { Comment } from "@/features/main/comments/types";
import { useComments } from "@/features/main/comments/use-comments";
import {
  CardEvent,
  useCardEvents,
} from "@/features/main/events/use-card-events";
import { MessagesSquare } from "@tamagui/lucide-icons-2";
import React, { useMemo, useState } from "react";
import { Spinner, Switch, Text, XStack, YStack } from "tamagui";
import CommentBox from "./comment-box";
import CommentItem from "./comment-item";
import EventItem from "./event-item";

type TimelineItem =
  | { kind: "comment"; createdAt: string; data: Comment }
  | { kind: "event"; createdAt: string; data: CardEvent };

interface ActivitySectionProps {
  cardId: string;
}

export default function ActivitySection({ cardId }: ActivitySectionProps) {
  const [showActivity, setShowActivity] = useState(false);

  const { data: comments, isLoading: isLoadingComments } = useComments(cardId);
  const { data: cardEvents, isLoading: isLoadingEvents } = useCardEvents(
    cardId,
    {
      enabled: showActivity,
    },
  );

  const timeline = useMemo<TimelineItem[]>(() => {
    const items: TimelineItem[] = (comments ?? []).map((c) => ({
      kind: "comment",
      createdAt: c.createdAt,
      data: c,
    }));

    if (showActivity && cardEvents) {
      for (const e of cardEvents.events) {
        items.push({ kind: "event", createdAt: e.createdAt, data: e });
      }
    }

    return items.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [comments, cardEvents, showActivity]);

  const isLoading = isLoadingComments || (showActivity && isLoadingEvents);

  return (
    <YStack gap="$1" paddingTop="$2">
      <XStack px="$1" pb="$4" ai="center" gap="$2">
        <MessagesSquare size={14} color="$color" opacity={0.7} />
        <Text
          fontSize={12}
          fontWeight="700"
          o={0.5}
          textTransform="uppercase"
          letterSpacing={0.5}
          flex={1}
        >
          Activities
        </Text>
        <XStack ai="center" gap="$2">
          <Text fontWeight="700" fontSize={12} o={0.5} letterSpacing={0.5}>
            Show history
          </Text>
          <Switch
            size="$2"
            checked={showActivity}
            onCheckedChange={setShowActivity}
            backgroundColor={showActivity ? "unset" : "$gray5"}
            activeStyle={{ backgroundColor: "$blue9" }}
          >
            <Switch.Thumb
              backgroundColor="white"
              borderColor="$gray6"
              borderWidth={1}
              activeStyle={{
                backgroundColor: "white",
                borderColor: "$gray8",
                borderWidth: 1,
              }}
            />
          </Switch>
        </XStack>
      </XStack>

      <CommentBox cardId={cardId} />

      {isLoading ? (
        <YStack
          padding="$4"
          alignItems="center"
          justifyContent="center"
          gap="$2"
        >
          <Spinner size="large" color="$blue10" />
          <Text color="$colorFocus" fontSize="$2">
            Loading...
          </Text>
        </YStack>
      ) : (
        <YStack gap="$3" paddingTop="$3">
          {timeline.map((item) =>
            item.kind === "comment" ? (
              <CommentItem
                key={`comment-${item.data.commentId}`}
                cardId={cardId}
                comment={item.data}
              />
            ) : (
              <EventItem key={`event-${item.data.eventId}`} event={item.data} />
            ),
          )}
        </YStack>
      )}
    </YStack>
  );
}
