import { useHeaderStore } from "@/components/workspace-header/use-header-store";
import {
  useCurrentBoardParams,
  useCurrentTeamParams,
} from "@/features/main/_shared/hooks";
import AddColumnButton from "@/features/main/boards/components/add-column-button";
import { useBoards } from "@/features/main/boards/hooks";
import { useGroupedBoardCards } from "@/features/main/cards/hooks";
import { BoardColumn } from "@/features/main/columns/components/board-column";
import { BoardSpecialColumn } from "@/features/main/columns/components/board-special-column";
import { DeleteColumnDialog } from "@/features/main/columns/components/delete-column-dialog";
import { ManageColumnSheet } from "@/features/main/columns/components/manage-column-sheet";
import {
  useCreateColumn,
  useUpdateColumn,
} from "@/features/main/columns/hooks";
import { ColumnWithCards } from "@/features/main/columns/types";
import { Plus, Settings } from "@tamagui/lucide-icons-2";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { Dimensions, ScrollView } from "react-native";
import { Text, View, XStack } from "tamagui";

const { width: windowWidth } = Dimensions.get("window");
const COLUMN_WIDTH = windowWidth * 0.85;
const COLUMN_GAP = 16;
const SIDE_PADDING = (windowWidth - COLUMN_WIDTH) / 2;

const INITIAL_INDEX = 1; // Start on the Maybe column
const initialOffset = INITIAL_INDEX * (COLUMN_WIDTH + COLUMN_GAP);

export default function KanbanBoard() {
  const router = useRouter();
  const { teamId } = useCurrentTeamParams();
  const boardId = useCurrentBoardParams();

  const { data: boardsQuery } = useBoards();
  const boardName = useMemo(() => {
    if (!boardsQuery) {
      return "Loading board name";
    }

    const currentBoard = boardsQuery.boards.find((b) => b.boardId === boardId);
    return currentBoard?.name ?? "Board name unknown";
  }, [boardsQuery, boardId]);

  const boardCards = useGroupedBoardCards(boardId);

  // sheet to create or edit a column
  const [sheetMode, setSheetMode] = useState<"add" | "edit">("add");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState<ColumnWithCards | null>(
    null,
  );

  const { mutate: createColumn } = useCreateColumn();
  const { mutate: updateColumn } = useUpdateColumn();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [columnToDelete, setColumnToDelete] = useState<string | null>(null);

  const setHeader = useHeaderStore((s) => s.setHeader);
  const resetHeader = useHeaderStore((s) => s.resetHeader);

  useFocusEffect(
    useCallback(() => {
      setHeader({
        leftAction: {
          icon: Plus,
          onPress: () => router.push(`/teams/${teamId}/cards/create`),
        },
        rightAction: {
          icon: Settings,
          onPress: () => console.log("TODO: Board settings"),
        },
      });

      return resetHeader;
    }, [teamId, setHeader, resetHeader, router]),
  );

  const openAddSheet = () => {
    setSheetMode("add");
    setEditingColumn(null);
    setSheetOpen(true);
  };

  const openEditSheet = (col: ColumnWithCards) => {
    setSheetMode("edit");
    setEditingColumn(col);
    setSheetOpen(true);
  };

  const handleSheetSubmit = (name: string, colorHex: string) => {
    if (sheetMode === "add") {
      createColumn({
        teamId,
        boardId,
        name,
        color: colorHex,
      });
      // TODO toast success
    } else if (sheetMode === "edit" && editingColumn) {
      updateColumn({
        teamId,
        boardId,
        columnId: editingColumn.columnId,
        name,
        color: colorHex,
      });
      // TODO toast success
    }
  };

  const confirmDeleteColumn = (columnId: string) => {
    // Backend not done
    // setColumnToDelete(columnId);
    // setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (columnToDelete) {
      setColumnToDelete(null);
      // TODO send request
    }
  };

  if (!boardCards) {
    return <Text>Loading board...</Text>; // TODO better loading
  }

  return (
    <>
      <View flex={1} bg="$background" pt="$2">
        <Text ta={"center"} fontWeight={"600"} fontSize={"$4"}>
          {boardName}
        </Text>

        <View mb="$2.5"></View>

        <ScrollView
          horizontal
          contentOffset={{ x: initialOffset, y: 0 }}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: SIDE_PADDING }}
          snapToInterval={COLUMN_WIDTH + COLUMN_GAP}
          snapToAlignment="start"
          decelerationRate="fast"
        >
          <XStack gap={COLUMN_GAP}>
            <BoardSpecialColumn
              name="Not Now"
              cards={boardCards.notNowCards}
              width={COLUMN_WIDTH}
              boardName={boardName}
            />

            <BoardSpecialColumn
              name="Maybe"
              cards={boardCards.maybeCards}
              width={COLUMN_WIDTH}
              boardName={boardName}
            />

            {boardCards.columnCards.map((col, index) => (
              <BoardColumn
                key={col.columnId}
                column={col}
                width={COLUMN_WIDTH}
                onEdit={openEditSheet}
                isFirstColumn={index === 0}
                isLastColumn={index === boardCards.columnCards.length - 1}
                onDelete={confirmDeleteColumn}
                boardName={boardName}
              />
            ))}

            <BoardSpecialColumn
              name="Done"
              cards={boardCards.doneCards}
              width={COLUMN_WIDTH}
              boardName={boardName}
            />

            <AddColumnButton onPress={openAddSheet} />
          </XStack>
        </ScrollView>
      </View>

      <ManageColumnSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        mode={sheetMode}
        initialName={editingColumn?.name}
        initialColorHex={editingColumn?.color}
        onSubmit={handleSheetSubmit}
      />

      <DeleteColumnDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
