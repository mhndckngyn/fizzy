import { useEffect, useState } from "react";
import { TouchableOpacity } from "react-native";
import { Button, ScrollView, Sheet, Text, XStack, YStack } from "tamagui";
import { Check, X } from "@tamagui/lucide-icons-2";

type Option = { label: string; value: string };

type FeedFilterSheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  options: Option[];
  selected: string[];
  onApply: (selected: string[]) => void;
};

export function FeedFilterSheet({
  open,
  onClose,
  title,
  options,
  selected,
  onApply,
}: FeedFilterSheetProps) {
  const [pending, setPending] = useState<string[]>(selected);

  useEffect(() => {
    if (open) setPending(selected);
  }, [open, selected]);

  const toggle = (value: string) =>
    setPending((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );

  const handleApply = () => {
    onApply(pending);
    onClose();
  };

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={(o: boolean) => !o && onClose()}
      snapPoints={[50]}
      dismissOnSnapToBottom
      zIndex={100000}
    >
      <Sheet.Overlay />
      <Sheet.Frame px="$4" pt="$4" pb="$8">
        <XStack ai="center" jc="space-between" mb="$4">
          <Text fontWeight="700" fontSize="$5">
            {title}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <X size={20} color="$gray10" />
          </TouchableOpacity>
        </XStack>

        <ScrollView flex={1}>
          <YStack gap="$1">
            {options.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => toggle(opt.value)}
                activeOpacity={0.7}
              >
                <XStack ai="center" gap="$3" py="$2.5" px="$1">
                  <Text flex={1} fontSize="$4" color="$gray12">
                    {opt.label}
                  </Text>
                  {pending.includes(opt.value) && (
                    <Check size={18} color="$blue10" />
                  )}
                </XStack>
              </TouchableOpacity>
            ))}
          </YStack>
        </ScrollView>

        <Button mt="$4" onPress={handleApply} theme="blue">
          Apply
        </Button>
      </Sheet.Frame>
    </Sheet>
  );
}
