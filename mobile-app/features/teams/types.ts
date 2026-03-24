export type Team = {
  externalTeamId: number;
  name: string;
  memberCount: number;
  // TODO: Latest activity
};

export type GetTeamsResponse = {
  teams: Team[];
};
