import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentTeamParams } from "../_shared/hooks";
import { queryKeys } from "../_shared/query-keys";
import { ApiResponse, axiosInstance } from "@/lib/axios";

export type PinnedCard = {
  cardId: string;
  no: number;
  title: string | null;
  boardId: string;
  boardName: string;
  columnName: string | null;
  columnColor: string | null;
  pinnedAt: string;
  updatedAt?: string;
};

export const usePinnedCards = () => {
  const { teamId } = useCurrentTeamParams();
  return useQuery({
    queryKey: queryKeys.pins(teamId),
    queryFn: async () => {
      const res = await axiosInstance.get<ApiResponse<PinnedCard[]>>(
        `/api/teams/${teamId}/pins`,
      );
      return res.data.data;
    },
  });
};

export const useTogglePin = () => {
  const { teamId } = useCurrentTeamParams();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cardId: string) => {
      const res = await axiosInstance.post<ApiResponse<{ pinned: boolean }>>(
        `/api/teams/${teamId}/cards/${cardId}/pin`,
      );
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pins(teamId) });
    },
  });
};
