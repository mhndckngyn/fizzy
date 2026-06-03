import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { queryKeys } from "../_shared/query-keys";
import { NotificationListResponse } from "./use-notifications";

export const useReadNotification = (teamId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      axiosInstance.patch(`/api/notifications/${notificationId}/read`),
    onMutate: (notificationId) => {
      queryClient.setQueryData<NotificationListResponse>(
        queryKeys.teamNotifications(teamId),
        (old) => {
          if (!old) return old;
          return {
            notifications: old.notifications.map((n) =>
              n.notificationId === notificationId
                ? { ...n, unreadCount: 0, readAt: new Date().toISOString() }
                : n,
            ),
          };
        },
      );
    },
  });
};
