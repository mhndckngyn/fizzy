import { useHeaderStore } from "@/components/workspace-header/use-header-store";
import { useCurrentTeamParams } from "@/features/main/_shared/hooks";
import { useBoards } from "@/features/main/boards/use-boards";
import { FeedFilterSheet } from "@/features/main/events/components/event-feeds/feed-filter-sheet";
import { FeedList } from "@/features/main/events/components/event-feeds/feed-list";
import { FilterChip } from "@/features/main/events/components/event-feeds/filter-chip";
import { useEventFeeds } from "@/features/main/events/use-event-feeds";
import { useMembers } from "@/features/main/members/use-members";
import { Plus, SquareKanban } from "@tamagui/lucide-icons-2";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { View, XStack } from "tamagui";

type SheetOpen = "boards" | "members" | null;

export default function TeamHomepage() {
  const router = useRouter();
  const { teamId } = useCurrentTeamParams();

  const setHeader = useHeaderStore((s) => s.setHeader);
  const resetHeader = useHeaderStore((s) => s.resetHeader);
  useFocusEffect(
    useCallback(() => {
      setHeader({
        leftAction: {
          icon: Plus,
          onPress: () => router.push(`/teams/${teamId}/cards/create`),
        },
        rightAction: {
          icon: SquareKanban,
          onPress: () => router.push(`/teams/${teamId}/boards/create`),
        },
      });

      return resetHeader;
    }, [teamId, setHeader, resetHeader, router]),
  );

  const { data: boardsData } = useBoards();
  const { data: membersData } = useMembers();

  const boards = boardsData?.boards ?? [];
  const members = membersData?.members ?? [];

  const [selectedBoardIds, setSelectedBoardIds] = useState<string[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [sheetOpen, setSheetOpen] = useState<SheetOpen>(null);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    isRefetching,
    refetch,
    fetchNextPage,
    hasNextPage,
  } = useEventFeeds(selectedBoardIds, selectedMemberIds);

  const boardChipLabel =
    selectedBoardIds.length === 0
      ? "From all boards"
      : `From ${selectedBoardIds.length} board${selectedBoardIds.length === 1 ? "" : "s"}`;

  const memberChipLabel =
    selectedMemberIds.length === 0
      ? "By all members"
      : `By ${selectedMemberIds.length} member${selectedMemberIds.length === 1 ? "" : "s"}`;

  const filterChips = (
    <XStack gap="$2" paddingTop="$3" paddingBottom="$2" jc="center">
      <FilterChip
        label={boardChipLabel}
        active={selectedBoardIds.length > 0}
        onPress={() => setSheetOpen("boards")}
      />
      <FilterChip
        label={memberChipLabel}
        active={selectedMemberIds.length > 0}
        onPress={() => setSheetOpen("members")}
      />
    </XStack>
  );

  return (
    <View flex={1} paddingInline="$2">
      <FeedList
        data={data}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        isRefetching={isRefetching}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
        refetch={refetch}
        header={filterChips}
      />

      <FeedFilterSheet
        open={sheetOpen === "boards"}
        onClose={() => setSheetOpen(null)}
        title="Boards"
        options={boards.map((b) => ({ label: b.name, value: b.boardId }))}
        selected={selectedBoardIds}
        onApply={setSelectedBoardIds}
      />

      <FeedFilterSheet
        open={sheetOpen === "members"}
        onClose={() => setSheetOpen(null)}
        title="Members"
        options={members.map((m) => ({
          label: m.memberName,
          value: m.memberId,
        }))}
        selected={selectedMemberIds}
        onApply={setSelectedMemberIds}
      />
    </View>
  );
}
