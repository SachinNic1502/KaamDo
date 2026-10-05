import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Platform,
  StatusBar,
} from "react-native";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from "../../constants";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastOptions {
  id?: string;
  title: string;
  message?: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// Global imperative emitter
let globalShowToast: ((options: ToastOptions) => void) | null = null;

export const Toast = {
  show: (options: ToastOptions) => {
    if (globalShowToast) globalShowToast(options);
  },
  success: (title: string, message?: string) => {
    if (globalShowToast) globalShowToast({ title, message, type: "success" });
  },
  error: (title: string, message?: string) => {
    if (globalShowToast) globalShowToast({ title, message, type: "error" });
  },
  info: (title: string, message?: string) => {
    if (globalShowToast) globalShowToast({ title, message, type: "info" });
  },
  warning: (title: string, message?: string) => {
    if (globalShowToast) globalShowToast({ title, message, type: "warning" });
  },
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      showToast: Toast.show,
      success: Toast.success,
      error: Toast.error,
      info: Toast.info,
      warning: Toast.warning,
      hideToast: () => {},
    };
  }
  return context;
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const insetsContext = useContext(SafeAreaInsetsContext);
  const insets = insetsContext ?? {
    top: Platform.OS === "android" ? (StatusBar.currentHeight || 24) : 24,
    bottom: 0,
    left: 0,
    right: 0,
  };
  const [currentToast, setCurrentToast] = useState<ToastOptions | null>(null);

  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideToast = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -120,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentToast(null);
    });
  }, [opacity, translateY]);

  const showToast = useCallback(
    (options: ToastOptions) => {
      if (timerRef.current) clearTimeout(timerRef.current);

      setCurrentToast(options);

      translateY.setValue(-120);
      opacity.setValue(0);

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          friction: 8,
          tension: 70,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      const duration = options.duration ?? 3500;
      timerRef.current = setTimeout(() => {
        hideToast();
      }, duration);
    },
    [hideToast, opacity, translateY]
  );

  useEffect(() => {
    globalShowToast = showToast;
    return () => {
      globalShowToast = null;
    };
  }, [showToast]);

  const success = useCallback(
    (title: string, message?: string) => showToast({ title, message, type: "success" }),
    [showToast]
  );

  const error = useCallback(
    (title: string, message?: string) => showToast({ title, message, type: "error" }),
    [showToast]
  );

  const info = useCallback(
    (title: string, message?: string) => showToast({ title, message, type: "info" }),
    [showToast]
  );

  const warning = useCallback(
    (title: string, message?: string) => showToast({ title, message, type: "warning" }),
    [showToast]
  );

  const type = currentToast?.type || "info";

  const getIcon = () => {
    switch (type) {
      case "success":
        return <Ionicons name="checkmark-circle" size={22} color={Colors.success} />;
      case "error":
        return <Ionicons name="alert-circle" size={22} color={Colors.error} />;
      case "warning":
        return <Ionicons name="warning" size={22} color={Colors.warning} />;
      case "info":
      default:
        return <Ionicons name="information-circle" size={22} color={Colors.primary} />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case "success":
        return "#A7F3D0";
      case "error":
        return "#FECDD3";
      case "warning":
        return "#FDE68A";
      case "info":
      default:
        return "#BFDBFE";
    }
  };

  const topOffset = Platform.OS === "android"
    ? (StatusBar.currentHeight || 24) + Spacing.xs
    : insets.top + Spacing.xs;

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning, hideToast }}>
      {children}
      {currentToast && (
        <Animated.View
          style={[
            styles.container,
            {
              top: topOffset,
              transform: [{ translateY }],
              opacity,
            },
          ]}
          pointerEvents="box-none"
        >
          <TouchableOpacity
            activeOpacity={0.92}
            onPress={hideToast}
            style={[styles.toastCard, { borderColor: getBorderColor() }]}
          >
            <View style={styles.iconWrap}>{getIcon()}</View>
            <View style={styles.textWrap}>
              <Text style={styles.title} numberOfLines={1}>
                {currentToast.title}
              </Text>
              {currentToast.message ? (
                <Text style={styles.message} numberOfLines={2}>
                  {currentToast.message}
                </Text>
              ) : null}
            </View>
            <TouchableOpacity onPress={hideToast} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={styles.closeBtn}>
              <Ionicons name="close" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          </TouchableOpacity>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: Spacing.base,
    right: Spacing.base,
    zIndex: 99999,
    alignItems: "center",
  },
  toastCard: {
    width: "100%",
    maxWidth: 480,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    ...Shadows.md,
    elevation: 8,
  },
  iconWrap: {
    marginRight: Spacing.sm + 2,
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: {
    flex: 1,
    paddingRight: Spacing.xs,
  },
  title: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  message: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  closeBtn: {
    padding: Spacing.xs,
    marginLeft: Spacing.xs,
  },
});
