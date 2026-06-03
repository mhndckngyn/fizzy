import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrentTeamParams } from "../_shared/hooks";
import { queryKeys } from "../_shared/query-keys";
import { axiosInstance } from "@/lib/axios";
import { MemberListResponse } from "./use-members";

type SetMemberRoleRequest = {
  teamId: string;
  memberId: string;
  action: "promote" | "demote";
};

async function setMemberRole({
  teamId,
  memberId,
  action,
}: SetMemberRoleRequest) {
  await axiosInstance.put(`/api/teams/${teamId}/members/${memberId}/${action}`);
}

export const useSetMemberRole = () => {
  const queryClient = useQueryClient();
  const { teamId } = useCurrentTeamParams();
  const key = queryKeys.members(teamId);

  return useMutation({
    mutationFn: (request: SetMemberRoleRequest) => setMemberRole(request),
    onMutate: async ({ memberId, action }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<MemberListResponse>(key);

      queryClient.setQueryData<MemberListResponse>(key, (old) => {
        if (!old) return old;
        return {
          ...old,
          members: old.members.map((m) =>
            m.memberId === memberId
              ? { ...m, role: action === "promote" ? 1 : 2 }
              : m,
          ),
        };
      });

      return { previous };
    },
    onError: (_err, _req, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(key, ctx.previous);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
  });
};
