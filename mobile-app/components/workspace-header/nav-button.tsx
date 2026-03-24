import { IconProps } from "@tamagui/helpers-icon";
import { Button, Text } from "tamagui";

interface NavButtonProps {
  icon: React.ComponentType<IconProps>;
  label: string;
  active?: boolean;
}

const NavButton = ({ icon: Icon, label, active = false }: NavButtonProps) => (
  <Button
    flex={1}
    flexDirection="column"
    height={70}
    backgroundColor={active ? "$blue3" : "$backgroundHover"}
    borderColor={active ? "$blue7" : "transparent"}
    borderWidth={1}
  >
    <Icon size={20} color={active ? "$blue10" : "$color"} />
    <Text
      fontSize={13}
      marginTop="$1"
      fontWeight={"bold"}
      color={active ? "$blue10" : "$color"}
    >
      {label}
    </Text>
  </Button>
);

export default NavButton;
