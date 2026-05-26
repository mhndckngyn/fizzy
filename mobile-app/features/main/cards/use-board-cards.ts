import { ApiResponse, axiosInstance } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { useCurrentTeamParams } from "../_shared/hooks";
import { queryKeys } from "../_shared/query-keys";
import { Card } from "./types";

export type CardsGetByBoardRequest = {
  teamId: string;
  boardId: string;
};

export type CardsGetByBoardResponse = {
  cards: Card[];
};

export async function getCardsByBoard({
  teamId,
  boardId,
}: CardsGetByBoardRequest) {
  const response = await axiosInstance.get<
    ApiResponse<CardsGetByBoardResponse>
  >(`/api/teams/${teamId}/boards/${boardId}/cards`);

  return response.data.data;
}

export const useBoardCards = (boardId: string) => {
  const { teamId } = useCurrentTeamParams();

  return useQuery({
    queryKey: queryKeys.boardCards(teamId, boardId),
    queryFn: () => getCardsByBoard({ teamId, boardId }),
    enabled: !!teamId && !!boardId,
  });
};
