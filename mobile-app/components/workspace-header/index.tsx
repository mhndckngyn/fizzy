import {
  ClipboardList,
  Home,
  LogOut,
  Plus,
  Settings,
  UserPlus,
} from "@tamagui/lucide-icons-2";
import React from "react";
import {
  Accordion,
  Adapt,
  Button,
  Input,
  Popover,
  ScrollView,
  Separator,
  Sheet,
  Text,
  XStack,
  YStack,
} from "tamagui";

import { useSignOut } from "@/features/user/hooks";
import { FizzyLogo } from "../fizzy-logo";
import AccordionSection from "./accordion-section";
import IconButton from "./icon-button";
import NavButton from "./nav-button";

export default function WorkspaceHeader() {
  const { mutate: signOut, isPending } = useSignOut();

  return (
    <YStack
      backgroundColor="$background"
      borderBottomWidth={1}
      borderColor="$borderColor"
    >
      <XStack
        height={60}
        justifyContent="center"
        alignItems="center"
        paddingHorizontal="$2"
      >
        <Popover size="$5" allowFlip placement="bottom-start">
          <Popover.Trigger asChild>
            <Button
              chromeless
              paddingHorizontal="$2"
              height={50}
              hoverStyle={{ backgroundColor: "$backgroundHover" }}
            >
              <XStack alignItems="center" gap="$3">
                <FizzyLogo size={32} />
                <Text
                  fontSize={22}
                  fontWeight="900"
                  color="$color"
                  letterSpacing={-0.5}
                >
                  Fizzy
                </Text>
              </XStack>
            </Button>
          </Popover.Trigger>

          {/* 2. Content logic remains the same, but 'modal' prop on Popover helps with layering */}
          <Adapt when="sm" platform="touch">
            <Sheet modal dismissOnSnapToBottom /*  animation="bouncy" */>
              <Sheet.Frame padding="$3">
                <Adapt.Contents />
              </Sheet.Frame>
              <Sheet.Overlay />
            </Sheet>
          </Adapt>

          <Popover.Content
            borderWidth={1}
            borderColor="$borderColor"
            enterStyle={{ y: -10, opacity: 0 }}
            exitStyle={{ y: -10, opacity: 0 }}
            elevate
            padding={0}
            width={320}
            zIndex={100000} // Ensure it stays on top
          >
            <ScrollView
              maxHeight={600}
              borderRadius="$4"
              backgroundColor="$background"
            >
              <YStack padding="$1" gap="$4">
                {/* Search Input */}
                <Input
                  placeholder="Type to jump to a board"
                  backgroundColor="$backgroundHover"
                  size="$4"
                  color="$color"
                  placeholderTextColor="$gray10"
                />

                {/* Top Navigation Grid */}
                <XStack gap="$2" justifyContent="space-between">
                  <NavButton icon={Home} label="Home" active />
                  <NavButton icon={ClipboardList} label="Assigned" />
                  <NavButton icon={UserPlus} label="Added" />
                </XStack>

                <Accordion defaultValue={["boards", "people"]} type="multiple">
                  <AccordionSection value="boards" title="BOARDS">
                    <YStack gap="$1">
                      <IconButton icon={Plus} label="Add a board" />
                    </YStack>
                  </AccordionSection>

                  <Separator marginVertical="$2" />

                  <AccordionSection value="people" title="PEOPLE">
                    <YStack gap="$1">
                      <IconButton icon={Plus} label="Invite people" />
                    </YStack>
                  </AccordionSection>

                  <Separator marginVertical="$2" />

                  <AccordionSection value="settings" title="SETTINGS">
                    <YStack gap="$1">
                      <IconButton icon={Settings} label="Account Settings" />
                      <IconButton
                        onPress={signOut}
                        icon={LogOut}
                        label="Sign out"
                      />
                    </YStack>
                  </AccordionSection>
                </Accordion>
              </YStack>
            </ScrollView>
          </Popover.Content>
        </Popover>
      </XStack>
    </YStack>
  );
}
