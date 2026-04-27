import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../_shared/query-keys";
import { ApiResponse, axiosInstance } from "@/lib/axios";
import { CardDetail } from "./types";

export async function getCard({
  teamId,
  cardId,
}: {
  teamId: string;
  cardId: string;
}): Promise<CardDetail> {
  const response = await axiosInstance.get<ApiResponse<CardDetail>>(
    `/api/teams/${teamId}/cards/${cardId}`,
  );
  return response.data.data;
}

export const useCard = (teamId: string, cardId: string) =>
  useQuery({
    queryKey: queryKeys.card(teamId, cardId),
    queryFn: () => getCard({ teamId, cardId }),
    enabled: !!teamId && !!cardId,
  });
