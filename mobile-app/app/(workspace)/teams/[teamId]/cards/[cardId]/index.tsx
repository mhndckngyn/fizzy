import {
  BoardSelector,
  CardBodyEditor,
  CardTitleInput,
} from "@/features/main/cards/components/card-form-components";
import { AssignCardSection } from "@/features/main/cards/components/assign-card-section";
import {
  ColumnMoveSection,
  ColumnMoveTarget,
} from "@/features/main/cards/components/column-move-section";
import { useHeaderStore } from "@/components/workspace-header/use-header-store";
import { useCurrentTeamParams } from "@/features/main/_shared/hooks";
import { useBoards } from "@/features/main/boards/hooks";
import {
  useAssignCard,
  useCard,
  useCardMention,
  useMoveCardToDone,
  useMoveCardToMaybe,
  useMoveCardToNotNow,
  useMoveCardToColumn,
  useMoveCardToBoard,
  useUnassignCard,
  useUpdateCard,
} from "@/features/main/cards/hooks";
import { useColumnsbyBoardId } from "@/features/main/columns/hooks";
import { useMemberMention, useMembers } from "@/features/main/members/hooks";
import { ArrowLeft, Save } from "@tamagui/lucide-icons-2";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { Button, Card, ScrollView, Spinner, View, YStack } from "tamagui";

const showToast = (message: string, type: "success" | "error") => {
  if (type === "error") {
    Alert.alert("Lỗi", message);
  } else {
    console.log("[success]", message);
  }
};

function resolveCurrentTarget(card: {
  columnId?: string | null;
  maybeId?: string | null;
  doneId?: string | null;
  notNowId?: string | null;
}): ColumnMoveTarget | undefined {
  if (card.columnId) return { type: "column", columnId: card.columnId };
  if (card.maybeId) return { type: "maybe" };
  if (card.doneId) return { type: "done" };
  if (card.notNowId) return { type: "not-now" };
  return undefined;
}

export default function CardDetailPage() {
  const { cardId } = useLocalSearchParams<{ cardId: string }>();
  const { teamId } = useCurrentTeamParams();

  const { data: cardData, isLoading: isCardLoading } = useCard(teamId, cardId);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedMemberIds, setAssignedMemberIds] = useState<string[]>([]);
  const [boardId, setBoardId] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!cardData) return;
    setTitle(cardData.title ?? "");
    setDescription(cardData.body ?? "");
    setAssignedMemberIds(cardData.assignments.map((a) => a.memberId));
    setBoardId(cardData.boardId);
    setIsReady(true);
  }, [cardData]);

  const { data: boards } = useBoards();
  const { data: members } = useMembers();
  const { data: columns } = useColumnsbyBoardId(boardId);
  const { data: cardMentionList } = useCardMention();
  const memberMentionList = useMemberMention();

  const { mutateAsync: updateCard, isPending: isUpdating } =
    useUpdateCard(boardId);
  const { mutateAsync: assignCard, isPending: isAssigning } =
    useAssignCard(boardId);
  const { mutateAsync: unassignCard, isPending: isUnassigning } =
    useUnassignCard(boardId);
  const { mutateAsync: moveToMaybe, isPending: isMovingMaybe } =
    useMoveCardToMaybe(boardId);
  const { mutateAsync: moveToDone, isPending: isMovingDone } =
    useMoveCardToDone(boardId);
  const { mutateAsync: moveToNotNow, isPending: isMovingNotNow } =
    useMoveCardToNotNow(boardId);
  const { mutateAsync: moveToColumn, isPending: isMovingColumn } =
    useMoveCardToColumn(boardId);
  const { mutateAsync: moveToBoard, isPending: isMovingBoard } =
    useMoveCardToBoard(boardId);

  const isMovePending =
    isMovingMaybe || isMovingDone || isMovingNotNow || isMovingColumn;
  const isAssignPending = isAssigning || isUnassigning;

  const currentTarget = cardData ? resolveCurrentTarget(cardData) : undefined;

  const setHeader = useHeaderStore((s) => s.setHeader);
  const resetHeader = useHeaderStore((s) => s.resetHeader);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      setHeader({
        leftAction: { icon: ArrowLeft, onPress: () => router.back() },
      });
      return resetHeader;
    }, [setHeader, resetHeader, router]),
  );

  const handleSave = async () => {
    try {
      await updateCard({
        boardId,
        cardId,
        title: title.trim() || undefined,
        body: description || undefined,
      });
      showToast("Card updated", "success");
      setIsDirty(false);
    } catch {
      showToast("Failed to update card", "error");
    }
  };

  const handleToggleAssign = async (memberId: string) => {
    const isCurrentlyAssigned = assignedMemberIds.includes(memberId);

    setAssignedMemberIds((prev) =>
      isCurrentlyAssigned
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId],
    );

    try {
      if (isCurrentlyAssigned) {
        await unassignCard({ boardId, cardId, memberId });
      } else {
        await assignCard({ boardId, cardId, memberId });
      }
    } catch {
      setAssignedMemberIds((prev) =>
        isCurrentlyAssigned
          ? [...prev, memberId]
          : prev.filter((id) => id !== memberId),
      );
      showToast("Failed to update assignees", "error");
    }
  };

  const handleMove = async (target: ColumnMoveTarget) => {
    try {
      if (target.type === "maybe") {
        await moveToMaybe({ teamId, boardId, cardId });
      } else if (target.type === "done") {
        await moveToDone({ teamId, boardId, cardId });
      } else if (target.type === "not-now") {
        await moveToNotNow({ teamId, boardId, cardId });
      } else if (target.type === "column") {
        await moveToColumn({
          teamId,
          boardId,
          cardId,
          columnId: target.columnId,
        });
      }
      showToast("Card moved", "success");
    } catch {
      showToast("Failed to move card", "error");
    }
  };

  const handleMoveToBoard = async (targetBoardId: string) => {
    if (targetBoardId === boardId) return;
    try {
      await moveToBoard({ boardId, cardId, targetBoardId });
      setBoardId(targetBoardId);
      showToast("Card moved to board", "success");
    } catch {
      showToast("Failed to move card to board", "error");
    }
  };

  if (isCardLoading || !cardData) {
    return (
      <View f={1} ai="center" jc="center">
        <Spinner size="large" />
      </View>
    );
  }

  return (
    <View f={1}>
      <ScrollView>
        <YStack p="$2" gap="$3">
          <Card paddingInline="$3" paddingBottom="$3" bg="$gray3">
            <ColumnMoveSection
              columns={(columns?.columns ?? []).map((c) => ({
                columnId: c.columnId,
                name: c.name,
                position: c.position,
                color: c.color,
              }))}
              currentTarget={currentTarget}
              onMove={handleMove}
              isPending={isMovePending}
            />
          </Card>

          <Card paddingInline="$3" paddingBottom="$4" bg="$gray3">
            <View py="$2" px="$1">
              <BoardSelector
                boards={boards?.boards ?? []}
                selectedBoardId={boardId}
                onSelect={(id) => {
                  setBoardId(id);
                  handleMoveToBoard(id);
                }}
              />
            </View>

            <CardTitleInput
              value={title}
              onChange={(v) => {
                setTitle(v);
                setIsDirty(true);
              }}
            />

            <YStack mt="$2">
              {/* ✅ Chỉ render khi data đã sẵn sàng, key để force re-mount */}
              {isReady ? (
                <CardBodyEditor
                  key={cardId}
                  initialContent={description}
                  onContentChange={(html) => {
                    setDescription(html);
                    setIsDirty(true);
                  }}
                  onReady={() => {}}
                  isLoading={false}
                  memberList={memberMentionList}
                  cardList={cardMentionList}
                />
              ) : (
                <View ai="center" jc="center" py="$4">
                  <Spinner size="small" />
                </View>
              )}
            </YStack>

            <YStack mt="$4">
              <Button
                size="$4"
                backgroundColor="$blue9"
                br="$5"
                onPress={handleSave}
                disabled={isUpdating || !isDirty}
                opacity={isUpdating || !isDirty ? 0.5 : 1}
                icon={
                  isUpdating ? (
                    <Spinner color="white" />
                  ) : (
                    <Save size={16} color="white" />
                  )
                }
              >
                <Button.Text color="white" fontWeight="bold">
                  {isUpdating ? "Saving…" : "Save Changes"}
                </Button.Text>
              </Button>
            </YStack>
          </Card>

          <Card paddingInline="$3" paddingBottom="$3" bg="$gray3">
            <AssignCardSection
              members={members?.members ?? []}
              assignedMemberIds={assignedMemberIds}
              onToggle={handleToggleAssign}
              isPending={isAssignPending}
            />
          </Card>
        </YStack>
      </ScrollView>
    </View>
  );
}
