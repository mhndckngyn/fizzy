import TeamCard from "@/features/main/teams/components/team-card";
import { useTeams } from "@/features/main/teams/use-teams";
import { Plus, Users } from "@tamagui/lucide-icons-2";
import { useRouter } from "expo-router";
import { FlatList, RefreshControl } from "react-native";
import {
  Button,
  Separator,
  Spinner,
  Text,
  Theme,
  View,
  XStack,
  YStack,
} from "tamagui";

export default function TeamList() {
  const router = useRouter();
  const { data, isLoading, error, refetch, isFetching } = useTeams();

  if (error)
    return (
      <YStack f={1} jc="center" ai="center" p="$4">
        <Text col="$red10">Failed to load teams.</Text>
      </YStack>
    );

  return (
    <View f={1} bg="$background">
      <XStack px="$5" pt="$4" pb="$4" ai="center" jc="space-between">
        <YStack>
          <Text fontSize={18} fontWeight="700">
            Your Teams
          </Text>
          <Text fontSize={12} col="$colorSubtle">
            Select a workspace
          </Text>
        </YStack>
        <XStack gap="$2">
          <Theme name="dark">
            <Button
              size="$3"
              br="$4"
              bg="$blue9"
              onPress={() => router.push("/teams/join")}
              icon={Users}
              hoverStyle={{ bg: "$blue10" }}
              pressStyle={{ bg: "$blue8" }}
            >
              <Text fontWeight="bold">Join</Text>
            </Button>
          </Theme>

          <Button
            size="$3"
            br="$4"
            theme="alt1"
            borderWidth={1}
            borderColor="$borderColor"
            onPress={() => router.push("/teams/create")}
            icon={Plus}
          >
            <Text fontWeight="bold">New</Text>
          </Button>
        </XStack>
      </XStack>

      <Separator bc="$borderColor" />

      <FlatList
        data={data?.teams || []}
        keyExtractor={(t) => t.teamId}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListEmptyComponent={
          isLoading && !data ? (
            <YStack ai="center" pt="$10">
              <Spinner size="large" color="$blue10" />
            </YStack>
          ) : !isLoading ? (
            <YStack ai="center" pt="$10" opacity={0.5} gap="$4">
              <Text fontSize={40}>☁️</Text>
              <Text ta="center" fontSize="$4">
                No teams found.
              </Text>
            </YStack>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={!!data && isFetching}
            onRefresh={refetch}
            tintColor="#2196F3"
            colors={["#2196F3"]}
          />
        }
        renderItem={({ item }) => (
          <TeamCard
            key={item.teamId}
            team={item}
            onPress={(t) => router.push(`/teams/${item.teamId}`)}
          />
        )}
      />
    </View>
  );
}
