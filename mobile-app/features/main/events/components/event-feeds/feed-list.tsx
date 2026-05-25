import { InfiniteData } from "@tanstack/react-query";
import { FlashList } from "@shopify/flash-list";
import {
  addDays,
  compareDesc,
  differenceInDays,
  format,
  parse,
  roundToNearestHours,
  startOfDay,
  subDays,
} from "date-fns";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { Text, View } from "tamagui";
import { HomepageFeedResponse } from "../../use-event-feeds";
import { FeedEvent, FeedEventType } from "../../types";
import { ListItemRenderer } from "./list-item-renderer";

export type ListItem =
  | { kind: "type-header"; type: FeedEventType; date: string; count: number }
  | { kind: "event"; event: FeedEvent }
  | { kind: "hour-footer"; time: string }
  | { kind: "gap"; gapStart: Date; gapEnd: Date; inactiveDays: number }
  | { kind: "divider" }
  | { kind: "end" };

type FeedListProps = {
  data: InfiniteData<HomepageFeedResponse> | undefined;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  isRefetching: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  refetch: () => void;
  header?: ReactNode;
};

export function FeedList({
  data,
  isLoading,
  isFetchingNextPage,
  isRefetching,
  hasNextPage,
  fetchNextPage,
  refetch,
  header,
}: FeedListProps) {
  const listItems = useMemo<ListItem[]>(() => {
    if (!data) return [];

    const items: ListItem[] = [];
    const pages = data.pages;

    for (let p = 0; p < pages.length; p++) {
      const page = pages[p];
      const isLastPage = p === pages.length - 1;

      if (page.feedEvents.length === 0) continue;

      const byType: Record<FeedEventType, Record<number, FeedEvent[]>> = {
        Added: {},
        Updated: {},
        Done: {},
      };

      for (const event of page.feedEvents) {
        const hour = roundToNearestHours(new Date(event.createdAt)).getHours();
        byType[event.type][hour] ??= [];
        byType[event.type][hour].push(event);
      }

      for (const type of ["Added", "Updated", "Done"] as FeedEventType[]) {
        const hourEntries = Object.entries(byType[type]);
        if (hourEntries.length === 0) continue;

        const hourBlocks = hourEntries
          .map(([hour, events]) => ({
            hour: Number(hour),
            events: [...events].sort((a, b) =>
              compareDesc(new Date(a.createdAt), new Date(b.createdAt)),
            ),
          }))
          .sort((a, b) => b.hour - a.hour);

        const firstEvent = hourBlocks[0].events[0];
        const count = hourBlocks.reduce((sum, b) => sum + b.events.length, 0);

        items.push({
          kind: "type-header",
          type,
          date: firstEvent.createdAt,
          count,
        });

        for (const block of hourBlocks) {
          for (const event of block.events) {
            items.push({ kind: "event", event });
          }
          items.push({
            kind: "hour-footer",
            time: format(
              new Date(block.events[block.events.length - 1].createdAt),
              "H:mm a",
            ),
          });
        }
      }

      if (!isLastPage) {
        items.push({ kind: "divider" });
        if (page.nextCursor) {
          const lastActiveDate = parse(
            page.nextCursor,
            "yyyy-MM-dd",
            new Date(),
          );
          const currentPageDate = startOfDay(
            new Date(page.feedEvents[0].createdAt),
          );
          const gapStart = addDays(lastActiveDate, 1);
          const gapEnd = subDays(currentPageDate, 1);
          const inactiveDays = differenceInDays(gapEnd, gapStart) + 1;
          if (inactiveDays > 0) {
            items.push({ kind: "gap", gapStart, gapEnd, inactiveDays });
            items.push({ kind: "divider" });
          }
        }
      } else if (!hasNextPage) {
        items.push({ kind: "end" });
      }
    }

    return items;
  }, [data, hasNextPage]);

  const containerHeightRef = useRef(0);
  const contentHeightRef = useRef(0);

  useEffect(() => {
    if (
      hasNextPage &&
      !isFetchingNextPage &&
      containerHeightRef.current > 0 &&
      contentHeightRef.current <= containerHeightRef.current
    ) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage]);

  return (
    <View
      flex={1}
      onLayout={(e) => {
        containerHeightRef.current = e.nativeEvent.layout.height;
      }}
    >
      <FlashList
        data={listItems}
        keyExtractor={(item, index) => {
          if (item.kind === "event") return item.event.eventId;
          return `${item.kind}-${index}`;
        }}
        renderItem={({ item }) => <ListItemRenderer item={item} />}
        getItemType={(item) => item.kind}
        onEndReached={() => {
          if (hasNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.3}
        onContentSizeChange={(_, contentHeight) => {
          contentHeightRef.current = contentHeight;
          if (
            hasNextPage &&
            !isFetchingNextPage &&
            contentHeight <= containerHeightRef.current
          ) {
            fetchNextPage();
          }
        }}
        ListHeaderComponent={header ? () => <>{header}</> : undefined}
        refreshing={isRefetching}
        onRefresh={refetch}
        ListEmptyComponent={
          isLoading ? (
            <Text
              paddingBlock="$2.5"
              textAlign="center"
              fontSize="$4"
              color="$gray9"
            >
              Loading...
            </Text>
          ) : data ? (
            <Text
              paddingBlock="$2.5"
              textAlign="center"
              fontSize="$4"
              color="$gray9"
            >
              No activity
            </Text>
          ) : null
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <Text
              paddingBlock="$2.5"
              textAlign="center"
              fontSize="$4"
              color="$gray9"
            >
              Loading...
            </Text>
          ) : null
        }
      />
    </View>
  );
}
