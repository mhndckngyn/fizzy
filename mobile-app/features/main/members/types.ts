export type TeamRole = 0 | 1 | 2; // Owner | Administrator | Member

export type Member = {
  memberId: string;
  memberName: string;
  email: string;
  role: TeamRole;
  canBeManaged: boolean;
};
