import React, { useRef, useState, useCallback } from "react";
import { Alert, TextInput, TouchableOpacity } from "react-native";
import { Spinner, Text, View, XStack, YStack } from "tamagui";
import { Check, Plus, X, Tags } from "@tamagui/lucide-icons-2";
import { useTags } from "../use-list-tags";
import { useCreateTag } from "../use-create-tag";

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

type Props = {
  teamId: string;
  selectedTagIds: string[];
  onToggle: (tagId: string) => void;
};

export function TagPickerSection({ teamId, selectedTagIds, onToggle }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0]);
  const inputRef = useRef<TextInput>(null);

  const { data: allTags = [], isLoading } = useTags(teamId, undefined);
  const { mutateAsync: createTag, isPending: isCreating } =
    useCreateTag(teamId);

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

  const handleCreate = useCallback(async () => {
    if (!trimmedQuery || isCreating) return;
    try {
      const created = await createTag({
        title: trimmedQuery,
        color: selectedColor,
      });
      onToggle(created.tagId); // auto-select sau khi tạo
      setQuery("");
    } catch (err: any) {
      Alert.alert("Lỗi", err?.message ?? "Không thể tạo tag.");
    }
  }, [trimmedQuery, isCreating, selectedColor, createTag, onToggle]);

  const openPicker = () => {
    setPickerOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };
  const closePicker = () => {
    setPickerOpen(false);
    setQuery("");
  };

  // Reuse TagPill từ tag-section nếu export, hoặc inline:
  const selectedTags = allTags.filter((t) => selectedTagIds.includes(t.tagId));

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
      <XStack flexWrap="wrap" gap="$1.5" ai="center">
        {selectedTags.map((t) => (
          <XStack
            key={t.tagId}
            ai="center"
            gap="$1.5"
            px="$2"
            py="$1"
            borderRadius={999}
            borderWidth={0.5}
            style={{
              backgroundColor: hexToRgba(t.color, 0.13),
              borderColor: hexToRgba(t.color, 0.3),
            }}
          >
            <View
              width={7}
              height={7}
              borderRadius={99}
              style={{ backgroundColor: t.color }}
            />
            <Text fontSize={12} fontWeight="500" style={{ color: t.color }}>
              {t.title}
            </Text>
            <View
              onPress={() => onToggle(t.tagId)}
              width={14}
              height={14}
              borderRadius={99}
              ai="center"
              jc="center"
              pressStyle={{ opacity: 0.6 }}
              style={{ backgroundColor: hexToRgba(t.color, 0.2) }}
            >
              <X size={9} color={t.color} />
            </View>
          </XStack>
        ))}

        {!pickerOpen && (
          <XStack
            ai="center"
            gap="$1"
            px="$2"
            py="$1"
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
      </XStack>

      {pickerOpen && (
        <YStack
          borderRadius="$3"
          borderWidth={0.5}
          borderColor="$gray5"
          backgroundColor="$gray2"
          overflow="hidden"
        >
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
              style={
                {
                  flex: 1,
                  fontSize: 13,
                  paddingVertical: 0,
                  outlineStyle: "none",
                } as any
              }
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

          {isLoading ? (
            <YStack p="$3" ai="center">
              <Spinner size="small" />
            </YStack>
          ) : (
            <YStack>
              {filteredTags.map((t) => {
                const isSelected = selectedTagIds.includes(t.tagId);
                return (
                  <XStack
                    key={t.tagId}
                    ai="center"
                    px="$3"
                    py="$2.5"
                    gap="$2"
                    onPress={() => onToggle(t.tagId)}
                    pressStyle={{ backgroundColor: "$gray3" }}
                    style={
                      isSelected
                        ? { backgroundColor: hexToRgba(t.color, 0.08) }
                        : undefined
                    }
                  >
                    <Text
                      flex={1}
                      fontSize={13}
                      fontWeight={isSelected ? "600" : "500"}
                      style={{ color: t.color }}
                    >
                      #{t.title}
                    </Text>
                    {isSelected && (
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
                      <View key={c} jc="center" ai="center">
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
