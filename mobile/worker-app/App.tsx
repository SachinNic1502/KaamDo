import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { store } from "./store";
import { AppNavigator } from "./app/navigation/AppNavigator";
import { registerForPushNotifications } from "./services/notifications";
import { ToastProvider } from "./components/ui/Toast";

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
  }, []);

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <ToastProvider>
            <StatusBar style="dark" />
            <AppNavigator />
          </ToastProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </Provider>
  );
}
