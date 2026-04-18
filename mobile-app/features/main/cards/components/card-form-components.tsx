import TiptapWrapper from "@/components/tiptap-wrapper";
import { getTeamAvatar } from "@/features/main/_shared/helpers";
import { Board } from "@/features/main/boards/types";
import { Member } from "@/features/main/members/types";
import { EditorMentionItem } from "@/components/tiptap/tiptap-templates/simple/mention-suggestion";
import React from "react";
import {
  Avatar,
  Button,
  Input,
  Paragraph,
  ScrollView,
  Spinner,
  Text,
  View,
  XStack,
  YStack,
} from "tamagui";

// ─────────────────────────────────────────────
// BoardSelector
// ─────────────────────────────────────────────

type BoardSelectorProps = {
  boards: Board[];
  selectedBoardId: string | null;
  onSelect: (boardId: string) => void;
  disabled?: boolean;
};

export function BoardSelector({
  boards,
  selectedBoardId,
  onSelect,
  disabled,
}: BoardSelectorProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <XStack gap="$2" px="$1">
        {boards.map((board) => {
          const isSelected = selectedBoardId === board.boardId;
          return (
            <Button
              key={board.boardId}
              size="$2"
              br="$10"
              onPress={() => !disabled && onSelect(board.boardId)}
              backgroundColor={isSelected ? "$orange10" : "$orange4"}
              borderColor={isSelected ? "$orange11" : "$orange6"}
              borderWidth={1}
              pressStyle={{ opacity: 0.8, scale: 0.97 }}
              disabled={disabled}
              opacity={disabled ? 0.6 : 1}
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
  );
}

// ─────────────────────────────────────────────
// CardTitleInput
// ─────────────────────────────────────────────

type CardTitleInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export function CardTitleInput({ value, onChange }: CardTitleInputProps) {
  return (
    <Input
      value={value}
      onChangeText={onChange}
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
  );
}

// ─────────────────────────────────────────────
// CardBodyEditor
// ─────────────────────────────────────────────

type CardBodyEditorProps = {
  initialContent: string;
  onContentChange: (html: string, mentionedMemberIds: string[]) => void;
  onReady: () => void;
  isLoading: boolean;
  memberList?: EditorMentionItem[];
  cardList?: EditorMentionItem[];
};

export function CardBodyEditor({
  initialContent,
  onContentChange,
  onReady,
  isLoading,
  memberList = [],
  cardList,
}: CardBodyEditorProps) {
  return (
    <View
      mih={300}
      flexGrow={1}
      br="$4"
      p="$1"
      overflow="hidden"
      position="relative"
      bg="$background"
    >
      {isLoading && (
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
        initialContent={initialContent}
        onContentChange={onContentChange}
        onReady={onReady}
        memberList={memberList}
        cardList={cardList}
        dom={{ scrollEnabled: false }}
      />
    </View>
  );
}

// ─────────────────────────────────────────────
// MemberAssignSelector
// ─────────────────────────────────────────────

type MemberAssignSelectorProps = {
  members: Member[];
  assignedMemberIds: string[];
  onToggle: (memberId: string) => void;
};

export function MemberAssignSelector({
  members,
  assignedMemberIds,
  onToggle,
}: MemberAssignSelectorProps) {
  const selectedNamesString = members
    .filter((m) => assignedMemberIds.includes(m.memberId))
    .map((m) => m.memberName)
    .join(", ");

  return (
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
          {members.map((member) => {
            const isSelected = assignedMemberIds.includes(member.memberId);
            const { initials, color } = getTeamAvatar(member.memberName);

            return (
              <YStack
                key={member.memberId}
                ai="center"
                gap="$1"
                onPress={() => onToggle(member.memberId)}
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
                  {member.memberName.split(" ")[0]}
                </Text>
              </YStack>
            );
          })}
        </XStack>
      </ScrollView>
    </YStack>
  );
}
