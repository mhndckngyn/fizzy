import {
  useCurrentBoardParams,
  useCurrentTeamParams,
} from "@/features/main/_shared/hooks";
import { MemberAccessRow } from "@/features/main/boards/components/member-access-row";
import { useBoardAccesses } from "@/features/main/boards/use-board-accesses";
import { useBoards } from "@/features/main/boards/use-boards";
import { useUpdateBoard } from "@/features/main/boards/use-update-board";
import { useCurrentMemberStore } from "@/features/main/members/use-current-member-store";
import { Switch } from "@tamagui/switch";
import { useEffect, useState } from "react";
import {
  Button,
  Input,
  Separator,
  Spinner,
  Text,
  View,
  XStack,
  YStack,
} from "tamagui";

export function BoardAccessSection({ canEdit }: { canEdit: boolean }) {
  const { teamId } = useCurrentTeamParams();
  const boardId = useCurrentBoardParams();

  const { data: boardsQuery } = useBoards();
  const { data, isLoading } = useBoardAccesses(teamId, boardId);
  const currentMemberId = useCurrentMemberStore(
    (s) => s.currentMember?.memberId,
  );
  const { mutate: updateBoard, isPending: isSaving } = useUpdateBoard();

  const [allAccess, setAllAccess] = useState(false);
  const [memberStates, setMemberStates] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!data) {
      return;
    }
    setAllAccess(data.allAccess);

    const initial: Record<string, boolean> = {};
    for (const m of data.members) {
      initial[m.memberId] = m.hasAccess;
    }

    setMemberStates(initial);
  }, [data]);

  function handleSelectAll() {
    if (!data) {
      return;
    }

    const next: Record<string, boolean> = {};
    for (const m of data.members) {
      next[m.memberId] = true;
    }

    setMemberStates(next);
  }

  function handleSelectNone() {
    if (!data) {
      return;
    }

    const next: Record<string, boolean> = {};
    for (const m of data.members) {
      next[m.memberId] = false;
    }

    setMemberStates(next);
  }

  function handleToggleMember(memberId: string, value: boolean) {
    setMemberStates((prev) => ({ ...prev, [memberId]: value }));
  }

  function handleSave() {
    const currentName =
      boardsQuery?.boards.find((b) => b.boardId === boardId)?.name ?? "";

    const retainedMemberIds = Object.entries(memberStates)
      .filter(([, v]) => v)
      .map(([id]) => id);

    updateBoard({
      teamId,
      boardId,
      name: currentName,
      allAccess,
      retainedMemberIds,
    });
  }

  const members = data?.members ?? [];
  const filtered = search.trim()
    ? members.filter(
        (m) =>
          m.name.toLowerCase().includes(search.toLowerCase()) ||
          m.email.toLowerCase().includes(search.toLowerCase()),
      )
    : members;

  return (
    <YStack gap="$3">
      <Text
        fontSize="$3"
        fontWeight="700"
        color="$gray9"
        letterSpacing={0.5}
        textTransform="uppercase"
      >
        Board Accesses
      </Text>

      {isLoading ? (
        <View ai="center" py="$4">
          <Spinner size="large" />
        </View>
      ) : (
        <>
          <XStack ai="center" jc="space-between">
            <Text fontSize="$4" fontWeight="600" color="$color">
              Allow Everyone
            </Text>
            {canEdit ? (
              <Switch
                size="$3"
                checked={allAccess}
                onCheckedChange={setAllAccess}
                backgroundColor={allAccess ? "unset" : "$gray5"}
                activeStyle={{ backgroundColor: "$blue9" }}
              >
                <Switch.Thumb
                  backgroundColor="white"
                  borderColor="$gray6"
                  borderWidth={1}
                  activeStyle={{
                    backgroundColor: "white",
                    borderColor: "$gray8",
                    borderWidth: 1,
                  }}
                />
              </Switch>
            ) : (
              <Text fontSize="$4" color="$gray10">
                {allAccess ? "On" : "Off"}
              </Text>
            )}
          </XStack>

          {!allAccess && canEdit && (
            <XStack gap="$3" jc="flex-end" ai="center">
              <Text onPress={handleSelectAll} fontWeight="bold" color="blue">
                Select all
              </Text>
              <Text onPress={handleSelectNone} fontWeight="bold" color="blue">
                Select none
              </Text>
            </XStack>
          )}

          <Input
            placeholder="Search members..."
            value={search}
            onChangeText={setSearch}
            clearButtonMode="while-editing"
            autoCorrect={false}
            autoCapitalize="none"
          />

          {filtered.length === 0 ? (
            <View ai="center" py="$4">
              <Text color="$gray9" fontSize="$3">
                {search.trim() ? "No members match your search." : "No members"}
              </Text>
            </View>
          ) : (
            <YStack>
              {filtered.map((member, i) => (
                <YStack key={member.memberId}>
                  <MemberAccessRow
                    member={member}
                    hasAccess={memberStates[member.memberId] ?? false}
                    allAccess={allAccess}
                    canEdit={canEdit && member.memberId !== currentMemberId}
                    isSelf={member.memberId === currentMemberId}
                    onToggle={handleToggleMember}
                  />
                  {i < filtered.length - 1 && (
                    <Separator borderColor="$gray4" />
                  )}
                </YStack>
              ))}
            </YStack>
          )}

          <XStack mt="$2" jc="center">
            {canEdit && (
              <Button
                borderRadius="$8"
                backgroundColor="$blue9"
                onPress={handleSave}
                disabled={isSaving}
                opacity={isSaving ? 0.6 : 1}
                icon={
                  isSaving ? <Spinner size="small" color="white" /> : undefined
                }
                paddingHorizontal="$8"
              >
                <Button.Text fontWeight="bold" color="white" fontSize="$4">
                  Save changes
                </Button.Text>
              </Button>
            )}
          </XStack>
        </>
      )}
    </YStack>
  );
}
