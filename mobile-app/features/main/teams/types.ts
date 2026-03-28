export type Team = {
  id: string;
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
  id: string;
  memberId: string;
};
