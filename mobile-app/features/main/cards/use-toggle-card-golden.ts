import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../_shared/query-keys";
import { ApiResponse, axiosInstance } from "@/lib/axios";
import { useCurrentTeamParams } from "../_shared/hooks";

type ToggleGoldenRequest = {
  teamId: string;
  boardId: string;
  cardId: string;
};

type ToggleGoldenResponse = {
  isGolden: boolean;
};

async function toggleCardGolden({ teamId, cardId }: ToggleGoldenRequest) {
  const response = await axiosInstance.post<ApiResponse<ToggleGoldenResponse>>(
    `/api/teams/${teamId}/cards/${cardId}/golden`,
  );
  return response.data.data;
}

export const useToggleCardGolden = () => {
  const queryClient = useQueryClient();
  const { teamId } = useCurrentTeamParams();

  return useMutation({
    mutationFn: (data: ToggleGoldenRequest) => toggleCardGolden(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.boardCards(variables.teamId, variables.boardId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.card(teamId, variables.cardId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.pins(teamId),
      });
    },
  });
};
