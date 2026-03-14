import { Pressable, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ComponentProps } from "react";

type TopButtonProps = {
  title: string;
  icon: ComponentProps<typeof Ionicons>["name"];
};
export function TopButton({ title, icon }: TopButtonProps) {
  return (
    <Pressable
      style={{
        flex: 1,
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#e5e7eb",
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 10,
      }}
    >
      <Ionicons name={icon} size={18} />
      <Text>{title}</Text>
    </Pressable>
  );
}
