import { Columns3 } from "@tamagui/lucide-icons-2";
import React from "react";
import { Button, ScrollView, Text, XStack, YStack } from "tamagui";

type ColumnItem = {
  columnId: string;
  name: string;
  position: number;
  color?: string;
};

export type CardStatus = "column" | "maybe" | "done" | "not-now";

export type ColumnMoveTarget =
  | { type: "not-now" }
  | { type: "maybe" }
  | { type: "column"; columnId: string }
  | { type: "done" };

type ColumnMoveSectionProps = {
  columns: ColumnItem[];
  currentTarget?: ColumnMoveTarget;
  onMove: (target: ColumnMoveTarget) => void;
  isPending?: boolean;
};

const SPECIAL_COLOR = "#3d4e65";

export function ColumnMoveSection({
  columns,
  currentTarget,
  onMove,
  isPending,
}: ColumnMoveSectionProps) {
  const isActiveTarget = (target: ColumnMoveTarget): boolean => {
    if (!currentTarget) return false;
    if (target.type !== currentTarget.type) return false;
    if (target.type === "column" && currentTarget.type === "column") {
      return target.columnId === currentTarget.columnId;
    }
    return true;
  };

  const renderStatusButton = (config: {
    target: ColumnMoveTarget;
    label: string;
  }) => {
    const isActive = isActiveTarget(config.target);

    // Logic for special buttons
    const bgColor = isActive ? SPECIAL_COLOR : `${SPECIAL_COLOR}15`;
    const textColor = isActive ? "white" : SPECIAL_COLOR;
    const borderColor = isActive ? SPECIAL_COLOR : `${SPECIAL_COLOR}30`;

    return (
      <Button
        key={config.label}
        size="$2.5"
        br="$10"
        onPress={() => !isPending && onMove(config.target)}
        backgroundColor={bgColor}
        borderColor={borderColor}
        borderWidth={1}
        pressStyle={{ opacity: 0.8, scale: 0.97 }}
        disabled={isPending || isActive}
      >
        <Text fontSize={12} fontWeight="600" color={textColor}>
          {config.label}
        </Text>
      </Button>
    );
  };

  return (
    <YStack gap="$2.5">
      <XStack ai="center" gap="$2" opacity={0.5}>
        <Columns3 size={14} color="$color" />
        <Text
          fontSize={11}
          fontWeight="700"
          textTransform="uppercase"
          letterSpacing={1}
        >
          Target Column
        </Text>
      </XStack>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <XStack gap="$2">
          {renderStatusButton({
            target: { type: "not-now" },
            label: "Not Now",
          })}
          {renderStatusButton({
            target: { type: "maybe" },
            label: "Maybe",
          })}

          {columns.map((col) => {
            const target: ColumnMoveTarget = {
              type: "column",
              columnId: col.columnId,
            };
            const isActive = isActiveTarget(target);

            const colColor = col.color || "#8f9297";
            const bgColor = isActive ? colColor : `${colColor}15`;
            const textColor = isActive ? "white" : colColor;
            const borderColor = isActive ? colColor : `${colColor}30`;

            return (
              <Button
                key={col.columnId}
                size="$2.5"
                br="$10"
                onPress={() => !isPending && onMove(target)}
                backgroundColor={bgColor}
                borderColor={borderColor}
                borderWidth={1}
                pressStyle={{ opacity: 0.8, scale: 0.97 }}
                disabled={isPending || isActive}
              >
                <Text fontSize={12} fontWeight="600" color={textColor}>
                  {col.name}
                </Text>
              </Button>
            );
          })}

          {renderStatusButton({
            target: { type: "done" },
            label: "Done",
          })}
        </XStack>
      </ScrollView>
    </YStack>
  );
}
