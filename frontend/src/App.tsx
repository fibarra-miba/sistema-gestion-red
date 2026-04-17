import { AppRouter } from "./routes/AppRouter";
import { NotificationsProvider } from "./components/ui/notifications/NotificationsProvider";

function App() {
  return (
    <NotificationsProvider>
      <AppRouter />
    </NotificationsProvider>
  );
}

export default App;