import { getInitials } from "@/features/main/_shared/helpers";
import { User } from "@tamagui/lucide-icons-2";
import { Pressable } from "react-native";
import { Avatar, Text, XStack, YStack } from "tamagui";
import { Team } from "../types";

function TeamCard({
  team,
  onPress,
}: {
  team: Team;
  onPress: (team: Team) => void;
}) {
  const { initials, color } = getInitials(team.name);

  return (
    <Pressable onPress={() => onPress(team)}>
      {({ pressed }) => (
        <XStack
          bg="$backgroundStrong"
          bw={1}
          bc="$borderColor"
          br="$5"
          p="$3"
          gap="$3"
          ai="center"
          opacity={pressed ? 0.8 : 1}
        >
          {/* Left: Avatar */}
          <Avatar circular size="$5" bg={color}>
            <Text col="white" fontSize={16} fontWeight="800">
              {initials}
            </Text>
          </Avatar>

          {/* Right: Content Rows */}
          <YStack f={1} gap="$1">
            {/* Row 1: Name and Member Count Pill */}
            <XStack jc="space-between" ai="center">
              <Text
                fontSize={16}
                fontWeight="700"
                col="$color"
                numberOfLines={1}
                f={1}
              >
                {team.name}
              </Text>

              <XStack
                bg="$background"
                px="$2"
                py="$0.5"
                br="$10"
                bw={1}
                bc="$borderColor"
                ai="center"
                gap="$1"
              >
                <User size={10} color="$colorSubtle" />
                <Text fontSize={11} fontWeight="700" col="$colorSubtle">
                  {team.memberCount}
                </Text>
              </XStack>
            </XStack>

            {/* Row 2: Gray Activity Text */}
            <Text fontSize={13} col="$color11" numberOfLines={1}>
              <Text col="$color11" fontStyle="italic">
                Today at 8:10 AM {/* TODO */}
              </Text>
            </Text>
          </YStack>
        </XStack>
      )}
    </Pressable>
  );
}

export default TeamCard;
