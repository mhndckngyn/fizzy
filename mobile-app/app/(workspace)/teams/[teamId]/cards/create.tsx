import { useHeaderStore } from "@/components/workspace-header/use-header-store";
import { useCurrentTeamParams } from "@/features/main/_shared/hooks";
import { useBoards } from "@/features/main/boards/hooks";
import {
  BoardSelector,
  CardBodyEditor,
  CardTitleInput,
  MemberAssignSelector,
} from "@/features/main/cards/components/card-form-components";
import { useCardMention, useCreateCard } from "@/features/main/cards/hooks";
import { useMemberMention, useMembers } from "@/features/main/members/hooks";
import { ArrowLeft } from "@tamagui/lucide-icons-2";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Button,
  Card,
  ScrollView,
  Spinner,
  View,
  YStack,
  useToastController,
} from "tamagui";

export default function CreateCardPage() {
  const [title, setTitle] = useState("New Card");
  const [description, setDescription] = useState("");
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [assignedMembers, setAssignedMembers] = useState<string[]>([]);

  const { teamId } = useCurrentTeamParams();
  const { mutateAsync: createCard, isPending } = useCreateCard();
  const { data: boards } = useBoards();
  const { data: members } = useMembers();
  const { data: cardMentionList } = useCardMention();
  const memberMentionList = useMemberMention();

  const setHeader = useHeaderStore((s) => s.setHeader);
  const resetHeader = useHeaderStore((s) => s.resetHeader);
  const router = useRouter();
  const toast = useToastController();

  const SPECIAL_COLOR = "#3d4e65";
  const bgColor = `${SPECIAL_COLOR}10`;

  const toggleMember = (id: string) => {
    setAssignedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  };

  useFocusEffect(
    useCallback(() => {
      setHeader({
        leftAction: { icon: ArrowLeft, onPress: () => router.back() },
      });
      return resetHeader;
    }, [setHeader, resetHeader, router]),
  );

  const handleSave = async (addAnother: boolean) => {
    if (!selectedBoardId) {
      toast.show("Please select a board", { type: "error" });
      return;
    }

    try {
      await createCard({
        teamId,
        boardId: selectedBoardId,
        title: title.trim() || undefined,
        body: description || undefined,
        assignedMemberIds:
          assignedMembers.length > 0 ? assignedMembers : undefined,
      });

      if (addAnother) {
        setTitle("New Card");
        setDescription("");
        setAssignedMembers([]);
      } else {
        router.back();
      }
    } catch {
      toast.show("Failed to create card", { type: "error" });
    }
  };

  const isDisabled = isPending || !selectedBoardId;

  return (
    <View f={1}>
      <ScrollView>
        <YStack p="$2" pb="$4" gap="$2">
          <Card padding="$3" pt="$2" gap="$2" bg={bgColor}>
            <CardTitleInput value={title} onChange={setTitle} />

            <CardBodyEditor
              initialContent={description}
              onContentChange={(html) => setDescription(html)}
              memberList={memberMentionList}
              cardList={cardMentionList}
            />
          </Card>

          <Card padding="$3" bg={bgColor}>
            <BoardSelector
              boards={boards?.boards ?? []}
              selectedBoardId={selectedBoardId}
              onSelect={setSelectedBoardId}
            />
          </Card>

          <Card padding="$3" bg={bgColor}>
            <MemberAssignSelector
              members={members?.members ?? []}
              assignedMemberIds={assignedMembers}
              onToggle={toggleMember}
            />
          </Card>

          <YStack gap="$3">
            <Button
              size="$4"
              backgroundColor="$blue9"
              br="$5"
              onPress={() => handleSave(false)}
              disabled={isDisabled}
              opacity={isDisabled ? 0.5 : 1}
            >
              {isPending ? (
                <Spinner color="white" />
              ) : (
                <Button.Text color="white" fontWeight="bold">
                  Create Card
                </Button.Text>
              )}
            </Button>

            <Button
              size="$3"
              chromeless
              onPress={() => handleSave(true)}
              pressStyle={{ opacity: 0.5 }}
              disabled={isDisabled}
              opacity={isDisabled ? 0.5 : 1}
            >
              <Button.Text fontWeight="bold">
                Create and add another
              </Button.Text>
            </Button>
          </YStack>
        </YStack>
      </ScrollView>
    </View>
  );
}
