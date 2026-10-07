import React, { useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { loadUser } from "../../store/authSlice";
import { Colors, FontSize, Spacing } from "../../utils/constants";
import { LogoFull } from "../../components/Logo";

// Auth Screens
import LoginScreen from "../screens/auth/LoginScreen";
import OtpScreen from "../screens/auth/OtpScreen";
import ForgotPasswordScreen from "../screens/auth/ForgotPasswordScreen";

// Customer Screens
import CustomerHomeScreen from "../screens/customer/HomeScreen";
import ServicesScreen from "../screens/customer/ServicesScreen";
import CustomerJobsScreen from "../screens/customer/JobsScreen";
import CustomerSearchScreen from "../screens/customer/SearchScreen";
import CustomerWorkerDetailScreen from "../screens/customer/WorkerDetailScreen";
import CustomerCreateJobScreen from "../screens/customer/CreateJobScreen";
import CustomerJobDetailScreen from "../screens/customer/JobDetailScreen";
import CustomerProfileScreen from "../screens/customer/ProfileScreen";

// Common Screens
import CustomerChatScreen from "../screens/common/ChatScreen";
import CustomerNotificationsScreen from "../screens/common/NotificationsScreen";
import CustomerRatingScreen from "../screens/common/RatingScreen";
import CustomerDisputeScreen from "../screens/common/DisputeScreen";
import CustomerPromoScreen from "../screens/common/PromoScreen";
import CustomerSettingsScreen from "../screens/common/SettingsScreen";
import CustomerSupportScreen from "../screens/common/SupportScreen";
import CustomerPrivacyScreen from "../screens/common/PrivacyScreen";
import CustomerAboutScreen from "../screens/common/AboutScreen";
import SavedAddressesScreen from "../screens/customer/SavedAddressesScreen";
import EditProfileScreen from "../screens/customer/EditProfileScreen";
import CustomerPaymentHistoryScreen from "../screens/customer/PaymentHistoryScreen";

import BubbleTabBar from "../../components/navigation/BubbleTabBar";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function CustomerTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <BubbleTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={CustomerHomeScreen} />
      <Tab.Screen name="Services" component={ServicesScreen} />
      <Tab.Screen name="Bookings" component={CustomerJobsScreen} />
      <Tab.Screen name="Notifications" component={CustomerNotificationsScreen} />
      <Tab.Screen name="Profile" component={CustomerProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isLoading } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingBrandWrap}>
          <LogoFull width={200} />
          <ActivityIndicator
            size="small"
            color={Colors.primary}
            style={{ marginTop: Spacing.xl }}
          />
          <Text style={styles.loadingText}>Connecting to KaamDo...</Text>
        </View>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          animationDuration: 220,
          contentStyle: { backgroundColor: Colors.background },
        }}
      >
        {!isAuthenticated ? (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ animation: "fade" }}
            />
            <Stack.Screen name="Otp" component={OtpScreen} />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="CustomerMain"
              component={CustomerTabs}
              options={{ animation: "fade" }}
            />
            <Stack.Screen name="Search" component={CustomerSearchScreen} />
            <Stack.Screen
              name="WorkerDetail"
              component={CustomerWorkerDetailScreen}
            />
            <Stack.Screen
              name="CreateJob"
              component={CustomerCreateJobScreen}
              options={{ animation: "slide_from_bottom" }}
            />
            <Stack.Screen
              name="JobDetail"
              component={CustomerJobDetailScreen}
            />
            <Stack.Screen name="Chat" component={CustomerChatScreen} />
            <Stack.Screen
              name="Rating"
              component={CustomerRatingScreen}
              options={{ animation: "fade_from_bottom", presentation: "modal" }}
            />
            <Stack.Screen
              name="Dispute"
              component={CustomerDisputeScreen}
              options={{ animation: "fade_from_bottom", presentation: "modal" }}
            />
            <Stack.Screen name="Promo" component={CustomerPromoScreen} />
            <Stack.Screen name="Settings" component={CustomerSettingsScreen} />
            <Stack.Screen name="Support" component={CustomerSupportScreen} />
            <Stack.Screen name="SavedAddresses" component={SavedAddressesScreen} />
            <Stack.Screen name="PaymentHistory" component={CustomerPaymentHistoryScreen} />
            <Stack.Screen name="Privacy" component={CustomerPrivacyScreen} />
            <Stack.Screen name="About" component={CustomerAboutScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
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
    padding: Spacing.xl,
  },
  loadingBrandWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Colors.textMuted,
    marginTop: Spacing.md,
    letterSpacing: 0.2,
  },
});
