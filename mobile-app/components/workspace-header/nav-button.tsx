import { IconProps } from "@tamagui/helpers-icon";
import { Button, Text, usePopoverContext } from "tamagui";

interface NavButtonProps {
  icon: React.ComponentType<IconProps>;
  label: string;
  active?: boolean;
  onPress?: () => void;
}

const NavButton = ({
  icon: Icon,
  label,
  active = false,
  onPress,
}: NavButtonProps) => {
  const context = usePopoverContext();

  const handlePress = () => {
    context?.onOpenChange(false, "press");
    onPress?.();
  };

  return (
    <Button
      flex={1}
      gap="$2"
      jc="flex-start"
      backgroundColor={active ? "$blue3" : "$backgroundHover"}
      borderColor={active ? "$blue7" : "transparent"}
      borderWidth={1}
      onPress={handlePress}
      borderRadius="$8"
    >
      <Icon size={20} color={active ? "$blue10" : "$gray11"} />
      <Text
        fontSize={13}
        fontWeight={"bold"}
        color={active ? "$blue10" : "$color"}
      >
        {label}
      </Text>
    </Button>
  );
};

export default NavButton;
