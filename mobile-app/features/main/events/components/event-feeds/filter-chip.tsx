import { TouchableOpacity } from "react-native";
import { Text, XStack } from "tamagui";
import { ChevronDown } from "@tamagui/lucide-icons-2";

export function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
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
          fontSize="$3"
          fontWeight="600"
          color={active ? "$blue11" : "$gray11"}
        >
          {label}
        </Text>
        <ChevronDown size={14} color={active ? "$blue11" : "$gray11"} />
      </XStack>
    </TouchableOpacity>
  );
}
