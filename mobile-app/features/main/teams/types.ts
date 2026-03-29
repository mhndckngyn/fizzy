export type Team = {
  teamId: string;
  name: string;
  memberCount: number;
  // TODO: Latest activity
};

export type TeamListResponse = {
  teams: Team[];
};

export type TeamCreatePayload = {
  teamName: string;
  memberName: string;
};

export type TeamCreateResponse = {
  teamId: string;
  memberId: string;
};
