import React from "react";
import { Button, Dialog, Text, XStack } from "tamagui";

interface ConfirmationDialogProps {
  open: boolean;
  dialogTitle: string;
  dialogDescription: string;
  confirmText?: string;
  cancelText?: string;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: () => void;
}

export default function ConfirmationDialog({
  open,
  dialogTitle,
  dialogDescription,
  confirmText = "Yes",
  cancelText = "No",
  onConfirm,
  onOpenChange,
}: ConfirmationDialogProps) {
  return (
    <Dialog modal open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          key="overlay"
          opacity={0.5}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <Dialog.Content
          bordered
          elevate
          key="content"
          gap="$4"
          width="90%"
          maxWidth={400}
          enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
          exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
          x={0}
          scale={1}
          opacity={1}
          y={0}
        >
          <Dialog.Title fontSize={20} fontWeight="bold" col="$color">
            {dialogTitle}
          </Dialog.Title>
          <Dialog.Description col="$color" fontSize={15} opacity={0.8}>
            {dialogDescription}
          </Dialog.Description>

          <XStack jc="flex-end" gap="$3" mt="$2">
            <Dialog.Close asChild>
              <Button backgroundColor={"$colorTransparent"}>
                <Text fontWeight="bold">{cancelText}</Text>
              </Button>
            </Dialog.Close>
            <Button
              theme="red" /* add theme/confirmType props */
              onPress={() => {
                onConfirm();
                onOpenChange(false);
              }}
            >
              <Button.Text fontWeight="bold">{confirmText}</Button.Text>
            </Button>
          </XStack>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
