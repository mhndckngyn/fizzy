import { useCallback, useState } from "react";
import { TouchableOpacity, TextInput, FlatList, Keyboard } from "react-native";
import { View, Text, XStack, YStack, ScrollView, Spinner } from "tamagui";
import { SlidersHorizontal, Search, X } from "@tamagui/lucide-icons-2";
import {
  CardStatus,
  CardSortBy,
  FilterCardsParams,
  useFilterCards,
} from "@/features/main/cards/use-filter-cards";
import { useCurrentTeamParams } from "@/features/main/_shared/hooks";
import { useBoards } from "@/features/main/boards/use-boards";
import { useMembers } from "@/features/main/members/use-members";
import { useTags } from "@/features/main/tags/use-list-tags";
import { useRouter } from "expo-router";
import { CardItem } from "@/features/main/cards/components/filter-cards-page/card-item";
import { FilterPill } from "@/features/main/cards/components/filter-cards-page/filter-pill";
import {
  SortSheet,
  MultiSelectSheet,
  BoardSheet,
  STATUS_OPTIONS,
} from "@/features/main/cards/components/filter-cards-page/filter-sheets";

type FilterState = {
  boardId: string | null;
  search: string;
  statuses: CardStatus[];
  sortBy: CardSortBy;
  assignedToIds: string[];
  addedByIds: string[];
  closedByIds: string[];
  tagIds: string[];
};

const DEFAULT_FILTERS: FilterState = {
  boardId: null,
  search: "",
  statuses: [],
  sortBy: "recently-updated",
  assignedToIds: [],
  addedByIds: [],
  closedByIds: [],
  tagIds: [],
};

type SheetOpen =
  | "sort"
  | "status"
  | "board"
  | "assignedTo"
  | "addedBy"
  | "closedBy"
  | "tags"
  | null;

function hasFilters(f: FilterState) {
  return (
    !!f.boardId ||
    !!f.search ||
    f.statuses.length > 0 ||
    f.assignedToIds.length > 0 ||
    f.addedByIds.length > 0 ||
    f.closedByIds.length > 0 ||
    f.tagIds.length > 0 ||
    f.sortBy !== "recently-updated"
  );
}

export type FilterCardsScreenProps = {
  initialBoardId?: string;
};

export default function FilterCardsScreen({
  initialBoardId,
}: FilterCardsScreenProps) {
  const { teamId } = useCurrentTeamParams();
  const router = useRouter();

  const { data: boardsData } = useBoards();
  const { data: membersData } = useMembers();
  const { data: tagsData } = useTags(teamId);

  const boards = boardsData?.boards ?? [];
  const members = membersData?.members ?? [];
  const tags = tagsData ?? [];

  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTERS,
    boardId: initialBoardId ?? null,
  });
  const [sheetOpen, setSheetOpen] = useState<SheetOpen>(null);

  const patch = useCallback(
    (partial: Partial<FilterState>) =>
      setFilters((prev) => ({ ...prev, ...partial })),
    [],
  );

  const clearAll = useCallback(
    () =>
      setFilters({
        ...DEFAULT_FILTERS,
        boardId: initialBoardId ?? null,
      }),
    [initialBoardId],
  );

  const queryParams: FilterCardsParams = {
    boardId: filters.boardId,
    search: filters.search || null,
    statuses: filters.statuses.length ? filters.statuses : null,
    sortBy: filters.sortBy,
    assignedToIds: filters.assignedToIds.length ? filters.assignedToIds : null,
    addedByIds: filters.addedByIds.length ? filters.addedByIds : null,
    closedByIds: filters.closedByIds.length ? filters.closedByIds : null,
    tagIds: filters.tagIds.length ? filters.tagIds : null,
    pageSize: 50,
  };

  const { data, isLoading } = useFilterCards(queryParams);
  const cards = data?.cards ?? [];

  const memberOptions = members.map((m) => ({
    label: m.memberName,
    value: m.memberId,
  }));
  const tagOptions = tags.map((t) => ({
    label: t.title,
    value: t.tagId,
    color: t.color,
  }));

  const showBoardFilter = !initialBoardId;
  const selectedBoard = boards.find((b) => b.boardId === filters.boardId);
  const filtersActive = hasFilters(filters);

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* ── Filter bar ── */}
      <YStack
        px="$3"
        pt="$3"
        pb="$2"
        gap="$2"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
      >
        {/* Search input */}
        <XStack
          ai="center"
          gap="$2"
          borderWidth={1}
          borderColor="$gray6"
          borderRadius={999}
          px="$3"
          py="$2"
          backgroundColor="$gray2"
        >
          <Search size={15} color="$gray9" />
          <TextInput
            placeholder="Filter these cards..."
            value={filters.search}
            onChangeText={(v) => patch({ search: v })}
            style={{ flex: 1, fontSize: 14, padding: 0 }}
            returnKeyType="search"
            onSubmitEditing={() => Keyboard.dismiss()}
          />
          {!!filters.search && (
            <TouchableOpacity onPress={() => patch({ search: "" })}>
              <X size={14} color="$gray9" />
            </TouchableOpacity>
          )}
        </XStack>

        {/* Pills row */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <XStack gap="$2" ai="center">
            {showBoardFilter && (
              <FilterPill
                label={selectedBoard ? selectedBoard.name : "Board..."}
                active={!!filters.boardId}
                onPress={() => setSheetOpen("board")}
              />
            )}

            <FilterPill
              label={
                filters.sortBy === "recently-updated"
                  ? "Recently updated"
                  : filters.sortBy === "newest"
                    ? "Newest"
                    : "Oldest"
              }
              active={filters.sortBy !== "recently-updated"}
              onPress={() => setSheetOpen("sort")}
            />

            <FilterPill
              label={
                filters.statuses.length
                  ? `Status (${filters.statuses.length})`
                  : "Status..."
              }
              active={filters.statuses.length > 0}
              onPress={() => setSheetOpen("status")}
            />

            <FilterPill
              label={
                filters.tagIds.length
                  ? `Tagged (${filters.tagIds.length})`
                  : "Tagged..."
              }
              active={filters.tagIds.length > 0}
              onPress={() => setSheetOpen("tags")}
            />

            <FilterPill
              label={
                filters.assignedToIds.length
                  ? `Assigned to (${filters.assignedToIds.length})`
                  : "Assigned to..."
              }
              active={filters.assignedToIds.length > 0}
              onPress={() => setSheetOpen("assignedTo")}
            />

            <FilterPill
              label={
                filters.addedByIds.length
                  ? `Added by (${filters.addedByIds.length})`
                  : "Added by..."
              }
              active={filters.addedByIds.length > 0}
              onPress={() => setSheetOpen("addedBy")}
            />

            <FilterPill
              label={
                filters.closedByIds.length
                  ? `Closed by (${filters.closedByIds.length})`
                  : "Closed by..."
              }
              active={filters.closedByIds.length > 0}
              onPress={() => setSheetOpen("closedBy")}
            />

            <TouchableOpacity activeOpacity={0.75}>
              <View
                width={36}
                height={36}
                borderRadius={18}
                borderWidth={1}
                borderColor="$gray6"
                ai="center"
                jc="center"
              >
                <SlidersHorizontal size={16} color="$gray11" />
              </View>
            </TouchableOpacity>

            {filtersActive && (
              <TouchableOpacity onPress={clearAll} activeOpacity={0.75}>
                <View
                  width={36}
                  height={36}
                  borderRadius={18}
                  borderWidth={1}
                  borderColor="$red6"
                  ai="center"
                  jc="center"
                >
                  <X size={16} color="$red10" />
                </View>
              </TouchableOpacity>
            )}
          </XStack>
        </ScrollView>
      </YStack>

      {/* ── Results ── */}
      {isLoading ? (
        <View flex={1} ai="center" jc="center">
          <Spinner size="large" />
        </View>
      ) : cards.length === 0 ? (
        <View flex={1} ai="center" jc="center" gap="$2">
          <Text color="$gray9" fontSize="$3">
            No cards found
          </Text>
          {filtersActive && (
            <TouchableOpacity onPress={clearAll}>
              <Text color="$blue10" fontSize="$3">
                Clear filters
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={cards}
          keyExtractor={(item) => item.cardId}
          contentContainerStyle={{ padding: 12, gap: 10 }}
          ItemSeparatorComponent={() => <View height={10} />}
          renderItem={({ item }) => (
            <CardItem
              card={item}
              onPress={() =>
                router.push(`/teams/${teamId}/cards/${item.cardId}`)
              }
            />
          )}
        />
      )}

      {/* ── Sheets ── */}
      <SortSheet
        open={sheetOpen === "sort"}
        onClose={() => setSheetOpen(null)}
        value={filters.sortBy}
        onChange={(v) => patch({ sortBy: v })}
      />

      <MultiSelectSheet
        open={sheetOpen === "status"}
        onClose={() => setSheetOpen(null)}
        title="Status"
        options={STATUS_OPTIONS}
        selected={filters.statuses}
        onChange={(v) => patch({ statuses: v as CardStatus[] })}
      />

      <MultiSelectSheet
        open={sheetOpen === "assignedTo"}
        onClose={() => setSheetOpen(null)}
        title="Assigned to"
        options={memberOptions}
        selected={filters.assignedToIds}
        onChange={(v) => patch({ assignedToIds: v })}
      />

      <MultiSelectSheet
        open={sheetOpen === "addedBy"}
        onClose={() => setSheetOpen(null)}
        title="Added by"
        options={memberOptions}
        selected={filters.addedByIds}
        onChange={(v) => patch({ addedByIds: v })}
      />

      <MultiSelectSheet
        open={sheetOpen === "closedBy"}
        onClose={() => setSheetOpen(null)}
        title="Closed by"
        options={memberOptions}
        selected={filters.closedByIds}
        onChange={(v) => patch({ closedByIds: v })}
      />

      <MultiSelectSheet
        open={sheetOpen === "tags"}
        onClose={() => setSheetOpen(null)}
        title="Tagged"
        options={tagOptions}
        selected={filters.tagIds}
        onChange={(v) => patch({ tagIds: v })}
      />

      {showBoardFilter && (
        <BoardSheet
          open={sheetOpen === "board"}
          onClose={() => setSheetOpen(null)}
          boards={boards}
          selected={filters.boardId}
          onChange={(v) => patch({ boardId: v })}
        />
      )}
    </YStack>
  );
}
