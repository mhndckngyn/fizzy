import { ApiResponse, axiosInstance } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { useCurrentTeamParams } from "../_shared/hooks";
import { queryKeys } from "../_shared/query-keys";
import { Comment } from "./types";

export type GetCommentsResponse = {
  comments: Comment[];
};

export async function getComments({
  teamId,
  cardId,
}: {
  teamId: string;
  cardId: string;
}): Promise<GetCommentsResponse> {
  const response = await axiosInstance.get<ApiResponse<GetCommentsResponse>>(
    `/api/teams/${teamId}/cards/${cardId}/comments`,
  );
  return response.data.data;
}

export const useComments = (cardId: string) => {
  const { teamId } = useCurrentTeamParams();

  return useQuery({
    queryKey: queryKeys.comments(teamId, cardId),
    queryFn: () => getComments({ teamId, cardId }),
    enabled: !!teamId && !!cardId,
    select: (data) => data.comments,
  });
};
