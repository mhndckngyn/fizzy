import { useCallback, useState } from "react";
import { TouchableOpacity, TextInput, FlatList, Keyboard } from "react-native";
import {
  View,
  Text,
  XStack,
  YStack,
  ScrollView,
  Spinner,
  Separator,
  Sheet,
} from "tamagui";
import { Check, X, SlidersHorizontal, Search } from "@tamagui/lucide-icons-2";
import {
  CardStatus,
  CardSortBy,
  CardSummary,
  FilterCardsParams,
  useFilterCards,
} from "@/features/main/cards/use-filter-cards";
import { useCurrentTeamParams } from "@/features/main/_shared/hooks";
import { useRouter } from "expo-router";

type Board = { boardId: string; name: string };
type Member = { memberId: string; name: string };
type Tag = { tagId: string; title: string; color: string };

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

const SORT_OPTIONS: { label: string; value: CardSortBy }[] = [
  { label: "Recently updated", value: "recently-updated" },
  { label: "Newest to oldest", value: "newest" },
  { label: "Oldest to newest", value: "oldest" },
];

const STATUS_OPTIONS: { label: string; value: CardStatus }[] = [
  { label: "Open", value: "open" },
  { label: "Done", value: "done" },
  { label: "Not now", value: "not-now" },
  { label: "Maybe", value: "maybe" },
];

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return `${Math.floor(days / 7)}w ago`;
}

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

// ── Pill button ───────────────────────────────────────────────────────────────

function FilterPill({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75}>
      <XStack
        ai="center"
        gap="$1.5"
        px="$3"
        py="$1.5"
        borderRadius={999}
        borderWidth={1}
        borderColor={active ? "$blue8" : "$gray6"}
        backgroundColor={active ? "$blue3" : "transparent"}
      >
        <Text
          fontSize="$2"
          fontWeight="600"
          color={active ? "$blue11" : "$gray11"}
        >
          {label}
        </Text>
        <Text fontSize="$2" color={active ? "$blue9" : "$gray9"}>
          ▾
        </Text>
      </XStack>
    </TouchableOpacity>
  );
}

// ── Generic multi-select sheet ────────────────────────────────────────────────

function MultiSelectSheet<T extends string>({
  open,
  onClose,
  title,
  options,
  selected,
  onChange,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  options: { label: string; value: T; color?: string }[];
  selected: T[];
  onChange: (vals: T[]) => void;
}) {
  const toggle = (v: T) =>
    onChange(
      selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v],
    );

  return (
    <Sheet
      open={open}
      onOpenChange={(o: boolean) => !o && onClose()}
      snapPoints={[45]}
    >
      <Sheet.Overlay />
      <Sheet.Frame px="$4" pt="$4" pb="$8">
        <XStack ai="center" jc="space-between" mb="$4">
          <Text fontWeight="700" fontSize="$5">
            {title}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <X size={20} color="$gray10" />
          </TouchableOpacity>
        </XStack>
        <ScrollView>
          <YStack gap="$1">
            {options.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => toggle(opt.value)}
                activeOpacity={0.7}
              >
                <XStack ai="center" gap="$3" py="$2.5" px="$1">
                  {opt.color && (
                    <View
                      width={10}
                      height={10}
                      borderRadius={5}
                      backgroundColor={opt.color}
                    />
                  )}
                  <Text flex={1} fontSize="$3" color="$gray12">
                    {opt.label}
                  </Text>
                  {selected.includes(opt.value) && (
                    <Check size={18} color="$blue10" />
                  )}
                </XStack>
              </TouchableOpacity>
            ))}
          </YStack>
        </ScrollView>
        {selected.length > 0 && (
          <TouchableOpacity onPress={() => onChange([])}>
            <Text
              mt="$3"
              textAlign="center"
              color="$red10"
              fontSize="$3"
              fontWeight="600"
            >
              Clear selection
            </Text>
          </TouchableOpacity>
        )}
      </Sheet.Frame>
    </Sheet>
  );
}

// ── Sort sheet ────────────────────────────────────────────────────────────────

function SortSheet({
  open,
  onClose,
  value,
  onChange,
}: {
  open: boolean;
  onClose: () => void;
  value: CardSortBy;
  onChange: (v: CardSortBy) => void;
}) {
  return (
    <Sheet
      open={open}
      onOpenChange={(o: boolean) => !o && onClose()}
      snapPoints={[35]}
    >
      <Sheet.Overlay />
      <Sheet.Frame px="$4" pt="$4" pb="$8">
        <XStack ai="center" jc="space-between" mb="$4">
          <Text fontWeight="700" fontSize="$5">
            Sort by
          </Text>
          <TouchableOpacity onPress={onClose}>
            <X size={20} color="$gray10" />
          </TouchableOpacity>
        </XStack>
        <YStack gap="$1">
          {SORT_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => {
                onChange(opt.value);
                onClose();
              }}
              activeOpacity={0.7}
            >
              <XStack ai="center" gap="$3" py="$2.5" px="$1">
                <Text flex={1} fontSize="$3" color="$gray12">
                  {opt.label}
                </Text>
                {value === opt.value && <Check size={18} color="$blue10" />}
              </XStack>
            </TouchableOpacity>
          ))}
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}

// ── Board sheet ───────────────────────────────────────────────────────────────

function BoardSheet({
  open,
  onClose,
  boards,
  selected,
  onChange,
}: {
  open: boolean;
  onClose: () => void;
  boards: Board[];
  selected: string | null;
  onChange: (boardId: string | null) => void;
}) {
  return (
    <Sheet
      open={open}
      onOpenChange={(o: boolean) => !o && onClose()}
      snapPoints={[50]}
    >
      <Sheet.Overlay />
      <Sheet.Frame px="$4" pt="$4" pb="$8">
        <XStack ai="center" jc="space-between" mb="$4">
          <Text fontWeight="700" fontSize="$5">
            Board
          </Text>
          <TouchableOpacity onPress={onClose}>
            <X size={20} color="$gray10" />
          </TouchableOpacity>
        </XStack>
        <ScrollView>
          <YStack gap="$1">
            <TouchableOpacity
              onPress={() => {
                onChange(null);
                onClose();
              }}
              activeOpacity={0.7}
            >
              <XStack ai="center" gap="$3" py="$2.5" px="$1">
                <Text flex={1} fontSize="$3" color="$gray12">
                  All boards
                </Text>
                {selected === null && <Check size={18} color="$blue10" />}
              </XStack>
            </TouchableOpacity>
            <Separator my="$1" />
            {boards.map((b) => (
              <TouchableOpacity
                key={b.boardId}
                onPress={() => {
                  onChange(b.boardId);
                  onClose();
                }}
                activeOpacity={0.7}
              >
                <XStack ai="center" gap="$3" py="$2.5" px="$1">
                  <Text flex={1} fontSize="$3" color="$gray12">
                    {b.name}
                  </Text>
                  {selected === b.boardId && (
                    <Check size={18} color="$blue10" />
                  )}
                </XStack>
              </TouchableOpacity>
            ))}
          </YStack>
        </ScrollView>
      </Sheet.Frame>
    </Sheet>
  );
}

// ── Card item ─────────────────────────────────────────────────────────────────

function CardItem({
  card,
  onPress,
}: {
  card: CardSummary;
  onPress: () => void;
}) {
  const colColor = card.columnColor ?? "#3d4e65";
  const bgColor = `${colColor}18`;
  const colName = card.columnName?.toUpperCase() ?? "";

  const statusColors: Record<string, string> = {
    open: "#22c55e",
    done: "#3b82f6",
    "not-now": "#f97316",
    maybe: "#a855f7",
  };
  const statusLabels: Record<string, string> = {
    open: "OPEN",
    done: "DONE",
    "not-now": "NOT NOW",
    maybe: "MAYBE",
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75}>
      <View
        backgroundColor={bgColor}
        borderRadius="$2"
        overflow="hidden"
        borderWidth={1}
        borderColor={`${colColor}30`}
      >
        {/* Header row */}
        <XStack ai="stretch">
          <XStack
            ai="center"
            gap="$2"
            backgroundColor={colColor}
            px="$2.5"
            py="$1"
            borderTopLeftRadius="$2"
            borderBottomRightRadius="$2"
          >
            <Text color="white" fontWeight="900" fontSize="$2">
              {card.no}
            </Text>
            <Separator vertical borderColor="white" opacity={0.5} height={12} />
            <Text
              color="white"
              fontWeight="700"
              fontSize="$2"
              textTransform="uppercase"
              letterSpacing={1}
            >
              {card.boardName}
            </Text>
          </XStack>

          <View flex={1} />

          {/* Status badge */}
          <View
            backgroundColor={statusColors[card.status] + "22"}
            px="$2"
            py="$1"
            borderBottomLeftRadius="$2"
          >
            <Text
              fontSize={10}
              fontWeight="800"
              color={statusColors[card.status]}
              letterSpacing={0.5}
            >
              {statusLabels[card.status]}
            </Text>
          </View>

          {!!colName && (
            <XStack
              ai="center"
              backgroundColor={colColor}
              px="$2.5"
              py="$1"
              borderTopRightRadius="$2"
              borderBottomLeftRadius="$2"
            >
              <Text
                color="white"
                fontWeight="800"
                fontSize={10}
                letterSpacing={0.5}
              >
                {colName}
              </Text>
            </XStack>
          )}
        </XStack>

        {/* Body */}
        <YStack px="$3" py="$2.5" gap="$1.5">
          <Text
            fontWeight="700"
            fontSize="$4"
            color="$gray12"
            numberOfLines={2}
          >
            {card.title ?? "(Untitled)"}
          </Text>

          <XStack ai="center" gap="$2" flexWrap="wrap">
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

          <XStack ai="center" jc="space-between">
            <Text fontSize="$2" color="$gray9">
              {card.assignees.length > 0
                ? card.assignees.map((a) => a.name).join(", ")
                : card.creatorName}
            </Text>
            <Text fontSize="$2" color="$gray9">
              {timeAgo(card.updatedAt ?? card.createdAt)}
            </Text>
          </XStack>
        </YStack>
      </View>
    </TouchableOpacity>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

type SheetOpen =
  | "sort"
  | "status"
  | "board"
  | "assignedTo"
  | "addedBy"
  | "closedBy"
  | "tags"
  | null;

export type FilterCardsScreenProps = {
  /** Pass these in from parent (e.g. fetched from a team boards/members/tags query) */
  boards?: Board[];
  members?: Member[];
  tags?: Tag[];
  /** Pre-scope to a specific board (hides the Board filter pill) */
  initialBoardId?: string;
};

export default function FilterCardsScreen({
  boards = [],
  members = [],
  tags = [],
  initialBoardId,
}: FilterCardsScreenProps) {
  const { teamId } = useCurrentTeamParams();
  const router = useRouter();

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

  // Build query params
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
    label: m.name,
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
      {/* ── Filter bar ─────────────────────────────────────────────────── */}
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
            placeholderTextColor="#6b7280"
            value={filters.search}
            onChangeText={(v) => patch({ search: v })}
            style={{
              flex: 1,
              fontSize: 14,
              color: "white",
              padding: 0,
            }}
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

            {/* Sliders icon */}
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

            {/* Clear all */}
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

        {/* Result count */}
        {!isLoading && data && (
          <Text fontSize="$2" color="$gray9" pl="$1">
            {data.total} card{data.total !== 1 ? "s" : ""}
          </Text>
        )}
      </YStack>

      {/* ── Results ─────────────────────────────────────────────────────── */}
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

      {/* ── Sheets ──────────────────────────────────────────────────────── */}
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
