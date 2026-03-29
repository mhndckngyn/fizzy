import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { TamaguiProvider, useTheme, useThemeName } from "tamagui";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { queryClient } from "@/lib/query-client";
import { QueryClientProvider } from "@tanstack/react-query";
import { tamaguiConfig } from "../tamagui.config";

function RootLayoutNav() {
  const theme = useTheme();
  const themeName = useThemeName();
  const isDark = themeName.startsWith("dark");

  return (
    <ThemeProvider
      value={
        isDark
          ? {
              ...DarkTheme,
              colors: { ...DarkTheme.colors, background: theme.background.val },
            }
          : {
              ...DefaultTheme,
              colors: {
                ...DefaultTheme.colors,
                background: theme.background.val,
              },
            }
      }
    >
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="(workspace)" />
      </Stack>

      <StatusBar style={isDark ? "light" : "dark"} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <QueryClientProvider client={queryClient}>
      <TamaguiProvider
        config={tamaguiConfig}
        defaultTheme={colorScheme === "dark" ? "dark" : "light"}
      >
        <RootLayoutNav />
      </TamaguiProvider>
    </QueryClientProvider>
  );
}
