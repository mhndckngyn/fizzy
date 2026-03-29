export type InvitationInfoResponse = {
  teamName: string;
  memberCount: number;
};

export type JoinTeamPayload = {
  invitationCode: string;
  memberName: string;
};

export type JoinTeamResponse = {
  teamId: string;
  memberId: string;
};
