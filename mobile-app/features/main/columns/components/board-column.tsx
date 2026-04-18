import { ColumnWithCards } from "@/features/main/columns/types";
import React from "react";
import { ScrollView } from "react-native";
import { Text, View, XStack, YStack } from "tamagui";
import { ColumnActionsPopover } from "./column-actions-popover";
import { useChangeColumnPosition } from "../hooks";
import {
  useCurrentBoardParams,
  useCurrentTeamParams,
} from "../../_shared/hooks";

interface BoardColumnProps {
  column: ColumnWithCards;
  width: number;
  onEdit: (column: ColumnWithCards) => void;
  isFirstColumn: boolean;
  isLastColumn: boolean;
  onDelete: (columnId: string) => void;
}

export function BoardColumn({
  column,
  width,
  onEdit,
  isFirstColumn,
  isLastColumn,
  onDelete,
}: BoardColumnProps) {
  const { teamId } = useCurrentTeamParams();
  const boardId = useCurrentBoardParams();

  const { mutate: changeColumnPosition } = useChangeColumnPosition();

  const moveColumnLeft = () => {
    if (isFirstColumn) {
      return;
    }

    changeColumnPosition({
      teamId,
      boardId,
      columnId: column.columnId,
      direction: "left",
    });
    //TODO Toast success
  };

  const moveColumnRight = () => {
    if (isLastColumn) {
      return;
    }

    changeColumnPosition({
      teamId,
      boardId,
      columnId: column.columnId,
      direction: "right",
    });
    //TODO Toast success
  };

  return (
    <YStack key={column.columnId} width={width} bg="$color2" br="$4" p="$3">
      {/* Column Header */}
      <XStack ai="center" gap="$2" mb="$3">
        <View width={12} height={12} br="$10" bg={column.color as any} />
        <Text fontSize={16} fontWeight="bold" col="$color">
          {column.name}
        </Text>

        <View flex={1} />

        <ColumnActionsPopover
          onEdit={() => onEdit(column)}
          onMoveLeft={moveColumnLeft}
          onMoveRight={moveColumnRight}
          onDelete={() => onDelete(column.columnId)}
        />
      </XStack>

      {/* Cards Area */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack gap="$2" flex={1}>
          {/* Card list goes here */}
        </YStack>
      </ScrollView>
    </YStack>
  );
}
