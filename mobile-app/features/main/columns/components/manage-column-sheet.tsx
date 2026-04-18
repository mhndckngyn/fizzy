import React, { useEffect, useState } from "react";
import { Button, Input, Sheet, Text, View, XStack, YStack } from "tamagui";

export const COLOR_OPTIONS = [
  "#E05D5D",
  "#D4773B",
  "#28A745",
  "#17A2B8",
  "#4A90E2",
  "#9B59B6",
  "#E83E8C",
  "#A2B0A6",
  "#7F8C8D",
];

interface ManageColumnSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  initialName?: string;
  initialColorHex?: string;
  onSubmit: (name: string, colorHex: string) => void;
}

export function ManageColumnSheet({
  open,
  onOpenChange,
  mode,
  initialName = "",
  initialColorHex = COLOR_OPTIONS[0],
  onSubmit,
}: ManageColumnSheetProps) {
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(initialColorHex);

  // Sync state when opened for editing
  useEffect(() => {
    if (open) {
      setName(initialName);
      setColor(initialColorHex);
    }
  }, [open, initialName, initialColorHex]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit(name, color);
    onOpenChange(false);
  };

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      snapPointsMode="fit"
      dismissOnSnapToBottom
      zIndex={100000}
      moveOnKeyboardChange
    >
      <Sheet.Overlay />
      <Sheet.Handle />
      <Sheet.Frame padding="$4" gap="$5" bg="$background" pb="$6">
        <Text fontSize={20} fontWeight="bold" col="$color">
          {mode === "add" ? "Add a Column" : "Edit Column"}
        </Text>

        <Input
          value={name}
          onChangeText={setName}
          placeholder="Column Name..."
          size="$4"
          placeholderTextColor="$color8"
        />

        <View>
          <Text fontSize={14} mb="$3" col="$color" fontWeight="bold">
            Color Label
          </Text>
          <YStack gap="$1" width="100%">
            {[0, 1, 2].map((row) => (
              <XStack key={row} gap="$1">
                {COLOR_OPTIONS.slice(row * 3, row * 3 + 3).map((c) => (
                  <View
                    key={c}
                    flex={1}
                    height={50}
                    borderRadius="$1"
                    bg={c as any}
                    borderWidth={3}
                    borderColor={color === c ? "$color" : "transparent"}
                    onPress={() => setColor(c)}
                  />
                ))}
              </XStack>
            ))}
          </YStack>
        </View>

        <Button
          mt="$2"
          bg="$blue9"
          size="$4"
          disabled={!name.trim()}
          opacity={!name.trim() ? 0.5 : 1}
          onPress={handleSubmit}
        >
          <Text col="white" fontWeight="bold">
            {mode === "add" ? "Create Column" : "Save Changes"}
          </Text>
        </Button>
      </Sheet.Frame>
    </Sheet>
  );
}
