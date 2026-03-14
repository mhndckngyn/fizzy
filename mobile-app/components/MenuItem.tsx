import { Pressable, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
export function MenuItem({
  title,
  icon,
  onPress,
}: {
  title: string;
  icon?: any;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: "#e5e7eb" }}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
      }}
    >
      {icon && <Ionicons name={icon} size={16} />}
      <Text>{title}</Text>
    </Pressable>
  );
}
