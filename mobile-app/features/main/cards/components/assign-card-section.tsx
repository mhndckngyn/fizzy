import { getInitials } from "@/features/main/_shared/helpers";
import { Member } from "@/features/main/members/types";
import { Check, UserPlus } from "@tamagui/lucide-icons-2";
import React from "react";
import { Avatar, ScrollView, Spinner, Text, XStack, YStack } from "tamagui";

type AssignCardSectionProps = {
  members: Member[];
  assignedMemberIds: string[];
  onToggle: (memberId: string) => void;
  isPending?: boolean;
};

export function AssignCardSection({
  members,
  assignedMemberIds,
  onToggle,
  isPending,
}: AssignCardSectionProps) {
  return (
    <YStack gap="$3">
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
        {isPending && <Spinner size="small" color="$primary" />}
      </XStack>

      {/* Member avatars */}
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
                onPress={() => !isPending && onToggle(member.memberId)}
                pressStyle={{ scale: 0.95 }}
                hitSlop={10}
              >
                {/* Avatar with check badge */}
                <YStack position="relative">
                  <Avatar
                    circular
                    size="$4"
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

                  {/* Check badge */}
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
