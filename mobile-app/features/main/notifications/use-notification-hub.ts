import { HubConnection, HubConnectionState } from "@microsoft/signalr";
import { useEffect, useRef, useState } from "react";
import { usePatchNotifications } from "./use-patch-notifications";
import { buildSignalRConnection } from "@/lib/signalr";
import { AppState } from "react-native";

export const useNotificationHub = () => {
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const patchNotifications = usePatchNotifications();

  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const newConnection = buildSignalRConnection();
    setConnection(newConnection);
  }, []);

  useEffect(() => {
    if (connection) {
      connection
        .start()
        .then(() => {
          console.log("Connected to Notification Hub.");

          connection.on("ReceiveNotification", (payload: unknown) => {
            patchNotifications(payload);
          });
        })
        .catch((err) =>
          console.log("Cannot connect to Notification Hub:", err),
        );

      return () => {
        connection?.stop();
      };
    }
  }, [connection, patchNotifications]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      // If the app is transitioning from background -> active (foreground)
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        console.log("App has returned to the foreground!");

        // If the OS killed the connection while we were asleep, restart it manually
        if (
          connection &&
          connection.state === HubConnectionState.Disconnected
        ) {
          console.log("SignalR is dead. Forcing manual reconnect...");

          connection
            .start()
            .then(() =>
              console.log("Reconnected to Notification Hub successfully!"),
            )
            .catch((err) => console.log("Manual reconnect failed:", err));
        }
      }

      // Update the current state tracking
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [connection]);

  return connection;
};
