import { getInitials } from "@/features/main/_shared/helpers";
import { MemberAccessEntry } from "@/features/main/boards/use-board-accesses";
import { Check } from "@tamagui/lucide-icons-2";
import { Switch } from "@tamagui/switch";
import { Text, View, XStack, YStack } from "tamagui";

export function MemberAccessRow({
  member,
  hasAccess,
  allAccess,
  canEdit,
  isSelf,
  onToggle,
}: {
  member: MemberAccessEntry;
  hasAccess: boolean;
  allAccess: boolean;
  canEdit: boolean;
  isSelf: boolean;
  onToggle: (memberId: string, value: boolean) => void;
}) {
  const { initials, color } = getInitials(member.name);

  return (
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
          {member.name}
        </Text>
        <Text fontSize="$3" color="$gray10">
          {member.email}
        </Text>
      </YStack>

      {allAccess || isSelf || (!canEdit && hasAccess) ? (
        <Check size={20} color="$green9" />
      ) : canEdit ? (
        <Switch
          size="$3"
          checked={hasAccess}
          onCheckedChange={(val) => onToggle(member.memberId, val)}
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
      ) : null}
    </XStack>
  );
}
