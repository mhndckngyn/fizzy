import { FizzyLogo } from "@/components/FizzyLogo";
import { type Href, useRouter } from "expo-router";
import { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import { Button, Input, Text, View, XStack, YStack } from "tamagui";

const ACCENT_COLORS: { label: string; value: string; hex: string }[] = [
  { label: "Blue", value: "$blue9", hex: "#3b82f6" },
  { label: "Purple", value: "$purple9", hex: "#a855f7" },
  { label: "Green", value: "$green9", hex: "#22c55e" },
  { label: "Orange", value: "$orange9", hex: "#f97316" },
  { label: "Pink", value: "$pink9", hex: "#ec4899" },
  { label: "Red", value: "$red9", hex: "#ef4444" },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function CreateTeamScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(ACCENT_COLORS[0]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const initials = name.trim() ? getInitials(name) : "?";

  const handleCreate = async () => {
    if (!name.trim()) {
      setError("Team name is required.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      // TODO: replace with real API call
      // e.g. await api.post("/api/accounts", { name: name.trim() })
      await new Promise((r) => setTimeout(r, 800)); // simulate network
      router.replace("/teams/teams" as Href); // go to teams list
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View flex={1} bg="$background" px="$5" minHeight="100%">
            <YStack flex={1} py="$8" gap="$6">
              {/* Header row */}
              <XStack jc="space-between" ai="center">
                <FizzyLogo />
                <Pressable onPress={() => router.back()}>
                  <View
                    bg="$backgroundStrong"
                    bw={1}
                    bc="$borderColor"
                    br="$10"
                    px="$3"
                    py="$2"
                  >
                    <Text fontSize={13} col="$colorSubtle" fontWeight="500">
                      Cancel
                    </Text>
                  </View>
                </Pressable>
              </XStack>

              {/* Title */}
              <YStack gap="$1">
                <Text fontSize={28} fontWeight="700" col="$color">
                  New team
                </Text>
                <Text fontSize={14} col="$colorSubtle" lh={20}>
                  Create a workspace for your crew.
                </Text>
              </YStack>

              {/* Avatar preview */}
              <YStack ai="center" py="$2">
                <View
                  w={72}
                  h={72}
                  br="$6"
                  bg={selectedColor.hex}
                  ai="center"
                  jc="center"
                  shadowColor="$shadowColor"
                  shadowOffset={{ width: 0, height: 4 }}
                  shadowOpacity={0.15}
                  shadowRadius={12}
                >
                  <Text col="white" fontSize={24} fontWeight="800">
                    {initials}
                  </Text>
                </View>
                <Text fontSize={12} col="$colorSubtle" mt="$2">
                  Preview
                </Text>
              </YStack>

              {/* Name input */}
              <YStack gap="$2">
                <Text
                  fontSize={11}
                  fontWeight="500"
                  col="$colorSubtle"
                  tt="uppercase"
                  ls={0.8}
                >
                  Team name
                </Text>
                <Input
                  placeholder="e.g. Design Team"
                  placeholderTextColor="$color8"
                  value={name}
                  onChangeText={(val) => {
                    setName(val);
                    if (error) setError("");
                  }}
                  autoCapitalize="words"
                  autoCorrect={false}
                  size="$5"
                  returnKeyType="done"
                  onSubmitEditing={handleCreate}
                  borderColor={error ? "$red8" : undefined}
                />
                {error ? (
                  <Text fontSize={13} col="$red10">
                    {error}
                  </Text>
                ) : null}
              </YStack>

              {/* Color picker */}
              <YStack gap="$3">
                <Text
                  fontSize={11}
                  fontWeight="500"
                  col="$colorSubtle"
                  tt="uppercase"
                  ls={0.8}
                >
                  Team color
                </Text>
                <XStack gap="$3" flexWrap="wrap">
                  {ACCENT_COLORS.map((color) => {
                    const isSelected = color.value === selectedColor.value;
                    return (
                      <Pressable
                        key={color.value}
                        onPress={() => setSelectedColor(color)}
                      >
                        <View
                          w={40}
                          h={40}
                          br="$4"
                          bg={color.hex}
                          ai="center"
                          jc="center"
                          bw={isSelected ? 3 : 0}
                          bc="$color"
                          shadowColor={color.hex}
                          shadowOffset={{ width: 0, height: 2 }}
                          shadowOpacity={isSelected ? 0.5 : 0.1}
                          shadowRadius={6}
                          scale={isSelected ? 1.1 : 1}
                        >
                          {isSelected && (
                            <Text col="white" fontSize={16} fontWeight="700">
                              ✓
                            </Text>
                          )}
                        </View>
                      </Pressable>
                    );
                  })}
                </XStack>
              </YStack>

              {/* Spacer */}
              <View flex={1} />

              {/* Info note */}
              <View
                bg="$backgroundStrong"
                bw={1}
                bc="$borderColor"
                br="$4"
                p="$4"
              >
                <Text fontSize={13} col="$colorSubtle" lh={18}>
                  💡 {"You'll be the"}
                  <Text fontWeight="600" col="$color">
                    admin
                  </Text>{" "}
                  of this team. You can invite members after creating it.
                </Text>
              </View>

              {/* Submit */}
              <Button
                bg="$blue9"
                size="$5"
                br="$4"
                disabled={!name.trim() || loading}
                opacity={!name.trim() || loading ? 0.45 : 1}
                onPress={handleCreate}
              >
                <Text col="white" fontSize={16} fontWeight="600">
                  {loading ? "Creating…" : "Create team →"}
                </Text>
              </Button>
            </YStack>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
