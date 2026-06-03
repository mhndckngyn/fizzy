import { useInvitationCode } from "@/features/main/members/use-invitation-code";
import { Check, Copy, Plus } from "@tamagui/lucide-icons-2";
import * as Clipboard from "expo-clipboard";
import { useState } from "react";
import { Button, Spinner, Text, View, XStack, YStack } from "tamagui";

export function InviteSection({ membersCount }: { membersCount: number }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { data, isLoading } = useInvitationCode(open);

  async function handleCopy() {
    if (!data?.invitationCode) return;
    await Clipboard.setStringAsync(data.invitationCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <YStack gap="$2">
      <XStack ai="center" jc="space-between">
        <Text
          fontSize="$3"
          fontWeight="700"
          color="$gray9"
          letterSpacing={0.5}
          textTransform="uppercase"
        >
          Members · {membersCount}
        </Text>

        <Button
          size="$2"
          bg="$blue9"
          borderRadius="$10"
          icon={<Plus size={14} color="white" />}
          onPress={() => setOpen((v) => !v)}
        >
          <Button.Text fontWeight="bold" color="white">
            Invite people
          </Button.Text>
        </Button>
      </XStack>

      {open && (
        <XStack ai="center" jc="center" gap="$2" pl="$1">
          {isLoading ? (
            <Spinner size="small" />
          ) : (
            <>
              <View
                borderWidth={1}
                borderColor="$gray5"
                borderRadius="$8"
                backgroundColor="$gray2"
                px="$3"
                py="$2.5"
              >
                <Text fontSize="$3" color="$gray10" numberOfLines={1}>
                  {data?.invitationCode}
                </Text>
              </View>
              <View
                onPress={handleCopy}
                pressStyle={{ opacity: 0.6 }}
                cursor="pointer"
                p="$1"
              >
                {copied ? (
                  <Check size={18} color="$green9" />
                ) : (
                  <Copy size={18} color="$gray9" />
                )}
              </View>
            </>
          )}
        </XStack>
      )}
    </YStack>
  );
}
