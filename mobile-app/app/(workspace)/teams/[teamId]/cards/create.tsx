import TiptapWrapper from "@/components/tiptap-wrapper";
import { useHeaderStore } from "@/components/workspace-header/use-header-store";
import { getTeamAvatar } from "@/features/main/_shared/helpers";
import { useBoards } from "@/features/main/boards/hooks";
import { useCardMention } from "@/features/main/cards/hooks";
import { useMemberMention, useMembers } from "@/features/main/members/hooks";
import { ArrowLeft } from "@tamagui/lucide-icons-2";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Input,
  Paragraph,
  ScrollView,
  Spinner,
  Text,
  View,
  XStack,
  YStack,
} from "tamagui";

export default function CreateCardPage() {
  const [title, setTitle] = useState("New Card");
  const [description, setDescription] = useState("");
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [assignedMembers, setAssignedMembers] = useState<string[]>([]);
  const [mentionedMemberIds, setMentionedMemberIds] = useState<string[]>([]);

  const [editorLoading, setEditorLoading] = useState(true);

  const { data: boards } = useBoards();

  const { data: members } = useMembers();
  const toggleMember = (id: string) => {
    setAssignedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  };
  const selectedNamesString = members?.members
    .filter((m) => assignedMembers.includes(m.memberId))
    .map((m) => m.memberName)
    .join(", ");

  const setHeader = useHeaderStore((s) => s.setHeader);
  const resetHeader = useHeaderStore((s) => s.resetHeader);
  const router = useRouter();

  const { data: cardMentionList } = useCardMention();
  const memberMentionList = useMemberMention();

  useFocusEffect(
    useCallback(() => {
      setHeader({
        leftAction: {
          icon: ArrowLeft,
          onPress: () => router.back(),
        },
      });

      return resetHeader;
    }, [setHeader, resetHeader, router]),
  );

  const handleSave = async (addAnother: boolean) => {
    try {
      // 1. Trigger your mutation
      // await createCardMutation({ title, description, selectedBoardId, selectedMembers });

      if (addAnother) {
        // 2. Reset local state for a fresh card
        setTitle("New Card");
        setDescription("");
        setAssignedMembers([]);
        // Maybe keep the selectedBoardId since they are likely adding to the same board

        // Optional: scroll back to top
        // scrollRef.current?.scrollTo({ y: 0, animated: true });
      } else {
        router.back();
      }
    } catch (error) {
      console.error("Failed to create card", error);
    }
  };

  return (
    <View f={1}>
      <ScrollView>
        <YStack p="$2">
          <Card paddingInline="$3" paddingBottom="$5" bg="$gray3">
            <View py="$2" px="$1">
              <YStack gap="$2" pt="$2">
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <XStack gap="$2" px="$1">
                    {boards?.boards.map((board) => {
                      const isSelected = selectedBoardId === board.boardId;
                      return (
                        <Button
                          key={board.boardId}
                          size="$2"
                          br="$10"
                          onPress={() => setSelectedBoardId(board.boardId)}
                          backgroundColor={
                            isSelected ? "$orange10" : "$orange4"
                          }
                          borderColor={isSelected ? "$orange11" : "$orange6"}
                          borderWidth={1}
                          pressStyle={{ opacity: 0.8, scale: 0.97 }}
                        >
                          <Text
                            fontSize={12}
                            fontWeight="600"
                            color={isSelected ? "white" : "$orange11"}
                          >
                            {board.name}
                          </Text>
                        </Button>
                      );
                    })}
                  </XStack>
                </ScrollView>
              </YStack>
            </View>

            <Input
              value={title}
              onChangeText={(value) => setTitle(value)}
              paddingInline={"$1"}
              p={"0"}
              w={"100%"}
              rows={1}
              size="$6"
              fontWeight="bold"
              fontSize="$8"
              borderWidth={0}
              backgroundColor="transparent"
              placeholder="Card Title"
              scrollEnabled={false}
            />

            <YStack>
              <View
                mih={300}
                flexGrow={1}
                br="$4"
                p="$1"
                overflow="hidden"
                position="relative"
                bg="$background"
              >
                {editorLoading && (
                  <View
                    position="absolute"
                    inset={0}
                    jc="center"
                    ai="center"
                    bg="$background"
                    zIndex={10}
                  >
                    <YStack ai="center" gap="$2">
                      <Spinner size="large" color="$primary" />
                      <Paragraph size="$2" o={0.5}>
                        Loading editor...
                      </Paragraph>
                    </YStack>
                  </View>
                )}

                <TiptapWrapper
                  initialContent={description}
                  onContentChange={(html, mentionedMemberIdList) => {
                    setDescription(html);
                    setMentionedMemberIds(mentionedMemberIdList);
                  }}
                  onReady={() => {
                    setEditorLoading(false);
                  }}
                  memberList={memberMentionList}
                  cardList={cardMentionList}
                  dom={{
                    scrollEnabled: false,
                  }}
                />
              </View>
            </YStack>

            <YStack gap="$2" py="$3">
              <XStack px="$1" py="$1">
                <Paragraph numberOfLines={2} f={1}>
                  <Text fontWeight="bold">Assign to: </Text>
                  {selectedNamesString ? (
                    <Text o={0.6} fontWeight="normal">
                      {selectedNamesString}
                    </Text>
                  ) : (
                    <Text o={0.3} fontWeight="normal" fontStyle="italic">
                      No one
                    </Text>
                  )}
                </Paragraph>
              </XStack>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <XStack gap="$3" px="$1">
                  {members?.members.map((member) => {
                    const isSelected = assignedMembers.includes(
                      member.memberId,
                    );
                    const { initials, color } = getTeamAvatar(
                      member.memberName,
                    );

                    return (
                      <YStack
                        key={member.memberId}
                        ai="center"
                        gap="$1"
                        // Move onPress here to cover both Avatar and Label
                        onPress={() => toggleMember(member.memberId)}
                        // Add this to ensure it behaves like a button on all platforms
                        pressStyle={{ scale: 0.97 }}
                        hitSlop={10}
                      >
                        <Avatar
                          circular
                          size="$4"
                          borderWidth={2}
                          borderColor={isSelected ? "$blue10" : "transparent"}
                          o={isSelected ? 1 : 0.7}
                          pointerEvents="none"
                        >
                          <Avatar.Fallback
                            ai="center"
                            jc="center"
                            backgroundColor={color}
                          >
                            <Text color="white" fontWeight="bold" fontSize={14}>
                              {initials}
                            </Text>
                          </Avatar.Fallback>
                        </Avatar>

                        <Text
                          fontSize={10}
                          fontWeight={isSelected ? "bold" : "normal"}
                          color={isSelected ? "$blue10" : "$color"}
                          pointerEvents="none"
                        >
                          {member.memberName.split(" ")[0]}{" "}
                          {/* First Name Only */}
                        </Text>
                      </YStack>
                    );
                  })}
                </XStack>
              </ScrollView>
            </YStack>
          </Card>
        </YStack>

        <YStack gap="$3" mt="$4" px="$2">
          {/* Primary Action */}
          <Button
            size="$4"
            backgroundColor="$blue9"
            br="$5"
            onPress={() => handleSave(false)}
            disabled={false}
            opacity={1}
          >
            <Button.Text color="white" fontWeight="bold">
              Create Card {/* Creating... */}
            </Button.Text>
          </Button>

          {/*
                        <Button
                bg="$blue9"
                size="$4"
                br="$5"
                onPress={handleCreate}
                disabled={!teamName.trim() || isPending}
                opacity={!teamName.trim() || isPending ? 0.5 : 1}
              >
                <Text col="white" fontSize={16} fontWeight="700">
                  {isPending ? "Creating..." : "Create Team"}
                </Text>
              </Button>

          */}

          {/* Secondary Action */}
          <Button
            size="$3"
            chromeless
            onPress={() => handleSave(true)}
            pressStyle={{ opacity: 0.5 }}
          >
            <Button.Text fontWeight="600">Create and add another</Button.Text>
          </Button>
        </YStack>
      </ScrollView>
    </View>
  );
}
