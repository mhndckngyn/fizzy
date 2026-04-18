import {
  CheckCircle,
  Clock,
  HelpCircle,
  Layers,
} from "@tamagui/lucide-icons-2";
import React from "react";
import { Button, ScrollView, Separator, Text, XStack, YStack } from "tamagui";

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
    icon: React.FC<any>;
    activeBg: string;
    activeBorder: string;
    inactiveBg: string;
  }) => {
    const isActive = isActiveTarget(config.target);
    const Icon = config.icon;
    return (
      <Button
        key={config.label}
        size="$3"
        br="$10"
        onPress={() => !isPending && onMove(config.target)}
        backgroundColor={isActive ? config.activeBg : config.inactiveBg}
        borderColor={isActive ? config.activeBorder : "transparent"}
        borderWidth={1}
        pressStyle={{ opacity: 0.8, scale: 0.97 }}
        disabled={isPending || isActive}
        opacity={isActive ? 1 : 0.85}
        gap="$1.5"
      >
        <Icon
          size={13}
          color={isActive ? "white" : "$color"}
          opacity={isActive ? 1 : 0.6}
        />
        <Text
          fontSize={12}
          fontWeight="600"
          color={isActive ? "white" : "$color"}
          opacity={isActive ? 1 : 0.7}
        >
          {config.label}
        </Text>
      </Button>
    );
  };

  return (
    <YStack gap="$3" py="$3">
      {/* Section label */}
      <XStack px="$1" ai="center" gap="$2">
        <Layers size={14} color="$color" opacity={0.5} />
        <Text
          fontSize={12}
          fontWeight="600"
          o={0.5}
          textTransform="uppercase"
          letterSpacing={0.5}
        >
          Move to
        </Text>
      </XStack>

      {/* Row 1: Not Now + Maybe */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <XStack gap="$2" px="$1">
          {renderStatusButton({
            target: { type: "not-now" },
            label: "Not Now",
            icon: Clock,
            activeBg: "$gray8",
            activeBorder: "$gray9",
            inactiveBg: "$gray3",
          })}
          {renderStatusButton({
            target: { type: "maybe" },
            label: "Maybe",
            icon: HelpCircle,
            activeBg: "$yellow9",
            activeBorder: "$yellow10",
            inactiveBg: "$yellow3",
          })}
        </XStack>
      </ScrollView>

      {/* Row 2: Custom columns */}
      {columns.length > 0 && (
        <>
          <Separator mx="$1" opacity={0.15} />
          <Text
            px="$1"
            fontSize={11}
            fontWeight="500"
            o={0.4}
            textTransform="uppercase"
            letterSpacing={0.5}
          >
            Columns
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <XStack gap="$2" px="$1">
              {columns.map((col) => {
                const target: ColumnMoveTarget = {
                  type: "column",
                  columnId: col.columnId,
                };
                const isActive = isActiveTarget(target);
                return (
                  <Button
                    key={col.columnId}
                    size="$3"
                    br="$10"
                    onPress={() => !isPending && onMove(target)}
                    backgroundColor={isActive ? "$blue9" : "$blue3"}
                    borderColor={isActive ? "$blue10" : "transparent"}
                    borderWidth={1}
                    pressStyle={{ opacity: 0.8, scale: 0.97 }}
                    disabled={isPending || isActive}
                    opacity={isActive ? 1 : 0.85}
                  >
                    <Text
                      fontSize={12}
                      fontWeight="600"
                      color={isActive ? "white" : "$blue11"}
                      opacity={isActive ? 1 : 0.8}
                    >
                      {col.name}
                    </Text>
                  </Button>
                );
              })}
            </XStack>
          </ScrollView>
        </>
      )}

      {/* Row 3: Done — always last */}
      <Separator mx="$1" opacity={0.15} />
      <XStack px="$1">
        {renderStatusButton({
          target: { type: "done" },
          label: "Done",
          icon: CheckCircle,
          activeBg: "$green9",
          activeBorder: "$green10",
          inactiveBg: "$green3",
        })}
      </XStack>
    </YStack>
  );
}
