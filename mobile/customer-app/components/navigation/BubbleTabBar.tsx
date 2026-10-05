import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  LayoutChangeEvent,
  Dimensions,
} from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../utils/constants";
import { notificationService } from "../../services/notifications";
import { bookingService } from "../../services/bookings";

interface TabConfig {
  name: string;
  label: string;
  activeIcon: keyof typeof Ionicons.glyphMap;
  inactiveIcon: keyof typeof Ionicons.glyphMap;
}

const TAB_CONFIGS: Record<string, TabConfig> = {
  Home: {
    name: "Home",
    label: "Home",
    activeIcon: "home",
    inactiveIcon: "home-outline",
  },
  Services: {
    name: "Services",
    label: "Services",
    activeIcon: "grid",
    inactiveIcon: "grid-outline",
  },
  Bookings: {
    name: "Bookings",
    label: "Bookings",
    activeIcon: "briefcase",
    inactiveIcon: "briefcase-outline",
  },
  Notifications: {
    name: "Notifications",
    label: "Alerts",
    activeIcon: "notifications",
    inactiveIcon: "notifications-outline",
  },
  Profile: {
    name: "Profile",
    label: "Profile",
    activeIcon: "person",
    inactiveIcon: "person-outline",
  },
};

interface TabLayoutInfo {
  x: number;
  width: number;
}

export default function BubbleTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [unreadCount, setUnreadCount] = useState<number>(2);
  const [hasActiveBooking, setHasActiveBooking] = useState<boolean>(true);
  const [tabLayouts, setTabLayouts] = useState<Record<number, TabLayoutInfo>>({});
  const [dockWidth, setDockWidth] = useState<number>(
    Dimensions.get("window").width - 32
  );

  // Animated values for the shifting sliding bubble pill
  const shiftX = useRef(new Animated.Value(0)).current;
  const bubbleWidth = useRef(new Animated.Value(56)).current;
  const bubbleScale = useRef(new Animated.Value(1)).current;

  // Track unread notifications & active booking status
  useEffect(() => {
    let isMounted = true;
    const fetchCounters = async () => {
      try {
        const count = await notificationService.getUnreadCount();
        if (isMounted) setUnreadCount(count);

        const activeJobs = await bookingService.getActiveBookings();
        if (isMounted) setHasActiveBooking(activeJobs.length > 0);
      } catch {
        // use fallback defaults
      }
    };

    fetchCounters();
    const interval = setInterval(fetchCounters, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [state.index]);

  // Shifting animation when active tab index changes
  useEffect(() => {
    const currentLayout = tabLayouts[state.index];
    const totalTabs = state.routes.length;
    const defaultTabWidth = dockWidth / totalTabs;
    const targetX = currentLayout ? currentLayout.x : state.index * defaultTabWidth;
    const targetWidth = currentLayout ? currentLayout.width : defaultTabWidth;

    // Fluid spring shifting transition
    Animated.parallel([
      Animated.spring(shiftX, {
        toValue: targetX,
        friction: 8,
        tension: 85,
        useNativeDriver: false,
      }),
      Animated.spring(bubbleWidth, {
        toValue: targetWidth,
        friction: 8,
        tension: 85,
        useNativeDriver: false,
      }),
      // Organic squeeze and expand bounce during glide
      Animated.sequence([
        Animated.timing(bubbleScale, {
          toValue: 0.94,
          duration: 100,
          useNativeDriver: false,
        }),
        Animated.spring(bubbleScale, {
          toValue: 1,
          friction: 6,
          tension: 100,
          useNativeDriver: false,
        }),
      ]),
    ]).start();
  }, [state.index, tabLayouts, dockWidth]);

  const onItemLayout = (index: number, event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    setTabLayouts((prev) => {
      if (prev[index]?.x === x && prev[index]?.width === width) return prev;
      return {
        ...prev,
        [index]: { x, width },
      };
    });
  };

  const bottomOffset = insets.bottom > 0 ? insets.bottom + 6 : 14;

  return (
    <View style={[styles.outerWrapper, { bottom: bottomOffset }]}>
      <View
        style={styles.dockContainer}
        onLayout={(e) => setDockWidth(e.nativeEvent.layout.width)}
      >
        {/* Shifting Bubble Pill Indicator */}
        <Animated.View
          style={[
            styles.shiftingBubbleIndicator,
            {
              left: shiftX,
              width: bubbleWidth,
              transform: [{ scale: bubbleScale }],
            },
          ]}
        >
          <View style={styles.bubbleInnerGlow} />
        </Animated.View>

        {/* Tab Buttons */}
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const config = TAB_CONFIGS[route.name] || {
            name: route.name,
            label: route.name,
            activeIcon: "ellipse",
            inactiveIcon: "ellipse-outline",
          };

          const showNotifBadge =
            route.name === "Notifications" && unreadCount > 0 && !isFocused;
          const showBookingPulse =
            route.name === "Bookings" && hasActiveBooking && !isFocused;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={config.label}
              onPress={onPress}
              onLongPress={onLongPress}
              activeOpacity={0.85}
              style={[
                styles.tabItem,
                isFocused ? styles.tabItemFocused : styles.tabItemUnfocused,
              ]}
              onLayout={(e) => onItemLayout(index, e)}
            >
              <View style={styles.tabContentRow}>
                <View style={styles.iconContainer}>
                  <Ionicons
                    name={isFocused ? config.activeIcon : config.inactiveIcon}
                    size={isFocused ? 19 : 21}
                    color={isFocused ? "#FFFFFF" : "#64748B"}
                  />

                  {/* Notification badge bubble */}
                  {showNotifBadge && (
                    <View style={styles.badgePill}>
                      <Text style={styles.badgeText}>
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </Text>
                    </View>
                  )}

                  {/* Active ongoing booking live emerald dot */}
                  {showBookingPulse && <View style={styles.pulseDot} />}
                </View>

                {/* Animated label shown on active tab */}
                {isFocused && (
                  <Animated.Text
                    numberOfLines={1}
                    style={styles.activeLabelText}
                  >
                    {config.label}
                  </Animated.Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    position: "absolute",
    left: 14,
    right: 14,
    alignItems: "center",
    zIndex: 999,
  },
  dockContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    height: 64,
    backgroundColor: "#FFFFFF",
    borderRadius: 32,
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderWidth: 1.5,
    borderColor: "rgba(226, 232, 240, 0.9)",
    position: "relative",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#001E68",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 18,
      },
      android: {
        elevation: 12,
      },
      web: {
        boxShadow: "0 10px 30px rgba(0, 30, 104, 0.12), 0 2px 6px rgba(0,0,0,0.04)",
      } as any,
    }),
  },
  shiftingBubbleIndicator: {
    position: "absolute",
    top: 6,
    bottom: 6,
    height: 52,
    backgroundColor: Colors.primary, // #0456D3 Royal Blue
    borderRadius: 26,
    zIndex: 1,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: "0 4px 14px rgba(4, 86, 211, 0.4)",
      } as any,
    }),
  },
  bubbleInnerGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  tabItem: {
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    borderRadius: 26,
  },
  tabItemFocused: {
    flex: 1.35,
    paddingHorizontal: 12,
  },
  tabItemUnfocused: {
    flex: 1,
    paddingHorizontal: 4,
  },
  tabContentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    width: 26,
    height: 26,
  },
  activeLabelText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 6,
    letterSpacing: 0.1,
  },
  badgePill: {
    position: "absolute",
    top: -4,
    right: -7,
    backgroundColor: Colors.secondary, // #FE6705 Radiant Orange
    minWidth: 15,
    height: 15,
    borderRadius: 7.5,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 8.5,
    fontWeight: "800",
  },
  pulseDot: {
    position: "absolute",
    top: -1,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981", // Emerald green
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
});
