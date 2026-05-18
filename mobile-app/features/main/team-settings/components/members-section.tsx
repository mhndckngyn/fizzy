import { useMembers } from "@/features/main/members/use-members";
import { useState } from "react";
import { Input, Separator, Spinner, Text, View, YStack } from "tamagui";
import { InviteSection } from "./invite-section";
import { MemberRow } from "./member-row";

export function MembersSection() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useMembers();

  const members = data?.members ?? [];
  const filtered = search.trim()
    ? members.filter(
        (m) =>
          m.memberName.toLowerCase().includes(search.toLowerCase()) ||
          m.email.toLowerCase().includes(search.toLowerCase()),
      )
    : members;

  return (
    <YStack f={1} gap="$3">
      <InviteSection membersCount={members.length} />

      <Input
        placeholder="Search members..."
        value={search}
        onChangeText={setSearch}
        clearButtonMode="while-editing"
        autoCorrect={false}
        autoCapitalize="none"
      />

      {isLoading ? (
        <View f={1} ai="center" jc="center">
          <Spinner size="large" />
        </View>
      ) : filtered.length === 0 ? (
        <View f={1} pt="$4" ai="center">
          <Text color="$gray9" fontSize="$3">
            {search.trim() ? "No members match your search." : "No members"}
          </Text>
        </View>
      ) : (
        <YStack pt="$1">
          {filtered.map((member, i) => (
            <YStack key={member.memberId}>
              <MemberRow member={member} />
              {i < filtered.length - 1 && <Separator borderColor="$gray4" />}
            </YStack>
          ))}
        </YStack>
      )}
    </YStack>
  );
}
