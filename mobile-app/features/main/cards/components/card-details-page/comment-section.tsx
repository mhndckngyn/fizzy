import { useComments } from "@/features/main/comments/use-comments";
import React from "react";
import { Spinner, Text, YStack } from "tamagui";
import CommentBox from "./comment-box";
import CommentItem from "./comment-item";

interface CommentSectionProps {
  cardId: string;
}

export default function CommentSection({ cardId }: CommentSectionProps) {
  const { data: comments, isLoading: isLoadingComments } = useComments(cardId);

  return (
    <YStack gap="$3">
      {isLoadingComments ? (
        <YStack
          padding="$8"
          alignItems="center"
          justifyContent="center"
          gap="$2"
        >
          <Spinner size="large" color="$blue10" />
          <Text color="$colorFocus" fontSize="$2">
            Loading comments...
          </Text>
        </YStack>
      ) : (
        <YStack gap="$3">
          {comments &&
            comments.map((comment) => (
              <CommentItem
                key={comment.commentId}
                cardId={cardId}
                comment={comment}
              />
            ))}
        </YStack>
      )}

      <CommentBox cardId={cardId} />
    </YStack>
  );
}
