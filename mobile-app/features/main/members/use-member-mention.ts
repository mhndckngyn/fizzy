import { EditorMentionItem } from "@/components/tiptap/tiptap-templates/simple/mention-suggestion";
import { useMemo } from "react";
import { useMembers } from "./use-members";

// using this in case the member object grows larger
export const useMemberMention = () => {
  const { data: memberQuery } = useMembers();

  const mentionData = useMemo(() => {
    if (!memberQuery) {
      return;
    }

    return memberQuery.members.map(
      (member): EditorMentionItem => ({
        id: member.memberId,
        name: member.memberName,
      }),
    );
  }, [memberQuery]);

  return mentionData;
};
