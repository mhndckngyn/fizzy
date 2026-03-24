import { IconProps } from "@tamagui/helpers-icon";
import { Text, XStack } from "tamagui";

interface IconButtonProps {
  icon: React.ComponentType<IconProps>;
  label: string;
  onPress?: () => void;
}

const IconButton = ({ icon: Icon, label, onPress }: IconButtonProps) => (
  <XStack
    onPress={onPress}
    gap="$3"
    ai="center"
    py="$2"
    px="$2"
    br="$2"
    pressStyle={{
      backgroundColor: "$backgroundHover",
      opacity: 0.7,
    }}
  >
    <Icon size={18} color="$color" opacity={0.7} />
    <Text fontSize={15} color="$color">
      {label}
    </Text>
  </XStack>
);

export default IconButton;
