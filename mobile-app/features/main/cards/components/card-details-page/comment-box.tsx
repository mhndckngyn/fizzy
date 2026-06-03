import { useCurrentTeamParams } from "@/features/main/_shared/hooks";
import { useCreateComment } from "@/features/main/comments/use-create-comment";
import { Send } from "@tamagui/lucide-icons-2";
import React, { useState } from "react";
import { Button, TextArea, XStack, YStack } from "tamagui";

type CommentBoxProps = {
  cardId: string;
};

export default function CommentBox({ cardId }: CommentBoxProps) {
  const { teamId } = useCurrentTeamParams();

  const [content, setContent] = useState("");
  const { mutateAsync: createComment, isPending: isCreating } =
    useCreateComment();

  const handlePost = async () => {
    if (!content.trim()) return;

    try {
      await createComment({ teamId, cardId, body: content });
      setContent(""); // Clear input on success
    } catch (error) {
      console.error("Failed to post comment:", error);
    }
  };

  return (
    <YStack gap="$2.5">
      <TextArea
        value={content}
        onChangeText={setContent}
        backgroundColor="$gray2"
        placeholder="Write a comment..."
        fontSize="$4"
        borderWidth={1}
        borderColor={"$gray5"}
        focusStyle={{ borderColor: "$blue10", borderWidth: 1 }}
      />

      <XStack justifyContent="flex-end">
        <Button
          bg="$blue10"
          size="$3"
          br={"$8"}
          onPress={handlePost}
          disabled={isCreating || !content.trim()}
          opacity={!content.trim() || isCreating ? 0.5 : 1}
          icon={isCreating ? null : <Send color={"white"} />}
        >
          <Button.Text fontWeight="bold" color={"white"}>
            {isCreating ? "Posting..." : "Post"}
          </Button.Text>
        </Button>
      </XStack>
    </YStack>
  );
}
