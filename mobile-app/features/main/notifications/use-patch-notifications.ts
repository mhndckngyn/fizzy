import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { queryKeys } from "../_shared/query-keys";
import { TeamListResponse } from "../teams/use-teams";
import { NotificationSchema } from "./types";
import { NotificationListResponse } from "./use-notifications";

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
        (current: NotificationListResponse | undefined) => {
          if (!current) {
            return { notifications: [newNotification] };
          }

          const exists = current.notifications.some(
            (n) => n.notificationId === newNotification.notificationId,
          );

          return {
            ...current,
            notifications: exists
              ? current.notifications.map((n) =>
                  n.notificationId === newNotification.notificationId
                    ? newNotification
                    : n,
                )
              : [newNotification, ...current.notifications],
          };
        },
      );
    },
    [queryClient],
  );

  return patchNotificationList;
}
