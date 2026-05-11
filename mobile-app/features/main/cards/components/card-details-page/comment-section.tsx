import { useComments } from "@/features/main/comments/use-comments";
import React from "react";
import { Spinner, Text, YStack } from "tamagui";
import CommentBox from "./comment-box";
import CommentItem from "./comment-item";
import { XStack } from "tamagui";
import { MessagesSquare } from "@tamagui/lucide-icons-2";

interface CommentSectionProps {
  cardId: string;
}

export default function CommentSection({ cardId }: CommentSectionProps) {
  const { data: comments, isLoading: isLoadingComments } = useComments(cardId);

  return (
    <YStack gap="$1">
      <XStack px="$1" pb="$4" ai="center" gap="$2">
        <MessagesSquare size={14} color="$color" opacity={0.5} />
        <Text
          fontSize={11}
          fontWeight="700"
          o={0.5}
          textTransform="uppercase"
          letterSpacing={0.5}
        >
          Discussion
        </Text>
      </XStack>

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
