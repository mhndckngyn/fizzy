import {
  ArrowLeft,
  ArrowRight,
  MoreHorizontal,
  Pencil,
  Trash,
} from "@tamagui/lucide-icons-2";
import React from "react";
import { Popover, Text, View, YStack, XStack } from "tamagui";

interface ColumnActionsPopoverProps {
  onEdit: () => void;
  onDelete: () => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
}

export function ColumnActionsPopover({
  onEdit,
  onMoveLeft,
  onMoveRight,
  onDelete,
}: ColumnActionsPopoverProps) {
  return (
    <Popover allowFlip placement="bottom-end" offset={4}>
      <Popover.Trigger asChild>
        <View
          padding="$1"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          pressStyle={{ opacity: 0.5 }}
        >
          <MoreHorizontal size={20} col="$color" />
        </View>
      </Popover.Trigger>

      <Popover.Content
        borderWidth={1}
        borderColor="$borderColor"
        elevate
        padding={0}
      >
        <Popover.Arrow borderWidth={1} borderColor="$borderColor" />
        <YStack py="$2" minWidth={180}>
          <Popover.Close asChild>
            <XStack
              ai="center"
              gap="$3"
              px="$3"
              py="$2"
              pressStyle={{ bg: "$color3" }}
              onPress={onEdit}
            >
              <Pencil size={16} col="$color" />
              <Text col="$color">Edit column</Text>
            </XStack>
          </Popover.Close>
          {!!onMoveLeft && (
            <Popover.Close asChild>
              <XStack
                ai="center"
                gap="$3"
                px="$3"
                py="$2"
                pressStyle={{ bg: "$color3" }}
                onPress={onMoveLeft}
              >
                <ArrowLeft size={16} col="$color" />
                <Text col="$color">Move left</Text>
              </XStack>
            </Popover.Close>
          )}
          {!!onMoveRight && (
            <Popover.Close asChild>
              <XStack
                ai="center"
                gap="$3"
                px="$3"
                py="$2"
                pressStyle={{ bg: "$color3" }}
                onPress={onMoveRight}
                disabled={!onMoveRight}
              >
                <ArrowRight size={16} col="$color" />
                <Text col="$color">Move right</Text>
              </XStack>
            </Popover.Close>
          )}
          <Popover.Close asChild>
            <XStack
              ai="center"
              gap="$3"
              px="$3"
              py="$2"
              pressStyle={{ bg: "$color3" }}
              onPress={onDelete}
            >
              <Trash size={16} col="$red10" />
              <Text col="$red10">Delete</Text>
            </XStack>
          </Popover.Close>
        </YStack>
      </Popover.Content>
    </Popover>
  );
}
