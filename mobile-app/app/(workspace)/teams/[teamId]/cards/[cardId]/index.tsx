import { useHeaderStore } from "@/components/workspace-header/use-header-store";
import { useCurrentTeamParams } from "@/features/main/_shared/hooks";
import { useBoards } from "@/features/main/boards/use-boards";
import { AssignCardSection } from "@/features/main/cards/components/assign-card-section";
import ActivitySection from "@/features/main/cards/components/card-details-page/activity-section";
import CardStaticView from "@/features/main/cards/components/card-details-page/static-view";
import {
  BoardSelector,
  CardBodyEditor,
  CardTitleInput,
} from "@/features/main/cards/components/card-form-components";
import {
  ColumnMoveSection,
  ColumnMoveTarget,
} from "@/features/main/cards/components/column-move-section";
import {
  useAssignCard,
  useUnassignCard,
} from "@/features/main/cards/use-assign-card";
import { useCard } from "@/features/main/cards/use-card";
import { useCardMention } from "@/features/main/cards/use-card-mention";
import {
  useMoveCardToBoard,
  useMoveCardToColumn,
  useMoveCardToSpecialColumn,
} from "@/features/main/cards/use-move-card";
import { useUpdateCard } from "@/features/main/cards/use-update-card";
import { useColumnsbyBoardId } from "@/features/main/columns/use-get-columns";
import { useMemberMention } from "@/features/main/members/use-member-mention";
import { useMembers } from "@/features/main/members/use-members";
import { useTogglePin, usePinnedCards } from "@/features/main/pins/use-pins";
import { useSetCardWatch } from "@/features/main/cards/use-set-card-watch";
import {
  ArrowLeft,
  Bell,
  BellOff,
  Pin,
  PinOff,
  Save,
  Tags,
  X,
  Star,
  StarOff,
} from "@tamagui/lucide-icons-2";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import {
  Button,
  Card,
  ScrollView,
  Separator,
  Spinner,
  Text,
  View,
  XStack,
  YStack,
  ZStack,
} from "tamagui";
import { TagSection } from "@/features/main/tags/components/tag-section";
import { useToggleCardGolden } from "@/features/main/cards/use-toggle-card-golden";

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

const SPECIAL_COLOR = "#3d4e65";

export default function CardDetailPage() {
  const { cardId } = useLocalSearchParams<{ cardId: string }>();
  const { teamId } = useCurrentTeamParams();

  const { data: cardData, isLoading: isCardLoading } = useCard(teamId, cardId);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedMemberIds, setAssignedMemberIds] = useState<string[]>([]);
  const [boardId, setBoardId] = useState("");

  const [isEditing, setEditing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const { data: pinnedCards } = usePinnedCards();
  const { mutate: togglePin, isPending: isPendingPinning } = useTogglePin();
  const { mutate: setCardWatch, isPending: isPendingWatching } =
    useSetCardWatch(cardId);

  const isPinned = pinnedCards?.some((p) => p.cardId === cardId) ?? false;
  const isWatchingCard = cardData?.isWatching ?? false;

  const { mutate: toggleGolden, isPending: isPendingGolden } =
    useToggleCardGolden();

  const isGolden = cardData?.isGolden ?? false;

  useEffect(() => {
    if (!cardData) return;
    setTitle(cardData.title ?? "");
    setDescription(cardData.body ?? "");
    setAssignedMemberIds(cardData.assignments.map((a) => a.memberId));
    setBoardId(cardData.boardId);
  }, [cardData]);

  const { data: boards } = useBoards();
  const { data: members } = useMembers();
  const { data: columns } = useColumnsbyBoardId(boardId);
  const { data: cardMentionList } = useCardMention();
  const memberMentionList = useMemberMention();

  const columnColor = useMemo(() => {
    const fallbackColor = "#8f9297";
    if (!cardData || !columns) return fallbackColor;
    if (cardData.maybeId || cardData.notNowId || cardData.doneId)
      return SPECIAL_COLOR;
    return (
      columns.find((c) => c.columnId === cardData.columnId)?.color ??
      fallbackColor
    );
  }, [cardData, columns]);

  const boardName = useMemo(() => {
    if (!cardData || !boards) return "Loading board name";
    return (
      boards.boards.find((b) => b.boardId === cardData.boardId)?.name ??
      "Loading board name"
    );
  }, [cardData, boards]);

  const bgColor = `${columnColor}10`;

  const { mutateAsync: updateCard, isPending: isUpdating } =
    useUpdateCard(boardId);
  const { mutateAsync: assignCard, isPending: isAssigning } =
    useAssignCard(boardId);
  const { mutateAsync: unassignCard, isPending: isUnassigning } =
    useUnassignCard(boardId);
  const { mutateAsync: moveSpecial, isPending: isMovingSpecial } =
    useMoveCardToSpecialColumn(boardId);
  const { mutateAsync: moveToColumn, isPending: isMovingColumn } =
    useMoveCardToColumn(boardId);
  const { mutateAsync: moveToBoard, isPending: isMovingBoard } =
    useMoveCardToBoard(boardId);

  const isMovePending = isMovingBoard || isMovingSpecial || isMovingColumn;
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
      setEditing(false);
    } catch {
      showToast("Failed to update card", "error");
    }
  };

  const handleCancelEdit = () => {
    setTitle(cardData?.title || "");
    setDescription(cardData?.body || "");
    setIsDirty(false);
    setEditing(false);
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
      if (
        target.type === "maybe" ||
        target.type === "done" ||
        target.type === "not-now"
      ) {
        await moveSpecial({ teamId, boardId, cardId, target: target.type });
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
      <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={90}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <YStack p="$2" gap="$3">
            {/* VIEW OR EDIT CARD */}
            <Card borderRadius="$1" backgroundColor={bgColor}>
              {/* HEADER: card badge + pin button */}
              <XStack ai="center">
                {/* Card number + board name badge */}
                <XStack
                  gap="$2"
                  ai="center"
                  backgroundColor={columnColor}
                  paddingHorizontal="$3"
                  paddingVertical="$1.5"
                  borderTopLeftRadius="$1"
                  borderBottomRightRadius="$1"
                  display={"inline"}
                >
                  <Text color="white" fontWeight="900" fontSize="$2">
                    {cardData.no}
                  </Text>
                  <Separator
                    vertical
                    borderColor="white"
                    opacity={0.5}
                    height={15}
                  />
                  <Text
                    color="white"
                    fontWeight="700"
                    fontSize="$2"
                    textTransform="uppercase"
                    letterSpacing={1}
                  >
                    {boardName}
                  </Text>
                </XStack>

                {/* Spacer */}
                <View flex={1} />
              </XStack>

              {/* VIEW MODE */}
              <View padding="$3" paddingTop="$2">
                {!isEditing && (
                  <CardStaticView
                    teamId={teamId}
                    title={title}
                    htmlContent={description}
                    activeColor={columnColor}
                    onEditPress={() => setEditing(true)}
                    createdAt={cardData.createdAt}
                    creatorName={cardData.creatorName}
                    updatedAt={cardData.updatedAt}
                  />
                )}
                {/* EDIT MODE */}
                <YStack
                  position={isEditing ? "relative" : "absolute"}
                  top={isEditing ? 0 : -9999}
                  left={isEditing ? 0 : -9999}
                  opacity={isEditing ? 1 : 0}
                  pointerEvents={isEditing ? "auto" : "none"}
                  width="100%"
                  zIndex={isEditing ? 1 : -1}
                >
                  <CardTitleInput
                    value={title}
                    onChange={(v) => {
                      setTitle(v);
                      setIsDirty(true);
                    }}
                  />
                  <YStack mt="$2">
                    <CardBodyEditor
                      key={cardId}
                      initialContent={description}
                      onContentChange={(html) => {
                        setDescription(html);
                        setIsDirty(true);
                      }}
                      memberList={memberMentionList}
                      cardList={cardMentionList}
                    />
                  </YStack>
                  {/* Action Buttons */}
                  <XStack mt="$4" gap="$3" jc="center">
                    <Button
                      size="$3"
                      backgroundColor="$blue9"
                      br="$8"
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
                        {isUpdating ? "Saving..." : "Save Changes"}
                      </Button.Text>
                    </Button>
                    <Button
                      flex={1}
                      size="$3"
                      backgroundColor="$gray4"
                      circular
                      onPress={handleCancelEdit}
                      disabled={isUpdating}
                      icon={<X size={18} color="$gray11" />}
                    />
                  </XStack>
                </YStack>
              </View>
            </Card>

            <Card padding="$3" backgroundColor={bgColor}>
              <TagSection
                teamId={teamId}
                boardId={boardId}
                cardId={cardId}
                assignedTags={cardData.tags ?? []}
              />
            </Card>

            {/* SELECT BOARD OR COLUMN */}
            <Card
              p="$3"
              gap="$2"
              borderRadius="$4"
              overflow="hidden"
              backgroundColor={bgColor}
            >
              <ZStack>
                <YStack opacity={isMovePending ? 0.5 : 1}>
                  <BoardSelector
                    boards={boards?.boards ?? []}
                    selectedBoardId={boardId}
                    onSelect={(id) => {
                      setBoardId(id);
                      handleMoveToBoard(id);
                    }}
                    disabled={isMovePending}
                  />
                  <Separator my="$3.5" borderColor="$gray7" opacity={0.5} />
                  <ColumnMoveSection
                    columns={columns ?? []}
                    currentTarget={currentTarget}
                    onMove={handleMove}
                    isPending={isMovePending}
                  />
                </YStack>
                {isMovePending && (
                  <YStack
                    position="absolute"
                    fullscreen
                    ai="center"
                    jc="center"
                    backgroundColor="$backgroundTransparent"
                    zIndex={10}
                  >
                    <XStack gap="$1.5" ai="center">
                      <Spinner size="small" color="$blue10" />
                      <Text fontSize={12} fontWeight="600" color="$blue10">
                        Moving...
                      </Text>
                    </XStack>
                  </YStack>
                )}
              </ZStack>
            </Card>

            {/* ASSIGNMENTS */}
            <Card padding="$3" backgroundColor={bgColor}>
              <AssignCardSection
                members={members?.members ?? []}
                assignedMemberIds={assignedMemberIds}
                onToggle={handleToggleAssign}
                isPending={isAssignPending}
              />
            </Card>

            {/* ACTION BUTTONS */}
            <XStack jc="center">
              <XStack
                jc="center"
                gap="$4"
                backgroundColor={bgColor}
                paddingVertical="$1.5"
                paddingHorizontal="$3"
                borderRadius="$8"
                borderColor={`${columnColor}40`}
                borderWidth={2}
              >
                {/* Golden */}
                <XStack
                  p="$2"
                  borderRadius="$3"
                  onPress={() => toggleGolden({ teamId, boardId, cardId })}
                  disabled={isPendingGolden}
                  pressStyle={{ opacity: 0.6 }}
                  opacity={isPendingGolden ? 0.5 : 1}
                >
                  {isGolden ? (
                    <StarOff size={22} color="#586e8c" />
                  ) : (
                    <Star size={22} color="$gray8" />
                  )}
                </XStack>

                <XStack
                  p="$2"
                  borderRadius="$3"
                  onPress={() => setCardWatch(!isWatchingCard)}
                  disabled={isPendingWatching}
                  pressStyle={{ opacity: 0.6 }}
                  opacity={isPendingWatching ? 0.5 : 1}
                >
                  {isWatchingCard ? (
                    <BellOff size={22} color="#586e8c" />
                  ) : (
                    <Bell size={22} color="$gray8" />
                  )}
                </XStack>

                <XStack
                  p="$2"
                  borderRadius="$3"
                  onPress={() => togglePin(cardId)}
                  disabled={isPendingPinning}
                  pressStyle={{ opacity: 0.6 }}
                  opacity={isPendingPinning ? 0.5 : 1}
                >
                  {isPinned ? (
                    <PinOff size={22} color="#586e8c" />
                  ) : (
                    <Pin size={22} color="$gray8" />
                  )}
                </XStack>
              </XStack>
            </XStack>

            {cardData && (
              <YStack pb="$5">
                <ActivitySection cardId={cardData.cardId} />
              </YStack>
            )}
          </YStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
