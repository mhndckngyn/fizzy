import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { authClient } from "./auth-client";

const URL = `${process.env.EXPO_PUBLIC_API_BASE_URL}/hubs/notifications`;

export function buildSignalRConnection() {
  return new HubConnectionBuilder()
    .withUrl(URL, {
      accessTokenFactory: async () => {
        const response = await authClient.token();
        return response?.data?.token ?? "";
      },
    })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Information)
    .build();
}
