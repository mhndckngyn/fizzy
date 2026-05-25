import ConfirmationDialog from "@/components/confirmation-dialog";
import { Comment } from "@/features/main/comments/types";
import { useDeleteComment } from "@/features/main/comments/use-delete-comment";
import { useEditComment } from "@/features/main/comments/use-edit-comment";
import React, { useState } from "react";

import { getInitials, getLightTint } from "@/features/main/_shared/helpers";
import { useCurrentTeamParams } from "@/features/main/_shared/hooks";
import { Edit3, Trash2 } from "@tamagui/lucide-icons-2";
import { format } from "date-fns";
import { Avatar, Button, Text, TextArea, View, XStack, YStack } from "tamagui";

type CommentItemProps = {
  comment: Comment;
  cardId: string;
};

export default function CommentItem({ comment, cardId }: CommentItemProps) {
  const { teamId } = useCurrentTeamParams();
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [editedBody, setEditedBody] = useState(comment.body);
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);

  const { mutateAsync: editComment, isPending: isSavePending } =
    useEditComment(cardId);
  const { mutateAsync: deleteComment, isPending: isDeletePending } =
    useDeleteComment(cardId);

  const { initials, color } = getInitials(comment.creatorName);
  const isPending = isSavePending || isDeletePending;

  const handleSave = async () => {
    await editComment({
      teamId,
      commentId: comment.commentId,
      body: editedBody,
    });
    setMode("view");
  };

  const handleDelete = async () => {
    await deleteComment({ teamId, commentId: comment.commentId });
    setConfirmDeleteDialogOpen(false);
  };

  return (
    <XStack alignItems="flex-start">
      {/* Avatar Container - sits "above" the box */}
      <View paddingTop="$2.5">
        <Avatar
          circular
          size="$3.5"
          backgroundColor={color}
          zIndex={10}
          shadowColor="$shadowColor"
          shadowRadius={2}
        >
          <Avatar.Fallback delayMs={600} backgroundColor={color} />
          <Text color="white" fontWeight="bold" fontSize="$3">
            {initials}
          </Text>
        </Avatar>
      </View>

      {/* Content Box */}
      <YStack
        flex={1}
        paddingTop="$2.5"
        paddingBottom="$2.5"
        paddingRight="$2"
        paddingLeft="$6" // Extra padding to clear the overlapping avatar
        marginLeft="$-4" // Negative margin to pull the box under the avatar
        gap="$1"
        backgroundColor="$gray3"
        borderRadius="$5"
      >
        <XStack justifyContent="space-between" alignItems="center">
          <YStack gap={"$1"}>
            <Text fontWeight="bold" theme="blue" fontSize="$5" color="$color">
              {comment.creatorName}
            </Text>
            <Text color="$gray10" fontSize="$3">
              {format(new Date(comment.createdAt), "EEE, MMM d, h:mm a")}
            </Text>
          </YStack>

          {comment.isOwner && mode === "view" && (
            <Button
              size="$3"
              circular
              icon={Edit3}
              onPress={() => setMode("edit")}
              backgroundColor="$gray3"
              borderColor="$gray7"
              borderWidth={1}
            />
          )}
        </XStack>

        {mode === "view" ? (
          <View mt="$2">
            <Text fontSize="$4" lineHeight="$5">
              {comment.body}
            </Text>
          </View>
        ) : (
          <YStack gap="$3" mt="$2.5">
            <TextArea
              value={editedBody}
              onChangeText={setEditedBody}
              borderWidth={1}
              fontSize="$4"
              focusStyle={{ borderColor: "$blue10" }}
            />
            <XStack justifyContent="space-between" alignItems="center">
              <Button
                size="$3"
                circular
                icon={Trash2}
                onPress={() => setConfirmDeleteDialogOpen(true)}
                backgroundColor={getLightTint("#fa2c2c", 0.7)}
              />

              <XStack gap="$2">
                <Button
                  size="$3"
                  chromeless
                  br="$8"
                  onPress={() => {
                    setMode("view");
                    setEditedBody(comment.body);
                  }}
                >
                  <Button.Text fontWeight="bold">Cancel</Button.Text>
                </Button>

                <Button
                  bg="$blue10"
                  size="$3"
                  br="$8"
                  theme="active"
                  onPress={handleSave}
                  opacity={editedBody.trim() === "" || isSavePending ? 0.5 : 1}
                  disabled={editedBody.trim() === "" || isSavePending}
                >
                  <Button.Text fontWeight="bold" color="white">
                    Save
                  </Button.Text>
                </Button>
              </XStack>
            </XStack>
          </YStack>
        )}
      </YStack>

      <ConfirmationDialog
        open={confirmDeleteDialogOpen}
        onOpenChange={setConfirmDeleteDialogOpen}
        dialogTitle="Delete Comment"
        dialogDescription="Are you sure you want to delete this comment?"
        confirmText="Delete"
        onConfirm={handleDelete}
      />
    </XStack>
  );
}
