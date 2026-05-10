import { useHeaderStore } from "@/components/workspace-header/use-header-store";
import { useCurrentTeamParams } from "@/features/main/_shared/hooks";
import { usePinnedCards, PinnedCard } from "@/features/main/pins/use-pins";
import { ArrowLeft } from "@tamagui/lucide-icons-2";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import { TouchableOpacity } from "react-native";
import {
  ScrollView,
  Separator,
  Spinner,
  Text,
  View,
  XStack,
  YStack,
} from "tamagui";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return `${Math.floor(days / 7)}w ago`;
}

function PinnedCardItem({
  pin,
  onPress,
}: {
  pin: PinnedCard;
  onPress: () => void;
}) {
  const columnColor = pin.columnColor ?? "#3d4e65";
  const bgColor = `${columnColor}18`;
  const columnName = pin.columnName?.toUpperCase() ?? "";

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75}>
      <View backgroundColor={bgColor} borderRadius="$2" overflow="hidden">
        <XStack ai="stretch">
          <XStack
            ai="center"
            gap="$2"
            backgroundColor={columnColor}
            paddingHorizontal="$2.5"
            paddingVertical="$1"
            borderTopLeftRadius="$2"
            borderBottomRightRadius="$2"
          >
            <Text color="white" fontWeight="900" fontSize="$2">
              {pin.no}
            </Text>
            <Separator vertical borderColor="white" opacity={0.5} height={12} />
            <Text
              color="white"
              fontWeight="700"
              fontSize="$2"
              textTransform="uppercase"
              letterSpacing={1}
            >
              {pin.boardName}
            </Text>
          </XStack>

          <View flex={1} />

          {!!columnName && (
            <XStack
              ai="center"
              backgroundColor={columnColor}
              paddingHorizontal="$2.5"
              paddingVertical="$1"
              borderTopRightRadius="$2"
              borderBottomLeftRadius="$2"
            >
              <Text
                color="white"
                fontWeight="800"
                fontSize={10}
                letterSpacing={0.5}
              >
                {columnName}
              </Text>
            </XStack>
          )}
        </XStack>

        <YStack paddingHorizontal="$3" paddingVertical="$2.5" gap="$1">
          <Text
            fontWeight="700"
            fontSize="$4"
            color="$gray12"
            numberOfLines={2}
          >
            {pin.title ?? "(Untitled)"}
          </Text>
          <Text fontSize="$2" color="$gray9">
            {timeAgo(pin.pinnedAt)}
          </Text>
        </YStack>
      </View>
    </TouchableOpacity>
  );
}

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
        {data.map((pin) => (
          <PinnedCardItem
            key={pin.cardId}
            pin={pin}
            onPress={() => router.push(`/teams/${teamId}/cards/${pin.cardId}`)}
          />
        ))}
      </YStack>
    </ScrollView>
  );
}
