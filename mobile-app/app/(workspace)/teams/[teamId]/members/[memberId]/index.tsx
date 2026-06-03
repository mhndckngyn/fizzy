import { getInitials } from "@/features/main/_shared/helpers";
import { useCurrentTeamParams } from "@/features/main/_shared/hooks";
import { useMembers } from "@/features/main/members/use-members";
import { FeedList } from "@/features/main/events/components/event-feeds/feed-list";
import { useEventFeeds } from "@/features/main/events/use-event-feeds";
import { Link, useLocalSearchParams } from "expo-router";
import { Separator, Text, View, XStack, YStack } from "tamagui";

export default function MemberDetailsPage() {
  const { memberId } = useLocalSearchParams<{ memberId: string }>();
  const { teamId } = useCurrentTeamParams();

  const { data: membersData } = useMembers();
  const member = membersData?.members.find((m) => m.memberId === memberId);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    isRefetching,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useEventFeeds([], memberId ? [memberId] : []);

  const memberCard = member
    ? (() => {
        const { initials, color } = getInitials(member.memberName);
        return (
          <YStack>
            <XStack gap="$4" ai="center" padding="$4" paddingBottom="$3">
              <View
                width={56}
                height={56}
                borderRadius={28}
                backgroundColor={color}
                ai="center"
                jc="center"
                flexShrink={0}
              >
                <Text color="white" fontSize="$6" fontWeight="700">
                  {initials}
                </Text>
              </View>

              <YStack gap="$1">
                <Text fontSize="$5" fontWeight="700" color="$color">
                  {member.memberName}
                </Text>
                <Text fontSize="$3" color="$gray10">
                  {member.email}
                </Text>
              </YStack>
            </XStack>

            <XStack gap="$2" paddingHorizontal="$4" paddingBottom="$3">
              <Link
                href={{
                  pathname: "/teams/[teamId]/filter-cards",
                  params: {
                    teamId,
                    initialAssignedToIds: member.memberId,
                  },
                }}
                asChild
              >
                <Text
                  flex={1}
                  textAlign="center"
                  fontSize="$3"
                  fontWeight="600"
                  color="$blue10"
                  borderWidth={1}
                  borderColor="$blue6"
                  borderRadius="$3"
                  paddingVertical="$2"
                  backgroundColor="$blue2"
                  pressStyle={{ opacity: 0.7 }}
                >
                  Assigned to {member.memberName}
                </Text>
              </Link>

              <Link
                href={{
                  pathname: "/teams/[teamId]/filter-cards",
                  params: {
                    teamId,
                    initialAddedByIds: member.memberId,
                  },
                }}
                asChild
              >
                <Text
                  flex={1}
                  textAlign="center"
                  fontSize="$3"
                  fontWeight="600"
                  color="$blue10"
                  borderWidth={1}
                  borderColor="$blue6"
                  borderRadius="$3"
                  paddingVertical="$2"
                  backgroundColor="$blue2"
                  pressStyle={{ opacity: 0.7 }}
                >
                  Added by {member.memberName}
                </Text>
              </Link>
            </XStack>

            <XStack
              ai="center"
              gap="$3"
              paddingHorizontal="$4"
              paddingBottom="$2"
            >
              <Separator borderColor="black" opacity={0.1} flex={1} />
              <Text
                fontSize="$3"
                color="$gray9"
                flexShrink={0}
                fontWeight="bold"
                textTransform="uppercase"
              >
                Activities from {member.memberName}
              </Text>
              <Separator borderColor="black" opacity={0.1} flex={1} />
            </XStack>
          </YStack>
        );
      })()
    : null;

  return (
    <View flex={1} paddingInline="$2">
      <FeedList
        data={data}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        isRefetching={isRefetching}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
        refetch={refetch}
        header={memberCard ?? undefined}
      />
    </View>
  );
}
