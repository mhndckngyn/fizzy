import React, { useState } from "react";
import { Alert } from "react-native";
import { Button, Input, Spinner, Text, View, XStack, YStack } from "tamagui";
import { Tag, X, Plus, Check } from "@tamagui/lucide-icons-2";
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

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

type TagPillProps = {
  tagId: string;
  title: string;
  color: string;
  onRemove?: () => void;
};

function TagPill({ tagId, title, color, onRemove }: TagPillProps) {
  return (
    <XStack
      ai="center"
      gap="$1.5"
      px="$2"
      py="$1"
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
  assignedTags: { tagId: string; title: string; color: string }[];
};

export function TagSection({ teamId, boardId, cardId, assignedTags }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newColor, setNewColor] = useState(TAG_COLORS[0]);

  const { data: allTags = [], isLoading } = useTags(teamId);
  const { mutateAsync: createTag, isPending: isCreating } =
    useCreateTag(teamId);
  const { mutateAsync: addTag, isPending: isAdding } = useAddTagToCard(
    teamId,
    boardId,
    cardId,
  );
  const { mutateAsync: removeTag, isPending: isRemoving } =
    useRemoveTagFromCard(teamId, boardId, cardId);

  const assignedIds = new Set(assignedTags.map((t) => t.tagId));

  const handleToggle = async (tagId: string) => {
    try {
      if (assignedIds.has(tagId)) {
        await removeTag(tagId);
      } else {
        await addTag(tagId);
      }
    } catch {
      Alert.alert("Lỗi", "Không thể cập nhật tag.");
    }
  };

  const handleCreate = async () => {
    const title = newTitle.trim();
    if (!title) return;
    try {
      const created = await createTag({ title, color: newColor });
      await addTag(created.tagId);
      setNewTitle("");
    } catch {
      Alert.alert("Lỗi", "Không thể tạo tag.");
    }
  };

  const isPending = isAdding || isRemoving;

  return (
    <YStack gap="$2">
      {/* Assigned tags row */}
      <XStack flexWrap="wrap" gap="$1.5" ai="center">
        {assignedTags.map((t) => (
          <TagPill
            key={t.tagId}
            {...t}
            onRemove={() => handleToggle(t.tagId)}
          />
        ))}
        <XStack
          ai="center"
          gap="$1"
          px="$2"
          py="$1"
          borderRadius={999}
          borderWidth={0.5}
          borderColor="$gray6"
          onPress={() => setPickerOpen((v) => !v)}
          pressStyle={{ opacity: 0.6 }}
        >
          <Tag size={13} color="$gray9" />
          <Text fontSize={12} color="$gray9">
            {pickerOpen ? "Close" : "Add tag"}
          </Text>
        </XStack>
        {isPending && <Spinner size="small" color="$gray9" />}
      </XStack>

      {/* Picker */}
      {pickerOpen && (
        <YStack
          p="$3"
          gap="$3"
          borderRadius="$3"
          borderWidth={0.5}
          borderColor="$gray5"
          backgroundColor="$gray2"
        >
          {/* Existing tags */}
          {isLoading ? (
            <Spinner size="small" />
          ) : (
            <YStack gap="$1.5">
              <Text fontSize={11} color="$gray9" fontWeight="500">
                Available tags
              </Text>
              <XStack flexWrap="wrap" gap="$1.5">
                {allTags.map((t) => {
                  const selected = assignedIds.has(t.tagId);
                  return (
                    <XStack
                      key={t.tagId}
                      ai="center"
                      gap="$1.5"
                      px="$2"
                      py="$1"
                      borderRadius={999}
                      borderWidth={selected ? 1.5 : 0.5}
                      onPress={() => handleToggle(t.tagId)}
                      pressStyle={{ opacity: 0.7 }}
                      style={{
                        backgroundColor: hexToRgba(t.color, 0.13),
                        borderColor: hexToRgba(t.color, selected ? 0.8 : 0.3),
                      }}
                    >
                      <View
                        width={7}
                        height={7}
                        borderRadius={99}
                        style={{ backgroundColor: t.color }}
                      />
                      <Text
                        fontSize={12}
                        fontWeight="500"
                        style={{ color: t.color }}
                      >
                        {t.title}
                      </Text>
                      {selected && <Check size={11} color={t.color} />}
                    </XStack>
                  );
                })}
              </XStack>
            </YStack>
          )}

          {/* Separator */}
          <View height={0.5} backgroundColor="$gray5" />

          {/* Create new tag */}
          <YStack gap="$2">
            <Text fontSize={11} color="$gray9" fontWeight="500">
              New tag
            </Text>
            {/* Color picker */}
            <XStack flexWrap="wrap" gap="$1.5">
              {TAG_COLORS.map((c) => (
                <View
                  key={c}
                  width={22}
                  height={22}
                  borderRadius={999}
                  onPress={() => setNewColor(c)}
                  pressStyle={{ opacity: 0.7 }}
                  borderWidth={newColor === c ? 2 : 0}
                  borderColor={newColor === c ? "$gray12" : "transparent"}
                  style={{ backgroundColor: c }}
                />
              ))}
            </XStack>
            <XStack gap="$2" ai="center">
              <Input
                flex={1}
                size="$2"
                placeholder="Tag title..."
                value={newTitle}
                onChangeText={setNewTitle}
                maxLength={40}
              />
              <Button
                size="$2"
                onPress={handleCreate}
                disabled={!newTitle.trim() || isCreating}
                opacity={!newTitle.trim() || isCreating ? 0.4 : 1}
                icon={
                  isCreating ? <Spinner size="small" /> : <Plus size={14} />
                }
              >
                Create
              </Button>
            </XStack>
          </YStack>
        </YStack>
      )}
    </YStack>
  );
}
