import { EditorMentionItem } from "@/components/tiptap/tiptap-templates/simple/mention-suggestion";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useCurrentTeamParams } from "../_shared/hooks";
import { queryKeys } from "../_shared/query-keys";
import { getMembers } from "./api";

export const useMembers = () => {
  const { teamId } = useCurrentTeamParams();

  return useQuery({
    queryKey: queryKeys.members(teamId),
    queryFn: () => getMembers({ teamId }),
  });
};

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
