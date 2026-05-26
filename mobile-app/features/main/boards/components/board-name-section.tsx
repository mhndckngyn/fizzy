import {
  useCurrentBoardParams,
  useCurrentTeamParams,
} from "@/features/main/_shared/hooks";
import { useBoards } from "@/features/main/boards/use-boards";
import { useUpdateBoard } from "@/features/main/boards/use-update-board";
import { Check, Pencil, X } from "@tamagui/lucide-icons-2";
import { useState } from "react";
import { Input, Spinner, Text, View, XStack, YStack } from "tamagui";

export function BoardNameSection({ canEdit }: { canEdit: boolean }) {
  const { teamId } = useCurrentTeamParams();
  const boardId = useCurrentBoardParams();
  const { data } = useBoards();
  const { mutate, isPending } = useUpdateBoard();

  const board = data?.boards.find((b) => b.boardId === boardId);
  const currentName = board?.name ?? "";
  const currentPeriod = board?.autoClosePeriodDays;

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");

  function handleStartEdit() {
    setName(currentName);
    setEditing(true);
  }

  function handleCancel() {
    setEditing(false);
  }

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed || trimmed === currentName) {
      setEditing(false);
      return;
    }
    mutate(
      { teamId, boardId, name: trimmed, autoClosePeriodDays: currentPeriod },
      { onSuccess: () => setEditing(false) },
    );
  }

  return (
    <YStack gap="$1.5">
      <Text
        fontSize="$3"
        fontWeight="700"
        color="$gray9"
        letterSpacing={0.5}
        textTransform="uppercase"
      >
        Board name
      </Text>

      {editing ? (
        <XStack ai="center" gap="$2">
          <Input
            f={1}
            value={name}
            onChangeText={setName}
            autoFocus
            onSubmitEditing={handleSave}
            returnKeyType="done"
          />
          {isPending ? (
            <Spinner size="small" />
          ) : (
            <>
              <View
                onPress={handleSave}
                pressStyle={{ opacity: 0.6 }}
                cursor="pointer"
                p="$1"
              >
                <Check size={20} color="$green9" />
              </View>
              <View
                onPress={handleCancel}
                pressStyle={{ opacity: 0.6 }}
                cursor="pointer"
                p="$1"
              >
                <X size={20} color="$gray9" />
              </View>
            </>
          )}
        </XStack>
      ) : (
        <XStack ai="center" gap="$2">
          <Text f={1} fontSize="$5" fontWeight="600" color="$color">
            {currentName}
          </Text>
          {canEdit && (
            <View
              onPress={handleStartEdit}
              pressStyle={{ opacity: 0.6 }}
              cursor="pointer"
              p="$1"
            >
              <Pencil size={18} color="$gray9" />
            </View>
          )}
        </XStack>
      )}
    </YStack>
  );
}
