export type Member = {
  memberId: string;
  memberName: string;
};

export type MemberListRequest = {
  teamId: string;
};

export type MemberListResponse = {
  members: Member[];
};

export type MemberMention = Pick<Member, "memberId" | "memberName">;
