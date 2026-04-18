import { useGlobalSearchParams } from "expo-router";

export const useCurrentTeamParams = () => {
  const { teamId } = useGlobalSearchParams<{
    teamId: string;
  }>();
  return { teamId };
};

export const useCurrentBoardParams = () => {
  const { boardId } = useGlobalSearchParams<{ boardId: string }>();

  if (!boardId) {
    throw new Error(
      "useCurrentBoardParams must be used within a route containing [boardId]",
    );
  }

  return boardId;
};
