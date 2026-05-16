import { TouchableOpacity } from "react-native";
import { XStack, Text } from "tamagui";

export function FilterPill({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75}>
      <XStack
        ai="center"
        gap="$1.5"
        px="$3"
        py="$1.5"
        borderRadius={999}
        borderWidth={1}
        borderColor={active ? "$blue8" : "$gray6"}
        backgroundColor={active ? "$blue3" : "transparent"}
      >
        <Text
          fontSize="$2"
          fontWeight="600"
          color={active ? "$blue11" : "$gray11"}
        >
          {label}
        </Text>
        <Text fontSize="$2" color={active ? "$blue9" : "$gray9"}>
          ▾
        </Text>
      </XStack>
    </TouchableOpacity>
  );
}
