import TiptapWrapper from "@/components/tiptap-wrapper";
import { EditorMentionItem } from "@/components/tiptap/tiptap-templates/simple/mention-suggestion";
import { getInitials } from "@/features/main/_shared/helpers";
import { Board } from "@/features/main/boards/types";
import { Member } from "@/features/main/members/types";
import { Check, Layout, UserPlus } from "@tamagui/lucide-icons-2";
import React, { useState } from "react";
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

const SPECIAL_COLOR = "#3d4e65";

export function BoardSelector({
  boards,
  selectedBoardId,
  onSelect,
  disabled,
}: BoardSelectorProps) {
  return (
    <YStack gap="$2.5">
      <XStack ai="center" gap="$2" opacity={0.5}>
        <Layout size={14} color="$color" />
        <Text
          fontSize={11}
          fontWeight="700"
          textTransform="uppercase"
          letterSpacing={1}
        >
          Target Board
        </Text>
      </XStack>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <XStack gap="$2">
          {boards.map((board) => {
            const isSelected = selectedBoardId === board.boardId;

            return (
              <Button
                key={board.boardId}
                size="$2.5"
                br="$10"
                onPress={() => !disabled && onSelect(board.boardId)}
                backgroundColor={isSelected ? "$blue10" : "$blue2"}
                borderColor={isSelected ? "$blue10" : "$blue4"}
                borderWidth={1}
                pressStyle={{ opacity: 0.8, scale: 0.97 }}
                disabled={disabled || isSelected}
                opacity={disabled ? 0.6 : 1}
              >
                <Text
                  fontSize={12}
                  fontWeight="700"
                  color={isSelected ? "white" : "$blue11"}
                >
                  {board.name}
                </Text>
              </Button>
            );
          })}
        </XStack>
      </ScrollView>
    </YStack>
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
      size="$4"
      fontWeight="bold"
      fontSize="$8"
      borderWidth={0}
      backgroundColor="transparent"
      placeholder="Card Title"
    />
  );
}

// ─────────────────────────────────────────────
// CardBodyEditor
// ─────────────────────────────────────────────

type CardBodyEditorProps = {
  initialContent: string;
  onContentChange: (html: string, mentionedMemberIds: string[]) => void;
  memberList?: EditorMentionItem[];
  cardList?: EditorMentionItem[];
};

export function CardBodyEditor({
  initialContent,
  onContentChange,
  memberList = [],
  cardList,
}: CardBodyEditorProps) {
  const [isLoading, setLoading] = useState(true);

  return (
    <View
      mih={400}
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
        onReady={() => setLoading(false)}
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
}: MemberAssignSelectorProps & { isPending?: boolean }) {
  return (
    <YStack gap="$3">
      {/* Header Section */}
      <XStack px="$1" ai="center" gap="$2">
        <UserPlus size={14} color="$color" opacity={0.5} />
        <Text
          fontSize={11}
          fontWeight="700"
          o={0.5}
          textTransform="uppercase"
          letterSpacing={0.5}
        >
          Assignees
        </Text>
      </XStack>

      {/* Member avatars list */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <XStack gap="$4" px="$1">
          {members.map((member) => {
            const isAssigned = assignedMemberIds.includes(member.memberId);
            const { initials, color } = getInitials(member.memberName);

            return (
              <YStack
                key={member.memberId}
                ai="center"
                gap="$1.5"
                onPress={() => onToggle(member.memberId)}
                pressStyle={{ scale: 0.95 }}
                hitSlop={10}
              >
                {/* Avatar with check badge wrapper */}
                <YStack position="relative">
                  <Avatar
                    circular
                    size="$5"
                    borderWidth={2.5}
                    borderColor={isAssigned ? "$blue9" : "transparent"}
                    o={isAssigned ? 1 : 0.55}
                    pointerEvents="none"
                  >
                    <Avatar.Fallback
                      ai="center"
                      jc="center"
                      backgroundColor={color}
                    >
                      <Text color="white" fontWeight="bold" fontSize={15}>
                        {initials}
                      </Text>
                    </Avatar.Fallback>
                  </Avatar>

                  {/* Check badge overlay */}
                  {isAssigned && (
                    <YStack
                      position="absolute"
                      bottom={-2}
                      right={-2}
                      w={18}
                      h={18}
                      br="$10"
                      bg="$blue9"
                      ai="center"
                      jc="center"
                      pointerEvents="none"
                    >
                      <Check size={10} color="white" strokeWidth={3} />
                    </YStack>
                  )}
                </YStack>

                <Text
                  fontSize={10}
                  fontWeight={isAssigned ? "700" : "400"}
                  color={isAssigned ? "$blue10" : "$color"}
                  opacity={isAssigned ? 1 : 0.5}
                  pointerEvents="none"
                >
                  {member.memberName.split(" ")[1]
                    ? member.memberName.split(" ")[0]
                    : member.memberName}
                </Text>
              </YStack>
            );
          })}
        </XStack>
      </ScrollView>
    </YStack>
  );
}
