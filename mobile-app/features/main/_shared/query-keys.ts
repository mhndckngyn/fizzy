export const queryKeys = {
  teams: () => ["teams", "list"] as const,

  boards: (teamId: string) => ["teams", teamId, "boards", "list"] as const,

  columns: (teamId: string, boardId: string) =>
    ["teams", teamId, "boards", boardId, "columns"] as const,

  boardCards: (teamId: string, boardId: string) =>
    ["teams", teamId, "boards", boardId, "cards"] as const,

  card: (teamId: string, cardId: string) =>
    ["teams", teamId, "cards", cardId] as const,

  mentionCard: (teamId: string) =>
    ["teams", teamId, "cards", "mentions"] as const,

  members: (teamId: string) => ["teams", teamId, "members"] as const,

  comments: (teamId: string, cardId: string) =>
    ["teams", teamId, "cards", cardId, "comments"] as const,

  pins: (teamId: string) => ["pins", teamId] as const,
};
