import { View, XStack } from "tamagui";

const BARS = [
  { h: 10, color: "#f472b6" },
  { h: 16, color: "#818cf8" },
  { h: 22, color: "#60a5fa" },
  { h: 14, color: "#34d399" },
  { h: 8, color: "#fbbf24" },
];

export function FizzyLogo() {
  return (
    <View
      w={52}
      h={52}
      br="$6"
      bg="$backgroundStrong"
      borderWidth={1}
      borderColor="$borderColor"
      ai="center"
      jc="center"
    >
      <XStack ai="flex-end" gap="$1">
        {BARS.map((bar, i) => (
          <View key={i} w={4} h={bar.h} br="$1" bg={bar.color} />
        ))}
      </XStack>
    </View>
  );
}
