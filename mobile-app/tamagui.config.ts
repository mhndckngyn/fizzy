import { createAnimations } from "@tamagui/animations-react-native";
import { config } from "@tamagui/config/v3";
import { createTamagui } from "tamagui";

export const animations = createAnimations({
  quick: {
    type: "spring",
    damping: 20,
    mass: 1.2,
    stiffness: 250,
  },
});

export const tamaguiConfig = createTamagui({ ...config, animations });
export default tamaguiConfig;

export type Conf = typeof tamaguiConfig;
declare module "tamagui" {
  interface TamaguiCustomConfig extends Conf {}
}
