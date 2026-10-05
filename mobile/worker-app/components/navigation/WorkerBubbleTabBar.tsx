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
import { api } from "../../services/api";
import { getAuthToken } from "../../services/storage";

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
    activeIcon: "speedometer",
    inactiveIcon: "speedometer-outline",
  },
  Requests: {
    name: "Requests",
    label: "Leads",
    activeIcon: "flash",
    inactiveIcon: "flash-outline",
  },
  Jobs: {
    name: "Jobs",
    label: "Jobs",
    activeIcon: "briefcase",
    inactiveIcon: "briefcase-outline",
  },
  Earnings: {
    name: "Earnings",
    label: "Earnings",
    activeIcon: "wallet",
    inactiveIcon: "wallet-outline",
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

export default function WorkerBubbleTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [pendingRequestsCount, setPendingRequestsCount] = useState<number>(3);
  const [hasActiveJob, setHasActiveJob] = useState<boolean>(true);
  const [tabLayouts, setTabLayouts] = useState<Record<number, TabLayoutInfo>>({});
  const [dockWidth, setDockWidth] = useState<number>(
    Dimensions.get("window").width - 32
  );

  // Animated shifting bubble values
  const shiftX = useRef(new Animated.Value(0)).current;
  const bubbleWidth = useRef(new Animated.Value(56)).current;
  const bubbleScale = useRef(new Animated.Value(1)).current;

  // Track pending leads & active in-progress job count
  useEffect(() => {
    let isMounted = true;
    const fetchCounters = async () => {
      try {
        const token = await getAuthToken();
        if (!token) return;

        // Try to fetch bookings or pending requests if API available
        const res = await api.get<{ bookings: any[] }>("/api/bookings/worker?status=PENDING", token);
        if (isMounted && res.bookings) {
          setPendingRequestsCount(res.bookings.length);
        }

        const activeRes = await api.get<{ bookings: any[] }>("/api/bookings/worker?status=IN_PROGRESS", token);
        if (isMounted && activeRes.bookings) {
          setHasActiveJob(activeRes.bookings.length > 0);
        }
      } catch {
        // Fallback default state
      }
    };

    fetchCounters();
    const interval = setInterval(fetchCounters, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [state.index]);

  // Shifting animation when active tab changes
  useEffect(() => {
    const currentLayout = tabLayouts[state.index];
    const totalTabs = state.routes.length;
    const defaultTabWidth = dockWidth / totalTabs;
    const targetX = currentLayout ? currentLayout.x : state.index * defaultTabWidth;
    const targetWidth = currentLayout ? currentLayout.width : defaultTabWidth;

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
        {/* Shifting Bubble Indicator in Heritage Emerald */}
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

        {/* Tab Items */}
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const config = TAB_CONFIGS[route.name] || {
            name: route.name,
            label: route.name,
            activeIcon: "ellipse",
            inactiveIcon: "ellipse-outline",
          };

          const showRequestBadge =
            route.name === "Requests" && pendingRequestsCount > 0 && !isFocused;
          const showActivePulse =
            route.name === "Jobs" && hasActiveJob && !isFocused;

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

                  {/* Burnished Amber Gold Badge for new customer leads */}
                  {showRequestBadge && (
                    <View style={styles.badgePill}>
                      <Text style={styles.badgeText}>
                        {pendingRequestsCount > 9 ? "9+" : pendingRequestsCount}
                      </Text>
                    </View>
                  )}

                  {/* Live Champagne Gold dot for in-progress job */}
                  {showActivePulse && <View style={styles.pulseDot} />}
                </View>

                {/* Animated active label */}
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
    borderColor: "rgba(226, 232, 240, 0.95)",
    position: "relative",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: Colors.navy,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.14,
        shadowRadius: 18,
      },
      android: {
        elevation: 12,
      },
      web: {
        boxShadow: "0 10px 30px rgba(43, 11, 23, 0.14), 0 2px 6px rgba(0,0,0,0.04)",
      } as any,
    }),
  },
  shiftingBubbleIndicator: {
    position: "absolute",
    top: 6,
    bottom: 6,
    height: 52,
    backgroundColor: Colors.primary, // #831843 Rich Burgundy
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
        boxShadow: "0 4px 14px rgba(131, 24, 67, 0.4)",
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
    backgroundColor: "rgba(255, 255, 255, 0.15)",
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
    backgroundColor: Colors.secondary, // #D97706 Burnished Amber Gold
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
    backgroundColor: Colors.accent, // Warm Champagne Gold
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
});
