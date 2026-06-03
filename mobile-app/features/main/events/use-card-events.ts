import { ApiResponse, axiosInstance } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../_shared/query-keys";
import { useCurrentTeamParams } from "../_shared/hooks";

export type CardEvent = {
  eventId: string;
  title: string;
  createdAt: string;
};

type CardEventsResponse = {
  events: CardEvent[];
};

async function getCardEvents(teamId: string, cardId: string) {
  const response = await axiosInstance.get<ApiResponse<CardEventsResponse>>(
    `/api/teams/${teamId}/cards/${cardId}/events`,
  );
  return response.data.data;
}

export const useCardEvents = (
  cardId: string,
  options?: { enabled?: boolean },
) => {
  const { teamId } = useCurrentTeamParams();

  return useQuery({
    queryKey: queryKeys.cardEvents(teamId, cardId),
    queryFn: () => getCardEvents(teamId, cardId),
    enabled: options?.enabled ?? true,
  });
};
