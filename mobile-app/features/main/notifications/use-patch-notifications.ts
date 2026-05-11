import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { queryKeys } from "../_shared/query-keys";
import { TeamListResponse } from "../teams/use-teams";
import { Notification, NotificationSchema } from "./types";

export function usePatchNotifications() {
  const queryClient = useQueryClient();

  const patchNotificationList = useCallback(
    (payload: unknown) => {
      const parseResult = NotificationSchema.safeParse(payload);

      if (!parseResult.success) {
        console.log("Invalid notificaton payload:", parseResult.error);
        return;
      }

      const newNotification = parseResult.data;
      console.log("Received notification:", newNotification);

      const currentTeamsData = queryClient.getQueryData<TeamListResponse>(
        queryKeys.teams(),
      );

      if (
        !currentTeamsData?.teams.some(
          (team) => team.teamId === newNotification.teamId,
        )
      ) {
        console.log("Ignored notification: User not in team.");
        return;
      }

      queryClient.setQueryData(
        queryKeys.teamNotifications(newNotification.teamId),
        (currentNotifications: Notification[] | undefined) => {
          // might be undefined if we haven't fetched notification list yet
          if (!currentNotifications) {
            return [newNotification];
          }

          return [newNotification, ...currentNotifications];
        },
      );
    },
    [queryClient],
  );

  return patchNotificationList;
}
