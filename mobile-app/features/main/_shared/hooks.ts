import { useGlobalSearchParams, usePathname } from "expo-router";

export const useCurrentTeamParams = () => {
  const { teamId } = useGlobalSearchParams<{
    teamId: string;
  }>();
  return { teamId };
};

export const useCurrentBoardParams = () => {
  const { boardId } = useGlobalSearchParams<{ boardId: string }>();
  const pathname = usePathname();

  if (!boardId) {
    console.warn(
      `[useCurrentBoardParams] boardId is undefined at URL: ${pathname}`,
    );
    return "";
  }

  return boardId;
};
