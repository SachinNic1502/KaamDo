import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { store } from "./src/store";
import AppNavigator from "./src/navigation/AppNavigator";
import {
  registerForPushNotifications,
  addNotificationListeners,
} from "./src/services/notifications";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  useEffect(() => {
    registerForPushNotifications();

    const cleanup = addNotificationListeners(
      (notification) => {},
      (response) => {}
    );

    return cleanup;
  }, []);

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
        <AppNavigator />
      </QueryClientProvider>
    </Provider>
  );
}
