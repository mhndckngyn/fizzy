import React from "react";
import { ScrollView, YStack } from "tamagui";

interface Props {
  children: React.ReactNode;
}

export default function BasePopoverLayout({ children }: Props) {
  return (
    <ScrollView maxHeight={600} borderRadius="$4" backgroundColor="$background">
      <YStack padding="$1">{children}</YStack>
    </ScrollView>
  );
}
