import { useGlobalSearchParams } from "expo-router";

export const useCurrentTeamParams = () => {
  const { teamId } = useGlobalSearchParams<{ teamId: string }>();
  return { teamId };
};
