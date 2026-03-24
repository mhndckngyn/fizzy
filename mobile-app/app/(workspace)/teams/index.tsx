import TeamCard from "@/features/teams/components/team-card";
import { useTeams } from "@/features/teams/hooks";
import { useRouter } from "expo-router";
import { FlatList, RefreshControl } from "react-native";
import {
  Button,
  Separator,
  Spinner,
  Text,
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
        <Button
          size="$3"
          br="$4"
          theme="blue"
          onPress={() => router.push("/teams/create-team")}
        >
          New
        </Button>
      </XStack>

      <Separator bc="$borderColor" />

      <FlatList
        data={data?.teams || []}
        keyExtractor={(t) => t.externalTeamId.toString()}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListEmptyComponent={
          isLoading && !data ? (
            <YStack ai="center" pt="$10">
              <Spinner size="large" color="$blue10" />
            </YStack>
          ) : !isLoading ? (
            <YStack ai="center" pt="$10" opacity={0.5}>
              <Text fontSize={40}>☁️</Text>
              <Text ta="center">No teams found.</Text>
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
          <TeamCard team={item} onPress={(t) => console.log("TODO")} />
        )}
      />
    </View>
  );
}
