import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store";
import { loadUser } from "../store/authSlice";
import { Colors } from "../constants";
import { Text, View, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LogoIcon } from "../components/Logo";

import LoginScreen from "../screens/auth/LoginScreen";
import OtpScreen from "../screens/auth/OtpScreen";

import CustomerHomeScreen from "../screens/customer/HomeScreen";
import CustomerSearchScreen from "../screens/customer/SearchScreen";
import CustomerCreateJobScreen from "../screens/customer/CreateJobScreen";
import CustomerJobsScreen from "../screens/customer/JobsScreen";
import CustomerJobDetailScreen from "../screens/customer/JobDetailScreen";
import CustomerProfileScreen from "../screens/customer/ProfileScreen";

import WorkerDashboardScreen from "../screens/worker/DashboardScreen";
import WorkerJobsScreen from "../screens/worker/JobsScreen";
import WorkerJobDetailScreen from "../screens/worker/JobDetailScreen";
import WorkerEarningsScreen from "../screens/worker/EarningsScreen";
import WorkerProfileScreen from "../screens/worker/ProfileScreen";

import ChatScreen from "../screens/common/ChatScreen";
import NotificationsScreen from "../screens/common/NotificationsScreen";
import RatingScreen from "../screens/common/RatingScreen";
import DisputeScreen from "../screens/common/DisputeScreen";
import PromoScreen from "../screens/common/PromoScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function CustomerTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "home";
          if (route.name === "Home") iconName = focused ? "home" : "home-outline";
          else if (route.name === "Search") iconName = focused ? "search" : "search-outline";
          else if (route.name === "Jobs") iconName = focused ? "briefcase" : "briefcase-outline";
          else if (route.name === "Profile") iconName = focused ? "person" : "person-outline";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={CustomerHomeScreen} />
      <Tab.Screen name="Search" component={CustomerSearchScreen} />
      <Tab.Screen name="Jobs" component={CustomerJobsScreen} />
      <Tab.Screen name="Profile" component={CustomerProfileScreen} />
    </Tab.Navigator>
  );
}

function WorkerTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "home";
          if (route.name === "Dashboard") iconName = focused ? "grid" : "grid-outline";
          else if (route.name === "Jobs") iconName = focused ? "briefcase" : "briefcase-outline";
          else if (route.name === "Earnings") iconName = focused ? "wallet" : "wallet-outline";
          else if (route.name === "Profile") iconName = focused ? "person" : "person-outline";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={WorkerDashboardScreen} />
      <Tab.Screen name="Jobs" component={WorkerJobsScreen} />
      <Tab.Screen name="Earnings" component={WorkerEarningsScreen} />
      <Tab.Screen name="Profile" component={WorkerProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(loadUser());
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.background }}>
        <LogoIcon size={80} />
        <Text style={{ marginTop: 16, color: Colors.textSecondary, fontSize: 14, fontWeight: "500" }}>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Otp" component={OtpScreen} />
          </>
        ) : (
          <>
            {user?.role === "worker" ? (
              <>
                <Stack.Screen name="WorkerTabs" component={WorkerTabs} />
                <Stack.Screen name="WorkerJobDetail" component={WorkerJobDetailScreen} />
              </>
            ) : (
              <>
                <Stack.Screen name="CustomerTabs" component={CustomerTabs} />
                <Stack.Screen name="CreateJob" component={CustomerCreateJobScreen} />
                <Stack.Screen name="JobDetail" component={CustomerJobDetailScreen} />
              </>
            )}
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="Rating" component={RatingScreen} />
            <Stack.Screen name="Dispute" component={DisputeScreen} />
            <Stack.Screen name="Promo" component={PromoScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
