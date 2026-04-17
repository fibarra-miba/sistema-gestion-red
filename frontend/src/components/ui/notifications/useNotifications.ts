import { useNotificationsContext } from "./NotificationsProvider";

export function useNotifications() {
  return useNotificationsContext();
}