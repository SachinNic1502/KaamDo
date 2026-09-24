import * as Location from "expo-location";
import { api } from "../api/client";
import * as SecureStore from "expo-secure-store";

interface LocationCoords {
  lat: number;
  lng: number;
}

interface GeofenceZone {
  lat: number;
  lng: number;
  radiusKm: number;
}

export async function requestLocationPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === "granted";
}

export async function getCurrentLocation(): Promise<LocationCoords | null> {
  const hasPermission = await requestLocationPermission();
  if (!hasPermission) return null;

  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    return {
      lat: location.coords.latitude,
      lng: location.coords.longitude,
    };
  } catch (error) {
    console.warn("Failed to get location:", error);
    return null;
  }
}

export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function isWithinGeofence(
  current: LocationCoords,
  zone: GeofenceZone
): boolean {
  const distance = calculateDistance(current.lat, current.lng, zone.lat, zone.lng);
  return distance <= zone.radiusKm;
}

export async function checkIn(jobId: string): Promise<{ attendanceId: string; location: LocationCoords } | null> {
  const location = await getCurrentLocation();
  if (!location) throw new Error("Location access required for check-in");

  const token = await SecureStore.getItemAsync("token");
  if (!token) throw new Error("Not authenticated");

  const res = await api.post<{ data: { attendanceId: string } }>(
    "/api/attendance",
    {
      jobId,
      action: "check-in",
      checkInLocation: location,
      timestamp: new Date().toISOString(),
    },
    token
  );

  return {
    attendanceId: res.data?.attendanceId || "",
    location,
  };
}

export async function checkOut(attendanceId: string): Promise<LocationCoords | null> {
  const location = await getCurrentLocation();

  const token = await SecureStore.getItemAsync("token");
  if (!token) throw new Error("Not authenticated");

  await api.patch(
    "/api/attendance",
    {
      attendanceId,
      action: "check-out",
      checkOutLocation: location,
      timestamp: new Date().toISOString(),
    },
    token
  );

  return location;
}

const activeTracking = new Set<ReturnType<typeof setInterval>>();
export function stopAllLocationTracking() { for (const timer of activeTracking) clearInterval(timer); activeTracking.clear(); }
export async function startLocationTracking(
  jobId: string,
  intervalMs: number = 30000,
  onLocationUpdate?: (location: LocationCoords) => void
): Promise<ReturnType<typeof setInterval> | null> {
  const hasPermission = await requestLocationPermission();
  if (!hasPermission) return null;

  const interval = setInterval(async () => {
    const location = await getCurrentLocation();
    if (location) {
      onLocationUpdate?.(location);
      try {
        const token = await SecureStore.getItemAsync("token");
        if (token) {
          await api.post(
            "/api/attendance",
            {
              jobId,
              action: "location-update",
              location,
              timestamp: new Date().toISOString(),
            },
            token
          );
        }
      } catch (err) {
        console.warn("Failed to send location update:", err);
      }
    }
  }, intervalMs);

  activeTracking.add(interval);
  return interval;
}

export function stopLocationTracking(interval: ReturnType<typeof setInterval> | null) {
  if (interval) { clearInterval(interval); activeTracking.delete(interval); }
}
