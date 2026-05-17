import { useHeaderStore } from "@/components/workspace-header/use-header-store";
import { useCurrentTeamParams } from "@/features/main/_shared/hooks";
import { PinnedCardItem } from "@/features/main/pins/components/pinned-card-item";
import { usePinnedCards } from "@/features/main/pins/use-pins";
import { ArrowLeft } from "@tamagui/lucide-icons-2";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import { ScrollView, Spinner, Text, View, YStack } from "tamagui";

export default function PinnedScreen() {
  const { teamId } = useCurrentTeamParams();
  const router = useRouter();
  const setHeader = useHeaderStore((s) => s.setHeader);
  const resetHeader = useHeaderStore((s) => s.resetHeader);

  const { data, isLoading } = usePinnedCards();

  useFocusEffect(
    useCallback(() => {
      setHeader({
        leftAction: { icon: ArrowLeft, onPress: () => router.back() },
      });
      return resetHeader;
    }, [setHeader, resetHeader, router]),
  );

  if (isLoading) {
    return (
      <View f={1} ai="center" jc="center">
        <Spinner size="large" />
      </View>
    );
  }

  if (!data?.length) {
    return (
      <View f={1} ai="center" jc="center" gap="$2">
        <Text color="$gray9" fontSize="$3">
          No pinned cards
        </Text>
      </View>
    );
  }

  return (
    <ScrollView>
      <YStack p="$3" gap="$3">
        <Text
          fontSize="$3"
          fontWeight="700"
          color="$gray11"
          letterSpacing={0.5}
          textTransform="uppercase"
        >
          Your Pins
        </Text>
        {data.map((pin) => (
          <PinnedCardItem key={pin.cardId} pin={pin} teamId={teamId} />
        ))}
      </YStack>
    </ScrollView>
  );
}
