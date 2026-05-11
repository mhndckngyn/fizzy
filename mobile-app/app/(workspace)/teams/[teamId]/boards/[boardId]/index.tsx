import ConfirmationDialog from "@/components/confirmation-dialog";
import { useHeaderStore } from "@/components/workspace-header/use-header-store";
import {
  useCurrentBoardParams,
  useCurrentTeamParams,
} from "@/features/main/_shared/hooks";
import { queryKeys } from "@/features/main/_shared/query-keys";
import AddColumnButton from "@/features/main/boards/components/add-column-button";
import { useBoards } from "@/features/main/boards/use-boards";
import { useSetBoardWatch } from "@/features/main/boards/use-set-board-watch";
import { useGroupedBoardCards } from "@/features/main/cards/use-grouped-board-cards";
import { BoardColumn } from "@/features/main/columns/components/board-column";
import { BoardSpecialColumn } from "@/features/main/columns/components/board-special-column";
import { ManageColumnSheet } from "@/features/main/columns/components/manage-column-sheet";
import { ColumnWithCards } from "@/features/main/columns/types";
import { useCreateColumn } from "@/features/main/columns/use-create-column";
import { useUpdateColumn } from "@/features/main/columns/use-update-column";
import { Bell, BellOff, Plus, Settings } from "@tamagui/lucide-icons-2";
import { useFocusEffect, useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import React, { useCallback, useMemo, useState } from "react";
import { Dimensions, RefreshControl, ScrollView } from "react-native";
import { Button, Text, View, XStack } from "tamagui";

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
  const currentBoard = useMemo(
    () => boardsQuery?.boards.find((b) => b.boardId === boardId),
    [boardsQuery, boardId],
  );
  const boardName =
    currentBoard?.name ?? (boardsQuery ? "Unknown board" : "Loading...");
  const isWatching = currentBoard?.isWatching ?? false;

  const { mutate: setBoardWatch, isPending: isWatchPending } =
    useSetBoardWatch();

  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: queryKeys.boardCards(teamId, boardId),
      }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.columns(teamId, boardId),
      }),
    ]);
    setIsRefreshing(false);
  }, [queryClient, teamId, boardId]);

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
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flex: 1 }}
        scrollEnabled={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        <View flex={1} bg="$background" pt="$2">
          <XStack ai="center" jc="center" gap="$2">
            <Button
              size="$2"
              bg={isWatching ? "$blue9" : "$gray4"}
              borderRadius="$10"
              icon={
                isWatching ? <BellOff color="white" /> : <Bell color="$gray9" />
              }
              disabled={isWatchPending}
              onPress={() => setBoardWatch({ boardId, watch: !isWatching })}
              opacity={isWatchPending ? 0.5 : 1}
            >
              <Button.Text
                fontWeight="bold"
                color={isWatching ? "white" : "$gray9"}
              >
                {isWatching ? "Watching" : "Watch"}
              </Button.Text>
            </Button>
            <Text fontWeight={"600"} fontSize={"$4"}>
              {boardName.toUpperCase()}
            </Text>
          </XStack>

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
      </ScrollView>

      <ManageColumnSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        mode={sheetMode}
        initialName={editingColumn?.name}
        initialColorHex={editingColumn?.color}
        onSubmit={handleSheetSubmit}
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        dialogTitle="Delete Column"
        dialogDescription="Are you sure you want to delete this column? This will move the cards back to Maybe."
        confirmText="Delete"
        cancelText="Cancel"
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
