import React, { useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet, StatusBar } from "react-native";
import { NavigationContainer, createNavigationContainerRef } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import * as Notifications from "expo-notifications";
import { useAppDispatch, useAppSelector } from "../../store";
import { setCredentials, setLoading } from "../../store/authSlice";
import { getAuthToken, getUserData, getWorkerProfile } from "../../services/storage";
import { Colors, Spacing, FontSize } from "../../utils/constants";
import { LogoWordmark } from "../../components/Logo";

// Auth Screens
import { LoginScreen } from "../screens/auth/LoginScreen";
import { OtpScreen } from "../screens/auth/OtpScreen";
import { ForgotPasswordScreen } from "../screens/auth/ForgotPasswordScreen";

// Worker Core Screens
import { DashboardScreen } from "../screens/worker/DashboardScreen";
import { RequestsScreen } from "../screens/worker/RequestsScreen";
import { JobsScreen } from "../screens/worker/JobsScreen";
import { EarningsScreen } from "../screens/worker/EarningsScreen";
import { ProfileScreen } from "../screens/worker/ProfileScreen";
import { JobDetailScreen } from "../screens/worker/JobDetailScreen";
import { KYCOnboardingScreen } from "../screens/worker/KYCOnboardingScreen";
import { SkillsScreen } from "../screens/worker/SkillsScreen";
import { PayoutHistoryScreen } from "../screens/worker/PayoutHistoryScreen";
import { AttendanceScreen } from "../screens/worker/AttendanceScreen";
import { ReviewsScreen } from "../screens/worker/ReviewsScreen";

// Common Screens
import WorkerChatScreen from "../screens/common/ChatScreen";
import WorkerNotificationsScreen from "../screens/common/NotificationsScreen";
import WorkerRatingScreen from "../screens/common/RatingScreen";
import WorkerDisputeScreen from "../screens/common/DisputeScreen";
import WorkerSettingsScreen from "../screens/common/SettingsScreen";
import WorkerSupportScreen from "../screens/common/SupportScreen";

import WorkerBubbleTabBar from "../../components/navigation/WorkerBubbleTabBar";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
export const navigationRef = createNavigationContainerRef();

const linking = {
  prefixes: ["kaamdo-partner://", "kaamdo://partner"],
  config: {
    screens: {
      WorkerMain: {
        screens: {
          Home: "home",
          Requests: "requests",
          Jobs: "jobs",
          Earnings: "earnings",
          Profile: "profile",
        },
      },
      JobDetail: "job/:jobId",
      Chat: "chat/:jobId",
      PayoutHistory: "payouts",
      Attendance: "attendance",
      Reviews: "reviews",
    },
  },
};

function WorkerTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <WorkerBubbleTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Requests" component={RequestsScreen} />
      <Tab.Screen name="Jobs" component={JobsScreen} />
      <Tab.Screen name="Earnings" component={EarningsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    async function restoreSession() {
      try {
        const token = await getAuthToken();
        const user = await getUserData();
        const workerProfile = await getWorkerProfile();

        if (token && user) {
          dispatch(setCredentials({ token, user, workerProfile }));
        } else {
          dispatch(setLoading(false));
        }
      } catch {
        dispatch(setLoading(false));
      }
    }
    restoreSession();
  }, [dispatch]);

  // Handle direct notification tap deep-links for technicians
  useEffect(() => {
    const unsub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      if (!data) return;

      if (navigationRef.isReady()) {
        if (data.screen === "JobDetail" && data.jobId) {
          (navigationRef as any).navigate("JobDetail", { jobId: data.jobId });
        } else if (data.screen === "Chat" && data.jobId) {
          (navigationRef as any).navigate("Chat", {
            jobId: data.jobId,
            customerId: data.otherUserId,
            customerName: data.senderName,
          });
        } else if (data.screen === "PayoutHistory") {
          (navigationRef as any).navigate("PayoutHistory");
        } else if (data.screen === "Reviews") {
          (navigationRef as any).navigate("Reviews");
        }
      }
    });

    return () => {
      unsub.remove();
    };
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingBrandWrap}>
          <LogoWordmark width={220} />
          <View style={styles.partnerBadge}>
            <Text style={styles.partnerBadgeText}>PARTNER PORTAL</Text>
          </View>
          <ActivityIndicator
            size="small"
            color={Colors.primary}
            style={{ marginTop: Spacing.xl }}
          />
          <Text style={styles.loadingText}>Connecting to KaamDo Partner...</Text>
        </View>
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef} linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Otp" component={OtpScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={WorkerTabs} />
            <Stack.Screen name="JobDetail" component={JobDetailScreen} />
            <Stack.Screen name="KYCOnboarding" component={KYCOnboardingScreen} />
            <Stack.Screen name="Skills" component={SkillsScreen} />
            <Stack.Screen name="Chat" component={WorkerChatScreen} />
            <Stack.Screen name="Notifications" component={WorkerNotificationsScreen} />
            <Stack.Screen name="Dispute" component={WorkerDisputeScreen} />
            <Stack.Screen name="Rating" component={WorkerRatingScreen} />
            <Stack.Screen name="PayoutHistory" component={PayoutHistoryScreen} />
            <Stack.Screen name="Attendance" component={AttendanceScreen} />
            <Stack.Screen name="Reviews" component={ReviewsScreen} />
            <Stack.Screen name="Settings" component={WorkerSettingsScreen} />
            <Stack.Screen name="Support" component={WorkerSupportScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingBrandWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  partnerBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: Spacing.xs,
  },
  partnerBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  loadingText: {
    marginTop: Spacing.sm,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
});
