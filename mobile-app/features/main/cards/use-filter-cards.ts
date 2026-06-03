import { useQuery } from "@tanstack/react-query";
import { useCurrentTeamParams } from "../_shared/hooks";
import { queryKeys } from "../_shared/query-keys";
import { ApiResponse, axiosInstance } from "@/lib/axios";

export type CardAssignee = {
  memberId: string;
  name: string;
};

export type CardTag = {
  tagId: string;
  title: string;
  color: string;
};

export type CardStatus =
  | "open"
  | "done"
  | "not-now"
  | "closing-soon"
  | "golden";
export type CardSortBy = "recently-updated" | "newest" | "oldest";

export type CardSummary = {
  cardId: string;
  no: number;
  title: string | null;
  status: CardStatus;
  columnId: string | null;
  columnName: string | null;
  columnColor: string | null;
  boardId: string;
  boardName: string;
  assignees: CardAssignee[];
  tags: CardTag[];
  createdAt: string;
  creatorName: string;
  updatedAt: string | null;
  closedAt: string | null;
  commentsCount?: number;
};

export type FilterCardsResponse = {
  cards: CardSummary[];
  total: number;
  page: number;
  pageSize: number;
};

export type FilterCardsParams = {
  boardId?: string | null;
  search?: string | null;
  statuses?: CardStatus[] | null;
  sortBy?: CardSortBy;
  assignedToIds?: string[] | null;
  assignedToNone?: boolean;
  addedByIds?: string[] | null;
  closedByIds?: string[] | null;
  tagIds?: string[] | null;
  page?: number;
  pageSize?: number;
};

export const useFilterCards = (params: FilterCardsParams = {}) => {
  const { teamId } = useCurrentTeamParams();

  return useQuery({
    queryKey: queryKeys.filterCards(teamId, params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();

      if (params.boardId) searchParams.set("boardId", params.boardId);
      if (params.search) searchParams.set("search", params.search);
      if (params.statuses?.length)
        searchParams.set("statuses", params.statuses.join(","));
      if (params.sortBy) searchParams.set("sortBy", params.sortBy);
      if (params.assignedToNone) {
        searchParams.set("assignedToNone", "true");
      } else if (params.assignedToIds?.length) {
        searchParams.set("assignedTo", params.assignedToIds.join(","));
      }
      if (params.addedByIds?.length)
        searchParams.set("addedBy", params.addedByIds.join(","));
      if (params.closedByIds?.length)
        searchParams.set("closedBy", params.closedByIds.join(","));
      if (params.tagIds?.length)
        searchParams.set("tags", params.tagIds.join(","));
      if (params.page) searchParams.set("page", String(params.page));
      if (params.pageSize)
        searchParams.set("pageSize", String(params.pageSize));

      const res = await axiosInstance.get<ApiResponse<FilterCardsResponse>>(
        `/api/teams/${teamId}/cards/filter?${searchParams.toString()}`,
      );
      return res.data.data;
    },
  });
};
