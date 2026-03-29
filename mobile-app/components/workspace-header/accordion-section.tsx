import { ChevronDown } from "@tamagui/lucide-icons-2";
import React from "react";
import { Accordion, Text, XStack } from "tamagui";

interface AccordionSectionProps {
  value: string;
  title: string;
  children: React.ReactNode;
}

const AccordionSection = ({
  value,
  title,
  children,
}: AccordionSectionProps) => (
  <Accordion.Item value={value} borderWidth={0}>
    <Accordion.Trigger
      flexDirection="row"
      justifyContent="space-between"
      paddingHorizontal={0}
      backgroundColor="transparent"
      borderWidth={0}
      px={"$2"}
      py={"$2"}
      focusStyle={{ backgroundColor: "transparent" }}
    >
      {({ open }: { open: boolean }) => (
        <XStack alignItems="center" gap="$2">
          <ChevronDown
            size={14}
            style={{
              transform: [{ rotate: open ? "0deg" : "-90deg" }],
              // transition: "transform 0.2s",
            }}
          />
          <Text
            fontWeight="800"
            fontSize={14}
            color="$gray10"
            letterSpacing={0.5}
            textTransform="uppercase"
          >
            {title}
          </Text>
        </XStack>
      )}
    </Accordion.Trigger>
    <Accordion.Content paddingHorizontal="$2" paddingVertical="$1">
      {children}
    </Accordion.Content>
  </Accordion.Item>
);

export default AccordionSection;
