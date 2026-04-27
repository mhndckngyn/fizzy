export type Member = {
  memberId: string;
  memberName: string;
};

export type MemberMention = Pick<Member, "memberId" | "memberName">;
