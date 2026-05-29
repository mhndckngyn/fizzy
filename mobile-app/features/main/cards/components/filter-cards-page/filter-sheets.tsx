import { TouchableOpacity } from "react-native";
import {
  View,
  Text,
  XStack,
  YStack,
  ScrollView,
  Separator,
  Sheet,
} from "tamagui";
import { Check, X } from "@tamagui/lucide-icons-2";
import { CardSortBy } from "@/features/main/cards/use-filter-cards";

export const SORT_OPTIONS: { label: string; value: CardSortBy }[] = [
  { label: "Recently updated", value: "recently-updated" },
  { label: "Newest to oldest", value: "newest" },
  { label: "Oldest to newest", value: "oldest" },
];

export const STATUS_OPTIONS = [
  { label: "Open", value: "open" },
  { label: "Done", value: "done" },
  { label: "Not now", value: "not-now" },
  { label: "Closing soon", value: "closing-soon" },
  { label: "Golden", value: "golden" },
];

// ── Generic multi-select sheet ────────────────────────────────────────────────

export function MultiSelectSheet<T extends string>({
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
      modal
      open={open}
      onOpenChange={(o: boolean) => !o && onClose()}
      snapPoints={[45]}
      dismissOnSnapToBottom
      zIndex={100000}
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

export function SortSheet({
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
      modal
      open={open}
      onOpenChange={(o: boolean) => !o && onClose()}
      snapPoints={[35]}
      dismissOnSnapToBottom
      zIndex={100000}
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

type Board = { boardId: string; name: string };

export function BoardSheet({
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
      modal
      open={open}
      onOpenChange={(o: boolean) => !o && onClose()}
      snapPoints={[50]}
      dismissOnSnapToBottom
      zIndex={100000}
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
