import { FilterCardsParams } from "@/features/main/cards/use-filter-cards";

export const queryKeys = {
  // TODO every key should include "sessions" (as used in use-session)

  teams: () => ["teams", "list"] as const,

  teamNotifications: (teamId: string) => ["notifications", teamId],

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

  tags: (teamId: string) => ["teams", teamId, "tags"] as const,

  filterCards: (teamId: string, params: FilterCardsParams) =>
    ["teams", teamId, "cards", "filter", params] as const,
};
