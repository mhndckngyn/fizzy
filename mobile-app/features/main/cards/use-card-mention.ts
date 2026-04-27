import { useQuery } from "@tanstack/react-query";
import { useCurrentTeamParams } from "../_shared/hooks";
import { queryKeys } from "../_shared/query-keys";
import { ApiResponse, axiosInstance } from "@/lib/axios";
import { CardMention } from "./types";

export type CardsMentionRequest = {
  teamId: string;
};

export type CardsMentionResponse = {
  cards: CardMention[];
};

export async function getCardsForMention({ teamId }: CardsMentionRequest) {
  const response = await axiosInstance.get<ApiResponse<CardsMentionResponse>>(
    `/api/teams/${teamId}/cards`,
  );
  return response.data.data;
}

export const useCardMention = () => {
  const { teamId } = useCurrentTeamParams();

  return useQuery({
    queryKey: queryKeys.mentionCard(teamId),
    queryFn: () => getCardsForMention({ teamId }),
    select: (data) =>
      data.cards.map((card) => ({
        id: card.cardId,
        name: `${card.no} - ${card.title}`,
      })),
  });
};
