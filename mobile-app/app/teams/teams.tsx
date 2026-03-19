import { FizzyLogo } from "@/components/FizzyLogo";
import { type Href, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Pressable } from "react-native";
import { Avatar, Button, Separator, Text, View, XStack, YStack } from "tamagui";

// Type matching the `accounts` + `users` + `boards` schema
type Team = {
  id: string;
  name: string;
  role: "owner" | "manager" | "member";
  boards_count: number;
  cards_count: number;
  members_count: number;
  initials: string;
  color: string;
};

const ACCENT_COLORS = [
  "$blue9",
  "$purple9",
  "$green9",
  "$orange9",
  "$pink9",
  "$red9",
  "$yellow9",
];

function StatPill({ label }: { label: string }) {
  return (
    <View bg="$backgroundPress" br="$10" px="$2" py={3}>
      <Text fontSize={11} col="$colorSubtle" fontWeight="500">
        {label}
      </Text>
    </View>
  );
}

function TeamCard({
  team,
  onPress,
}: {
  team: Team;
  onPress: (team: Team) => void;
}) {
  return (
    <Pressable onPress={() => onPress(team)}>
      {({ pressed }) => (
        <XStack
          bg="$backgroundStrong"
          bw={1}
          bc="$borderColor"
          br="$5"
          p="$4"
          gap="$3"
          ai="center"
          opacity={pressed ? 0.75 : 1}
        >
          {/* Avatar */}
          <Avatar circular size="$5" bg={team.color}>
            <Text col="white" fontSize={15} fontWeight="800">
              {team.initials}
            </Text>
          </Avatar>

          {/* Info */}
          <YStack flex={1} gap="$2">
            <XStack ai="center" gap="$2">
              <Text
                fontSize={15}
                fontWeight="600"
                col="$color"
                numberOfLines={1}
                flex={1}
              >
                {team.name}
              </Text>
              {team.role !== "member" && (
                <View
                  bg={team.role === "owner" ? "$yellow3" : "$blue3"}
                  bw={1}
                  bc={team.role === "owner" ? "$yellow6" : "$blue6"}
                  br="$10"
                  px="$2"
                  py={2}
                >
                  <Text
                    fontSize={10}
                    fontWeight="600"
                    col={team.role === "owner" ? "$yellow10" : "$blue10"}
                    tt="uppercase"
                    ls={0.5}
                  >
                    {team.role}
                  </Text>
                </View>
              )}
            </XStack>

            {/* Stats pills */}
            <XStack gap="$2">
              <StatPill label={`${team.boards_count} boards`} />
              <StatPill label={`${team.cards_count} cards`} />
              <StatPill label={`${team.members_count} members`} />
            </XStack>
          </YStack>

          {/* Chevron */}
          <Text col="$colorSubtle" fontSize={20}>
            ›
          </Text>
        </XStack>
      )}
    </Pressable>
  );
}

export default function TeamsScreen() {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [userName, setUserName] = useState("there");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: replace with real API call
    // e.g. fetch("/api/accounts") mapped to Team[]
    setTimeout(() => {
      setUserName("Alex");
      setTeams([
        {
          id: "1",
          name: "Design Team",
          role: "owner",
          boards_count: 5,
          cards_count: 42,
          members_count: 6,
          initials: "DT",
          color: ACCENT_COLORS[0],
        },
        {
          id: "2",
          name: "Engineering",
          role: "manager",
          boards_count: 8,
          cards_count: 128,
          members_count: 12,
          initials: "EN",
          color: ACCENT_COLORS[2],
        },
        {
          id: "3",
          name: "Marketing",
          role: "member",
          boards_count: 3,
          cards_count: 17,
          members_count: 4,
          initials: "MK",
          color: ACCENT_COLORS[4],
        },
        {
          id: "4",
          name: "Product",
          role: "member",
          boards_count: 6,
          cards_count: 54,
          members_count: 8,
          initials: "PR",
          color: ACCENT_COLORS[1],
        },
        {
          id: "5",
          name: "Sales",
          role: "member",
          boards_count: 2,
          cards_count: 31,
          members_count: 5,
          initials: "SL",
          color: ACCENT_COLORS[3],
        },
        {
          id: "6",
          name: "Customer Support",
          role: "manager",
          boards_count: 4,
          cards_count: 89,
          members_count: 10,
          initials: "CS",
          color: ACCENT_COLORS[5],
        },
      ]);
      setLoading(false);
    }, 600);
  }, []);

  return (
    <View flex={1} bg="$background">
      {/* Header */}
      <XStack px="$5" pt="$10" pb="$4" ai="center" jc="space-between" gap="$3">
        <FizzyLogo />
        <YStack flex={1} gap="$0">
          <Text fontSize={17} fontWeight="700" col="$color" ls={-0.3}>
            Hey, {userName} 👋
          </Text>
          <Text fontSize={12} col="$colorSubtle">
            Pick a team to jump in.
          </Text>
        </YStack>
        <Button
          bg="$blue9"
          size="$3"
          br="$4"
          onPress={() => router.push("/teams/createteam" as Href)}
        >
          <Text col="white" fontSize={13} fontWeight="600">
            + New team
          </Text>
        </Button>
      </XStack>

      <Separator bc="$borderColor" />

      {/* List */}
      <FlatList
        data={teams}
        keyExtractor={(t) => t.id}
        contentContainerStyle={{ padding: 20, gap: 12 }}
        ListEmptyComponent={
          loading ? (
            <YStack ai="center" pt="$10" gap="$3">
              <Text col="$colorSubtle" fontSize={14}>
                Loading teams…
              </Text>
            </YStack>
          ) : (
            <YStack ai="center" pt="$10" gap="$3">
              <Text fontSize={40}>🫧</Text>
              <Text col="$colorSubtle" fontSize={14} ta="center" lh={20}>
                No teams yet.{"\n"}Create one to get started.
              </Text>
            </YStack>
          )
        }
        renderItem={({ item }) => (
          <TeamCard
            team={item}
            onPress={(team) =>
              router.push({
                // pathname: "/teams/[id]",
                // params: { id: team.id },
              } as Href)
            }
          />
        )}
      />
    </View>
  );
}
