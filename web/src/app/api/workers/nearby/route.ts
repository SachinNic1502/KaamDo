import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { WorkerProfile, User } from "@/lib/models";
import { successResponse, errorResponse } from "@/lib/api-response";
import { handleApiError } from "@/lib/api-error";

// Haversine formula to compute distance in kilometers between two GPS coordinates
function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// GET /api/workers/nearby?lat=12.9716&lng=77.5946&radiusKm=15&skill=Electrician&onlineOnly=true
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);

    const latStr = searchParams.get("lat") || searchParams.get("latitude");
    const lngStr = searchParams.get("lng") || searchParams.get("longitude");
    const radiusStr = searchParams.get("radius") || searchParams.get("radiusKm") || "15";
    const skill = searchParams.get("skill");
    const onlineOnly = searchParams.get("onlineOnly") === "true";

    if (!latStr || !lngStr) {
      return errorResponse("Latitude and longitude query parameters are required", 400);
    }

    const targetLat = parseFloat(latStr);
    const targetLng = parseFloat(lngStr);
    const searchRadiusKm = Math.min(Math.max(parseFloat(radiusStr) || 15, 1), 100);

    const query: Record<string, any> = {
      status: "verified",
    };

    if (onlineOnly) {
      query.isOnline = true;
    }

    if (skill) {
      query.skills = { $in: [new RegExp(skill, "i")] };
    }

    const workers = await WorkerProfile.find(query)
      .select("userId skills experience hourlyRate dailyRate rating totalJobs isOnline location serviceRadiusKm")
      .populate("userId", "name phone avatar isActive")
      .lean();

    // Filter by radial distance and sort by closest
    const nearbyWorkers = workers
      .map((w: any) => {
        const coords = w.location?.coordinates || [77.5946, 12.9716];
        const wLng = coords[0];
        const wLat = coords[1];
        const distanceKm = calculateDistanceKm(targetLat, targetLng, wLat, wLng);
        const maxCoverageRadius = w.serviceRadiusKm || 15;

        // Estimated transit time at ~25 km/h urban speed + 5 min buffer
        const etaMinutes = Math.max(5, Math.round((distanceKm / 25) * 60) + 5);

        return {
          _id: w._id,
          user: w.userId,
          skills: w.skills,
          experience: w.experience,
          hourlyRate: w.hourlyRate,
          dailyRate: w.dailyRate,
          rating: w.rating,
          totalJobs: w.totalJobs,
          isOnline: w.isOnline,
          location: {
            latitude: wLat,
            longitude: wLng,
            address: w.location?.address || "",
            city: w.location?.city || "",
          },
          serviceRadiusKm: maxCoverageRadius,
          distanceKm,
          etaMinutes,
          isWithinCoverage: distanceKm <= maxCoverageRadius,
        };
      })
      .filter((w) => w.distanceKm <= searchRadiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    return successResponse({
      count: nearbyWorkers.length,
      searchCenter: { latitude: targetLat, longitude: targetLng },
      searchRadiusKm,
      workers: nearbyWorkers,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
