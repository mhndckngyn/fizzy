import { create } from "zustand";

interface HeaderAction {
  icon: any;
  onPress: () => void;
}

interface HeaderState {
  leftAction: HeaderAction | null;
  rightAction: HeaderAction | null;

  setHeader: (
    config: Partial<Pick<HeaderState, "leftAction" | "rightAction">>,
  ) => void;
  resetHeader: () => void;
}

export const useHeaderStore = create<HeaderState>((set) => ({
  leftAction: null,
  rightAction: null,

  setHeader: (config) => set((state) => ({ ...state, ...config })),
  resetHeader: () => set({ leftAction: null, rightAction: null }),
}));
