import { ApiResponse, axiosInstance } from "@/lib/axios";
import { create } from "zustand";
import { TeamRole } from "./types";

export type CurrentMember = {
  memberId: string;
  memberName: string;
  role: TeamRole;
  canManageTeam: boolean;
};

async function fetchCurrentMember(teamId: string) {
  const response = await axiosInstance.get<ApiResponse<CurrentMember>>(
    `/api/teams/${teamId}/members/me`,
  );
  return response.data.data;
}

type CurrentMemberState = {
  currentMember: CurrentMember | null;
  isLoading: boolean;
  fetch: (teamId: string) => Promise<void>;
  reset: () => void;
};

export const useCurrentMemberStore = create<CurrentMemberState>((set) => ({
  currentMember: null,
  isLoading: false,

  fetch: async (teamId) => {
    set({ isLoading: true });
    try {
      const member = await fetchCurrentMember(teamId);
      set({ currentMember: member, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  reset: () => set({ currentMember: null, isLoading: false }),
}));
