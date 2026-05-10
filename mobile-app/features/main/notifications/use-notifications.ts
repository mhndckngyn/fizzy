import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../_shared/query-keys";
import { Notification } from "./types";
import { ApiResponse, axiosInstance } from "@/lib/axios";

export type NotificationListRequest = {
  teamId: string;
};

export type NotificationListResponse = {
  notifications: Notification[];
};

export async function getNotifications({ teamId }: NotificationListRequest) {
  const response = await axiosInstance.get<
    ApiResponse<NotificationListResponse>
  >(`/api/teams/${teamId}/notifications`);

  return response.data.data;
}

export const useNotification = (teamId: string) => {
  return useQuery({
    queryKey: queryKeys.teamNotifications(teamId),
    queryFn: () => getNotifications({ teamId }),
  });
};
