import {
  useCurrentBoardParams,
  useCurrentTeamParams,
} from "@/features/main/_shared/hooks";
import { useBoards } from "@/features/main/boards/use-boards";
import { useUpdateBoard } from "@/features/main/boards/use-update-board";
import { Pencil, X } from "@tamagui/lucide-icons-2";
import { useState } from "react";
import { Spinner, Text, View, XStack, YStack } from "tamagui";

const VALID_PERIOD_DAYS = [3, 7, 11, 30, 90, 365] as const;

function formatDays(days: number): string {
  if (days === 365) return "1 year";
  if (days === 90) return "3 months";
  if (days === 30) return "1 month";
  return `${days} days`;
}

// null = "use team default" sentinel
type Selection = number | null;

export function BoardAutoClosePeriodSection({ canEdit }: { canEdit: boolean }) {
  const { teamId } = useCurrentTeamParams();
  const boardId = useCurrentBoardParams();
  const { data } = useBoards();
  const { mutate, isPending } = useUpdateBoard();

  const board = data?.boards.find((b) => b.boardId === boardId);
  const currentPeriod = board?.autoClosePeriodDays ?? null;
  const teamPeriod = board?.teamAutoClosePeriodDays ?? 30;
  const currentName = board?.name ?? "";

  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<Selection>(currentPeriod);
  const [saveError, setSaveError] = useState<string | null>(null);

  function handleStartEdit() {
    setSelected(currentPeriod);
    setEditing(true);
  }

  function handleCancel() {
    setEditing(false);
    setSaveError(null);
  }

  function handleSelect(value: Selection) {
    if (value === currentPeriod) {
      setEditing(false);
      return;
    }
    setSaveError(null);
    mutate(
      {
        teamId,
        boardId,
        name: currentName,
        autoClosePeriodDays: value,
      },
      {
        onSuccess: () => setEditing(false),
        onError: () => setSaveError("Failed to save. Please try again."),
      },
    );
  }

  const effectivePeriod = currentPeriod ?? teamPeriod;

  return (
    <YStack gap="$2">
      <XStack ai="center" gap="$2">
        <YStack f={1}>
          <Text
            fontSize="$3"
            fontWeight="700"
            color="$gray9"
            letterSpacing={0.5}
            textTransform="uppercase"
          >
            Auto-close period
          </Text>
          <Text fontSize="$2" color="$gray9" mt="$0.5">
            Cards inactive for this long are moved to &quot;Not Now&quot;
            automatically
          </Text>
        </YStack>

        {canEdit && !editing && (
          <View
            onPress={handleStartEdit}
            pressStyle={{ opacity: 0.6 }}
            cursor="pointer"
            p="$1"
          >
            <Pencil size={18} color="$gray9" />
          </View>
        )}

        {editing && (
          <View
            onPress={handleCancel}
            pressStyle={{ opacity: 0.6 }}
            cursor="pointer"
            p="$1"
          >
            <X size={18} color="$gray9" />
          </View>
        )}
      </XStack>

      {editing ? (
        isPending ? (
          <XStack ai="center" gap="$2" pt="$1">
            <Spinner size="small" />
            <Text fontSize="$4" color="$gray9">
              Saving…
            </Text>
          </XStack>
        ) : (
          <YStack gap="$2" pt="$1">
            <Text fontSize="$2" color="$gray8">
              Choose an override, or use the team default (
              {formatDays(teamPeriod)}).
            </Text>
            <XStack flexWrap="wrap" gap="$2">
              {/* Team default chip */}
              {(() => {
                const isActive = selected === null;
                return (
                  <View
                    onPress={() => {
                      setSelected(null);
                      handleSelect(null);
                    }}
                    pressStyle={{ opacity: 0.7 }}
                    cursor="pointer"
                    px="$3"
                    py="$1.5"
                    br="$10"
                    borderWidth={1}
                    borderColor={isActive ? "$blue9" : "$gray5"}
                    bg={isActive ? "$blue9" : "transparent"}
                  >
                    <Text
                      fontSize="$3"
                      fontWeight="600"
                      color={isActive ? "white" : "$color"}
                    >
                      Team default ({formatDays(teamPeriod)})
                    </Text>
                  </View>
                );
              })()}

              {/* Board-specific override chips */}
              {VALID_PERIOD_DAYS.map((days) => {
                const isActive = selected === days;
                return (
                  <View
                    key={days}
                    onPress={() => {
                      setSelected(days);
                      handleSelect(days);
                    }}
                    pressStyle={{ opacity: 0.7 }}
                    cursor="pointer"
                    px="$3"
                    py="$1.5"
                    br="$10"
                    borderWidth={1}
                    borderColor={isActive ? "$blue9" : "$gray5"}
                    bg={isActive ? "$blue9" : "transparent"}
                  >
                    <Text
                      fontSize="$3"
                      fontWeight="600"
                      color={isActive ? "white" : "$color"}
                    >
                      {formatDays(days)}
                    </Text>
                  </View>
                );
              })}
            </XStack>
            {saveError && (
              <Text fontSize="$2" color="$red9">
                {saveError}
              </Text>
            )}
          </YStack>
        )
      ) : (
        <YStack gap="$1">
          <Text fontSize="$5" fontWeight="600" color="$color">
            {formatDays(effectivePeriod)}
          </Text>
          {currentPeriod === null ? (
            <Text fontSize="$2" color="$gray8">
              Using team default
            </Text>
          ) : (
            <Text fontSize="$2" color="$gray8">
              Board override · Team default is {formatDays(teamPeriod)}
            </Text>
          )}
        </YStack>
      )}
    </YStack>
  );
}
