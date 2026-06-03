import { ApiResponse, axiosInstance } from "@/lib/axios";
import { FeedEvent } from "./types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { queryKeys } from "../_shared/query-keys";
import { useCurrentTeamParams } from "../_shared/hooks";

export type HomepageFeedRequest = {
  teamId: string;
  cursor?: string;
  boardIds: string[];
  memberIds: string[];
};

export type HomepageFeedResponse = {
  feedEvents: FeedEvent[];
  nextCursor?: string;
};

export async function getEventFeeds({
  teamId,
  cursor,
  boardIds,
  memberIds,
}: HomepageFeedRequest) {
  const params: Record<string, string> = {};

  if (cursor) {
    params.cursor = cursor;
  }

  if (boardIds.length > 0) {
    params.boardIds = boardIds.join(",");
  }

  if (memberIds.length > 0) {
    params.memberIds = memberIds.join(",");
  }

  const response = await axiosInstance.get<ApiResponse<HomepageFeedResponse>>(
    `/api/teams/${teamId}/feeds`,
    { params },
  );

  return response.data.data;
}

export const useEventFeeds = (boardIds: string[], memberIds: string[]) => {
  const { teamId } = useCurrentTeamParams();

  return useInfiniteQuery({
    queryKey: queryKeys.teamFeeds(teamId, { boardIds, memberIds }),
    queryFn: ({ pageParam }) =>
      getEventFeeds({ teamId, cursor: pageParam, memberIds, boardIds }),
    initialPageParam: "",
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
};
