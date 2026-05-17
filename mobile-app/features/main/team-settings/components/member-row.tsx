import ConfirmationDialog from "@/components/confirmation-dialog";
import { getInitials } from "@/features/main/_shared/helpers";
import { useCurrentTeamParams } from "@/features/main/_shared/hooks";
import { Member, TeamRole } from "@/features/main/members/types";
import { useRemoveMember } from "@/features/main/members/use-remove-member";
import { useSetMemberRole } from "@/features/main/members/use-set-member-role";
import {
  Crown,
  Minus,
  ShieldCheck,
  User,
  UserMinus,
} from "@tamagui/lucide-icons-2";
import { useState } from "react";
import { Text, View, XStack, YStack } from "tamagui";

const ROLE_ICON: Record<TeamRole, React.ReactNode> = {
  0: <Crown size={20} color="#DBA400" />,
  1: <ShieldCheck size={20} color="$blue9" />,
  2: <User size={20} color="$gray9" />,
};

export function MemberRow({ member }: { member: Member }) {
  const { initials, color } = getInitials(member.memberName);
  const { teamId } = useCurrentTeamParams();
  const { mutate: setRole, isPending: isRolePending } = useSetMemberRole();
  const { mutate: removeMember, isPending: isRemovePending } =
    useRemoveMember();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const anyPending = isRolePending || isRemovePending;

  function handleRolePress() {
    setRole({
      teamId,
      memberId: member.memberId,
      action: member.role === 1 ? "demote" : "promote",
    });
  }

  function handleRemoveConfirm() {
    removeMember({ teamId, memberId: member.memberId });
  }

  return (
    <>
      <XStack gap="$3" ai="center" py="$2.5">
        <View
          width={40}
          height={40}
          borderRadius={20}
          backgroundColor={color}
          ai="center"
          jc="center"
          flexShrink={0}
        >
          <Text color="white" fontSize="$3" fontWeight="700">
            {initials}
          </Text>
        </View>

        <YStack f={1} gap="$0.5">
          <Text fontSize="$4" fontWeight="600" color="$color">
            {member.memberName}
          </Text>
          <Text fontSize="$3" color="$gray10">
            {member.email}
          </Text>
        </YStack>

        <XStack gap="$2" ai="center">
          {member.canBeManaged ? (
            <View
              onPress={anyPending ? undefined : handleRolePress}
              opacity={anyPending ? 0.4 : 1}
              pressStyle={anyPending ? undefined : { opacity: 0.6 }}
              cursor={anyPending ? "default" : "pointer"}
              width={40}
              height={40}
              borderRadius="$3"
              borderWidth={1}
              borderColor="$gray5"
              backgroundColor="$gray2"
              ai="center"
              jc="center"
            >
              {ROLE_ICON[member.role]}
            </View>
          ) : (
            <View width={40} height={40} ai="center" jc="center">
              {ROLE_ICON[member.role]}
            </View>
          )}

          {member.canBeManaged && (
            <View
              onPress={anyPending ? undefined : () => setConfirmOpen(true)}
              opacity={anyPending ? 0.4 : 1}
              pressStyle={anyPending ? undefined : { opacity: 0.6 }}
              cursor={anyPending ? "default" : "pointer"}
              width={40}
              height={40}
              borderRadius="$3"
              borderWidth={1}
              borderColor="$red5"
              backgroundColor="$red2"
              ai="center"
              jc="center"
            >
              <Minus size={20} color="$red9" />
            </View>
          )}
        </XStack>
      </XStack>

      <ConfirmationDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        dialogTitle="Remove member"
        dialogDescription={`Remove ${member.memberName} from the team? This cannot be undone.`}
        confirmText="Remove"
        cancelText="Cancel"
        onConfirm={handleRemoveConfirm}
      />
    </>
  );
}
