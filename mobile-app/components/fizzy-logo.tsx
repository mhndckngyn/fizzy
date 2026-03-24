import { Image } from "react-native";

export function FizzyLogo({ size = 30 }: { size?: number }) {
  return (
    <Image
      source={require("../assets/logo.png")}
      style={{ width: size, height: size, resizeMode: "contain" }}
    />
  );
}
