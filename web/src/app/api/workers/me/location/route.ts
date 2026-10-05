import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { WorkerProfile, User, Job } from "@/lib/models";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth-middleware";
import { handleApiError } from "@/lib/api-error";
import { RealtimeService } from "@/lib/services/realtime";
import { z } from "zod";

const locationUpdateSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  serviceRadiusKm: z.number().min(1).max(100).optional().default(15),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
});

// GET /api/workers/me/location - Get current worker's location & service radius
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const authUser = await requireAuth(request);

    if (authUser.role !== "worker" && authUser.role !== "admin") {
      return errorResponse("Only workers can access location profile", 403);
    }

    const profile = await WorkerProfile.findOne({ userId: authUser.userId })
      .select("location serviceRadiusKm isOnline status")
      .populate("userId", "name phone avatar");

    if (!profile) {
      return errorResponse("Worker profile not found", 404);
    }

    const coords = profile.location?.coordinates || [77.5946, 12.9716];
    const longitude = coords[0];
    const latitude = coords[1];

    return successResponse({
      latitude,
      longitude,
      serviceRadiusKm: profile.serviceRadiusKm || 15,
      address: profile.location?.address || "Current GPS Location",
      city: profile.location?.city || "Bengaluru",
      state: profile.location?.state || "Karnataka",
      pincode: profile.location?.pincode || "",
      lastUpdated: profile.location?.lastUpdated || profile.updatedAt,
      isOnline: profile.isOnline,
      status: profile.status,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/workers/me/location - Update live GPS coordinates & service radius
export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    const authUser = await requireAuth(request);

    if (authUser.role !== "worker" && authUser.role !== "admin") {
      return errorResponse("Only workers can update location & service radius", 403);
    }

    const body = await request.json();
    const validated = locationUpdateSchema.parse(body);

    const profile = await WorkerProfile.findOne({ userId: authUser.userId });
    if (!profile) {
      return errorResponse("Worker profile not found", 404);
    }

    // Update GeoJSON coordinates [longitude, latitude]
    profile.location = {
      type: "Point",
      coordinates: [validated.longitude, validated.latitude],
      address: validated.address || profile.location?.address,
      city: validated.city || profile.location?.city,
      state: validated.state || profile.location?.state,
      pincode: validated.pincode || profile.location?.pincode,
      lastUpdated: new Date(),
    };

    if (validated.serviceRadiusKm !== undefined) {
      profile.serviceRadiusKm = validated.serviceRadiusKm;
    }

    await profile.save();

    // Broadcast live location to any active en-route jobs
    try {
      const activeJobs = await Job.find({
        workerId: authUser.userId,
        status: { $in: ["worker_accepted", "on_the_way"] },
      }).select("_id customerId").lean();

      for (const job of activeJobs) {
        await RealtimeService.broadcastJobUpdate({
          jobId: job._id.toString(),
          status: "location_update",
          customerId: job.customerId.toString(),
          workerId: authUser.userId,
          updateData: {
            latitude: validated.latitude,
            longitude: validated.longitude,
            timestamp: new Date().toISOString(),
          },
        });
      }
    } catch (e) {
      console.warn("Could not broadcast worker location to active jobs:", e);
    }

    return successResponse({
      latitude: validated.latitude,
      longitude: validated.longitude,
      serviceRadiusKm: profile.serviceRadiusKm,
      address: profile.location.address,
      city: profile.location.city,
      state: profile.location.state,
      pincode: profile.location.pincode,
      lastUpdated: profile.location.lastUpdated,
      message: `Location updated. Service broadcast radius set to ${profile.serviceRadiusKm} km.`,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
