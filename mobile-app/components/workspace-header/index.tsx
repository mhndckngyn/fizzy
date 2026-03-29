import React from "react";
import { Adapt, Button, Popover, Sheet, Text, XStack, YStack } from "tamagui";

import { useCurrentTeamParams } from "@/features/main/_shared/hooks";
import { FizzyLogo } from "../fizzy-logo";
import GlobalPopoverContent from "./global-popover-content";
import TeamPopoverContent from "./team-popover-content";
import BasePopoverLayout from "./base-popover-layout";
import { useHeaderStore } from "./use-header-store";

export default function WorkspaceHeader() {
  const { teamId } = useCurrentTeamParams();
  const { leftAction, rightAction } = useHeaderStore();

  return (
    <YStack
      backgroundColor="$background"
      borderBottomWidth={1}
      borderColor="$borderColor"
    >
      <XStack
        height={60}
        alignItems="center"
        paddingHorizontal="$2"
        justifyContent="space-between"
      >
        {/* LEFT SLOT */}
        <XStack width={50} justifyContent="flex-start">
          {leftAction && (
            <Button
              circular
              size="$3"
              backgroundColor="$accentBackground"
              onPress={leftAction.onPress}
              pressStyle={{ opacity: 0.8, scale: 0.95 }}
              padding={0}
            >
              <leftAction.icon size={22} />
            </Button>
          )}
        </XStack>

        {/* CENTER SLOT - The Popover Trigger */}
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

          <Adapt when="sm" platform="touch">
            <Sheet modal dismissOnSnapToBottom>
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
            zIndex={100000}
          >
            <BasePopoverLayout>
              {teamId && <TeamPopoverContent teamId={teamId} />}
              <GlobalPopoverContent />
            </BasePopoverLayout>
          </Popover.Content>
        </Popover>

        {/* RIGHT SLOT */}
        <XStack width={50} justifyContent="flex-end">
          {rightAction && (
            <Button
              circular
              backgroundColor="$accentBackground"
              size="$3"
              pressStyle={{ opacity: 0.8, scale: 0.95 }}
              onPress={rightAction.onPress}
            >
              <rightAction.icon size={22} />
            </Button>
          )}
        </XStack>
      </XStack>
    </YStack>
  );
}
