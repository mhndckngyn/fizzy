import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrentTeamParams } from "../_shared/hooks";
import { queryKeys } from "../_shared/query-keys";
import { axiosInstance } from "@/lib/axios";

type RemoveMemberRequest = {
  teamId: string;
  memberId: string;
};

async function removeMember({ teamId, memberId }: RemoveMemberRequest) {
  await axiosInstance.delete(`/api/teams/${teamId}/members/${memberId}`);
}

export const useRemoveMember = () => {
  const queryClient = useQueryClient();
  const { teamId } = useCurrentTeamParams();

  return useMutation({
    mutationFn: (request: RemoveMemberRequest) => removeMember(request),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.members(teamId) }),
  });
};
