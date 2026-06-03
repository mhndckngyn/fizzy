import React, { useCallback, useRef, useState } from "react";
import { Alert, TextInput, TouchableOpacity } from "react-native";
import { Spinner, Text, View, XStack, YStack } from "tamagui";
import { Check, Plus, X, Tags } from "@tamagui/lucide-icons-2";
import { useTags } from "../use-list-tags";
import { useCreateTag } from "../use-create-tag";
import { useAddTagToCard } from "../use-add-tag-to-card";
import { useRemoveTagFromCard } from "../use-remove-tag-from-card";

const TAG_COLORS = [
  "#6366f1",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#8b5cf6",
  "#f97316",
  "#64748b",
];

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

type TagItem = {
  tagId: string;
  title: string;
  color: string;
};

type TagPillProps = TagItem & {
  onRemove?: () => void;
};

function TagPill({ title, color, onRemove }: TagPillProps) {
  return (
    <XStack
      ai="center"
      gap="$1.5"
      px="$2.5"
      py="$2"
      borderRadius={999}
      borderWidth={0.5}
      style={{
        backgroundColor: hexToRgba(color, 0.13),
        borderColor: hexToRgba(color, 0.3),
      }}
    >
      <View
        width={7}
        height={7}
        borderRadius={99}
        style={{ backgroundColor: color }}
      />
      <Text fontSize={12} fontWeight="500" style={{ color }}>
        {title}
      </Text>
      {onRemove && (
        <View
          onPress={onRemove}
          width={14}
          height={14}
          borderRadius={99}
          ai="center"
          jc="center"
          style={{ backgroundColor: hexToRgba(color, 0.2) }}
          pressStyle={{ opacity: 0.6 }}
        >
          <X size={9} color={color} />
        </View>
      )}
    </XStack>
  );
}

type Props = {
  teamId: string;
  boardId: string;
  cardId: string;
  assignedTags?: TagItem[];
};

export function TagSection({
  teamId,
  boardId,
  cardId,
  assignedTags: assignedTagsProp,
}: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0]);

  const inputRef = useRef<TextInput>(null);

  const { data: allTags = [], isLoading } = useTags(teamId, cardId);
  const { mutateAsync: createTag, isPending: isCreating } =
    useCreateTag(teamId);
  const { mutateAsync: addTag, isPending: isAdding } = useAddTagToCard(
    teamId,
    boardId,
    cardId,
  );
  const { mutateAsync: removeTag, isPending: isRemoving } =
    useRemoveTagFromCard(teamId, boardId, cardId);

  const assignedTags = assignedTagsProp ?? allTags.filter((t) => t.isAssigned);

  const trimmedQuery = query.trim();

  const filteredTags = (
    trimmedQuery
      ? allTags.filter((t) =>
          t.title.toLowerCase().includes(trimmedQuery.toLowerCase()),
        )
      : allTags
  ).slice(0, 6);

  const exactMatch = allTags.some(
    (t) => t.title.toLowerCase() === trimmedQuery.toLowerCase(),
  );
  const showCreate = trimmedQuery.length > 0 && !exactMatch;

  const isPending = isAdding || isRemoving;

  const handleToggle = useCallback(
    async (tagId: string, isAssigned: boolean) => {
      if (isPending) return;
      try {
        if (isAssigned) {
          await removeTag(tagId);
        } else {
          await addTag(tagId);
        }
      } catch (err: any) {
        const msg =
          err?.response?.data?.data?.[0] ??
          err?.response?.data?.errors?.[0] ??
          err?.response?.data?.message ??
          err?.message ??
          "Không thể cập nhật tag.";
        Alert.alert("Lỗi", msg);
      }
    },
    [isPending, addTag, removeTag],
  );

  const handleCreate = useCallback(async () => {
    if (!trimmedQuery || isCreating) return;
    try {
      const created = await createTag({
        title: trimmedQuery,
        color: selectedColor,
      });
      await addTag(created.tagId);
      setQuery("");
    } catch (err: any) {
      const msg =
        err?.response?.data?.data?.[0] ??
        err?.response?.data?.errors?.[0] ??
        err?.response?.data?.message ??
        err?.message ??
        "Không thể tạo tag.";
      Alert.alert("Lỗi", msg);
    }
  }, [trimmedQuery, isCreating, selectedColor, createTag, addTag]);

  const openPicker = () => {
    setPickerOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const closePicker = () => {
    setPickerOpen(false);
    setQuery("");
    setSelectedColor(TAG_COLORS[0]);
  };

  return (
    <YStack gap="$2.5">
      <XStack ai="center" gap="$2" opacity={0.5}>
        <Tags size={14} color="$color" />
        <Text
          fontSize={11}
          fontWeight="700"
          textTransform="uppercase"
          letterSpacing={1}
        >
          Tags
        </Text>
      </XStack>

      {/* Assigned tags row */}
      <XStack flexWrap="wrap" gap="$1.5" ai="center">
        {assignedTags.map((t) => (
          <TagPill
            key={t.tagId}
            {...t}
            onRemove={isPending ? undefined : () => handleToggle(t.tagId, true)}
          />
        ))}

        {!pickerOpen && (
          <XStack
            ai="center"
            gap="$1"
            px="$2.5"
            py="$2"
            borderRadius={999}
            borderWidth={0.5}
            borderColor="$gray6"
            onPress={openPicker}
            pressStyle={{ opacity: 0.6 }}
          >
            <Plus size={11} color="$gray9" />
            <Text fontSize={12} color="$gray9">
              Add tag
            </Text>
          </XStack>
        )}

        {isPending && <Spinner size="small" color="$gray9" />}
      </XStack>

      {/* Picker */}
      {pickerOpen && (
        <YStack
          borderRadius="$3"
          borderWidth={0.5}
          borderColor="$gray5"
          backgroundColor="$gray2"
          overflow="hidden"
        >
          {/* Dual-purpose input */}
          <XStack
            ai="center"
            px="$3"
            py="$2"
            gap="$2"
            borderBottomWidth={0.5}
            borderBottomColor="$gray5"
          >
            <TextInput
              ref={inputRef}
              style={inputStyle}
              placeholder="Add a new tag or filter..."
              placeholderTextColor="#6b7280"
              value={query}
              onChangeText={setQuery}
              maxLength={40}
              returnKeyType="done"
              onSubmitEditing={showCreate ? handleCreate : undefined}
            />
            <TouchableOpacity onPress={closePicker} hitSlop={8}>
              <X size={15} color="#6b7280" />
            </TouchableOpacity>
          </XStack>

          {/* Tag list */}
          {isLoading ? (
            <YStack p="$3" ai="center">
              <Spinner size="small" />
            </YStack>
          ) : (
            <YStack>
              {filteredTags.map((t) => {
                const isAssigned = assignedTagsProp
                  ? assignedTagsProp.some((a) => a.tagId === t.tagId)
                  : t.isAssigned;
                return (
                  <XStack
                    key={t.tagId}
                    ai="center"
                    px="$3"
                    py="$2.5"
                    gap="$2"
                    onPress={() => handleToggle(t.tagId, isAssigned)}
                    pressStyle={{ backgroundColor: "$gray3" }}
                    opacity={isPending ? 0.6 : 1}
                    style={
                      isAssigned
                        ? { backgroundColor: hexToRgba(t.color, 0.08) }
                        : undefined
                    }
                  >
                    <Text
                      flex={1}
                      fontSize={13}
                      fontWeight={isAssigned ? "600" : "500"}
                      style={{ color: t.color }}
                    >
                      #{t.title}
                    </Text>
                    {isAssigned && (
                      <Check size={18} color={t.color} strokeWidth={3} />
                    )}
                  </XStack>
                );
              })}

              {filteredTags.length === 0 && !showCreate && (
                <YStack p="$3" ai="center">
                  <Text fontSize={12} color="$gray8">
                    No tags found
                  </Text>
                </YStack>
              )}

              {/* Create tag section */}
              {showCreate && (
                <>
                  <XStack
                    px="$3"
                    py="$2"
                    gap="$2"
                    flexWrap="wrap"
                    justifyContent="center"
                    alignItems="center"
                    borderTopWidth={filteredTags.length > 0 ? 0.5 : 0}
                    borderTopColor="$gray5"
                  >
                    {TAG_COLORS.map((c) => (
                      <View key={c} justifyContent="center" alignItems="center">
                        <View
                          width={20}
                          height={20}
                          borderRadius={999}
                          onPress={() => setSelectedColor(c)}
                          pressStyle={{ opacity: 0.7 }}
                          borderWidth={selectedColor === c ? 2.5 : 0}
                          borderColor={
                            selectedColor === c ? "$gray12" : "transparent"
                          }
                          style={{ backgroundColor: c }}
                        />
                      </View>
                    ))}
                  </XStack>

                  <XStack
                    ai="center"
                    px="$3"
                    py="$2.5"
                    gap="$2"
                    borderTopWidth={0.5}
                    borderTopColor="$gray5"
                    onPress={handleCreate}
                    pressStyle={{ backgroundColor: "$gray3" }}
                    opacity={isCreating ? 0.5 : 1}
                  >
                    {isCreating ? (
                      <Spinner size="small" />
                    ) : (
                      <Plus size={14} color="$gray11" />
                    )}

                    <Text fontSize={13} color="$gray11">
                      Create tag{" "}
                      <Text
                        fontSize={13}
                        fontWeight="600"
                        style={{ color: selectedColor }}
                      >
                        #{trimmedQuery}
                      </Text>
                    </Text>

                    <View flex={1} />

                    <View
                      width={10}
                      height={10}
                      borderRadius={99}
                      style={{ backgroundColor: selectedColor }}
                    />
                  </XStack>
                </>
              )}
            </YStack>
          )}
        </YStack>
      )}
    </YStack>
  );
}

const inputStyle = {
  flex: 1,
  fontSize: 13,
  paddingVertical: 0,
  outlineStyle: "none",
} as any;
