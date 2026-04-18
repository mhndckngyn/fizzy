import React from "react";
import { Button, Dialog, Text, XStack } from "tamagui";

interface DeleteColumnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteColumnDialog({
  open,
  onOpenChange,
  onConfirm,
}: DeleteColumnDialogProps) {
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
            Delete Column
          </Dialog.Title>
          <Dialog.Description col="$color" fontSize={15} opacity={0.8}>
            Are you sure you want to delete this column? This will move the
            cards back to Maybe.
          </Dialog.Description>

          <XStack jc="flex-end" gap="$3" mt="$4">
            <Dialog.Close asChild>
              <Button>
                <Text fontWeight="bold">Cancel</Text>
              </Button>
            </Dialog.Close>
            <Button
              bg="$red10"
              onPress={() => {
                onConfirm();
                onOpenChange(false);
              }}
            >
              <Text col="white" fontWeight="bold">
                Delete
              </Text>
            </Button>
          </XStack>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
