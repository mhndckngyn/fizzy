import { useHeaderStore } from "@/components/workspace-header/use-header-store";
import {
  useCurrentBoardParams,
  useCurrentTeamParams,
} from "@/features/main/_shared/hooks";
import { BoardAccessSection } from "@/features/main/boards/components/board-access-section";
import { BoardAutoClosePeriodSection } from "@/features/main/boards/components/board-auto-close-period-section";
import { BoardNameSection } from "@/features/main/boards/components/board-name-section";
import { useBoardAccesses } from "@/features/main/boards/use-board-accesses";
import { ArrowLeft } from "@tamagui/lucide-icons-2";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import { ScrollView, Separator, Text, YStack } from "tamagui";

export default function BoardSettingsScreen() {
  const router = useRouter();
  const setHeader = useHeaderStore((s) => s.setHeader);
  const resetHeader = useHeaderStore((s) => s.resetHeader);

  const { teamId } = useCurrentTeamParams();
  const boardId = useCurrentBoardParams();
  const { data: accessData } = useBoardAccesses(teamId, boardId);

  const canEdit = accessData?.canManage ?? false;

  useFocusEffect(
    useCallback(() => {
      setHeader({
        leftAction: { icon: ArrowLeft, onPress: () => router.back() },
      });
      return resetHeader;
    }, [setHeader, resetHeader, router]),
  );

  return (
    <YStack f={1} bg="$background">
      <YStack px="$4" paddingBlock="$3">
        <Text fontSize="$6" fontWeight="700" color="$color" textAlign="center">
          Board Settings
        </Text>
      </YStack>

      <ScrollView>
        <YStack px="$4" pb="$4" gap="$4">
          <BoardNameSection canEdit={canEdit} />
          <Separator borderColor="$gray4" />
          <BoardAccessSection canEdit={canEdit} />
          <Separator borderColor="$gray4" />
          <BoardAutoClosePeriodSection canEdit={canEdit} />
        </YStack>
      </ScrollView>
    </YStack>
  );
}
