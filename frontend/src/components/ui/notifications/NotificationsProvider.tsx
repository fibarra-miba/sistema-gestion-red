import {
  Alert,
  type AlertColor,
  Snackbar,
} from "@mui/material";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type NotificationPayload = {
  message: string;
  severity?: AlertColor;
  autoHideDuration?: number;
};

type NotificationsContextValue = {
  notify: (payload: NotificationPayload) => void;
  success: (message: string, autoHideDuration?: number) => void;
  error: (message: string, autoHideDuration?: number) => void;
  warning: (message: string, autoHideDuration?: number) => void;
  info: (message: string, autoHideDuration?: number) => void;
};

type NotificationState = {
  open: boolean;
  message: string;
  severity: AlertColor;
  autoHideDuration: number;
};

const DEFAULT_AUTOHIDE = 3000;

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: "",
    severity: "success",
    autoHideDuration: DEFAULT_AUTOHIDE,
  });

  const notify = useCallback((payload: NotificationPayload) => {
    setNotification({
      open: true,
      message: payload.message,
      severity: payload.severity ?? "success",
      autoHideDuration: payload.autoHideDuration ?? DEFAULT_AUTOHIDE,
    });
  }, []);

  const success = useCallback(
    (message: string, autoHideDuration?: number) =>
      notify({ message, severity: "success", autoHideDuration }),
    [notify]
  );

  const error = useCallback(
    (message: string, autoHideDuration?: number) =>
      notify({ message, severity: "error", autoHideDuration }),
    [notify]
  );

  const warning = useCallback(
    (message: string, autoHideDuration?: number) =>
      notify({ message, severity: "warning", autoHideDuration }),
    [notify]
  );

  const info = useCallback(
    (message: string, autoHideDuration?: number) =>
      notify({ message, severity: "info", autoHideDuration }),
    [notify]
  );

  const handleClose = useCallback(() => {
    setNotification((prev) => ({
      ...prev,
      open: false,
    }));
  }, []);

  const value = useMemo<NotificationsContextValue>(
    () => ({
      notify,
      success,
      error,
      warning,
      info,
    }),
    [notify, success, error, warning, info]
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}

      <Snackbar
        open={notification.open}
        autoHideDuration={notification.autoHideDuration}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleClose}
          severity={notification.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </NotificationsContext.Provider>
  );
}

export function useNotificationsContext() {
  const context = useContext(NotificationsContext);

  if (!context) {
    throw new Error(
      "useNotificationsContext debe usarse dentro de NotificationsProvider"
    );
  }

  return context;
}