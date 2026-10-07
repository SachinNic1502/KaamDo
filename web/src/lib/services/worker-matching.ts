import mongoose from "mongoose";
import { WorkerProfile, User, Job, ServiceCategory } from "@/lib/models";
import { sendJobPushNotification } from "./push-notifications";
import { RealtimeService } from "./realtime";

export const MAX_CONCURRENT_ACTIVE_JOBS = 2;

export const MATCHING_TIERS = [
  { tier: 1, radiusKm: 5, label: "Immediate Vicinity (Priority)" },
  { tier: 2, radiusKm: 12, label: "Extended Neighborhood" },
  { tier: 3, radiusKm: 25, label: "Full Service Metro Area" },
];

export interface MatchedWorker {
  userId: string;
  workerProfileId: string;
  name: string;
  phone?: string;
  distanceKm: number;
  rating: number;
  totalJobs: number;
  experience: number;
  skills: string[];
  serviceRadiusKm: number;
}

export interface MatchFilterOptions {
  categoryId: string | mongoose.Types.ObjectId;
  subcategoryId?: string | mongoose.Types.ObjectId;
  categoryName: string;
  categorySlug?: string;
  subcategoryName?: string;
  subcategorySlug?: string;
  address: {
    address: string;
    city: string;
    state?: string;
    pincode: string;
    lat?: number;
    lng?: number;
  };
  scheduledDate: Date;
  scheduledTime?: string;
  excludeWorkerIds?: string[];
  targetTier?: number; // 1, 2, or 3
}

/**
 * Calculates Haversine distance between two sets of GPS coordinates in kilometers.
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

/**
 * Checks if a worker's declared skills match the job category or subcategory.
 */
export function checkSkillMatch(
  workerSkills: string[],
  categoryName: string,
  categorySlug?: string,
  subcategoryName?: string,
  subcategorySlug?: string
): boolean {
  if (!workerSkills || workerSkills.length === 0) return false;

  const searchTokens = [
    categoryName,
    categorySlug,
    subcategoryName,
    subcategorySlug,
  ]
    .filter(Boolean)
    .map((s) => s!.toLowerCase().trim());

  return workerSkills.some((skill) => {
    const s = skill.toLowerCase().trim();
    return searchTokens.some((token) => {
      if (s === token) return true;
      if (s.includes(token) || token.includes(s)) return true;
      // Handle common roots like Plumber <-> Plumbing, Electrician <-> Electrical
      const root1 = s.replace(/(ing|er|ian|ic|al)$/, "");
      const root2 = token.replace(/(ing|er|ian|ic|al)$/, "");
      return root1.length >= 4 && root1 === root2;
    });
  });
}

/**
 * Checks if worker's schedule window matches job date & time.
 */
export function checkAvailabilityMatch(
  availability: { days?: string[]; startTime?: string; endTime?: string } | undefined,
  scheduledDate: Date,
  scheduledTime?: string
): boolean {
  if (!availability) return true; // If worker hasn't set strict windows, default to available

  // 1. Day of week check
  if (availability.days && availability.days.length > 0) {
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const targetDay = daysOfWeek[new Date(scheduledDate).getDay()];
    const matchesDay = availability.days.some((d) => d.toLowerCase() === targetDay.toLowerCase());
    if (!matchesDay) return false;
  }

  // 2. Scheduled time window check (if both job and worker specified time)
  if (scheduledTime && availability.startTime && availability.endTime) {
    const cleanTime = (t: string) => {
      // Normalizes "09:00", "9:00 AM", "14:00" to minutes from midnight
      const match = t.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (!match) return 0;
      let h = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      const meridian = match[3]?.toUpperCase();
      if (meridian === "PM" && h < 12) h += 12;
      if (meridian === "AM" && h === 12) h = 0;
      return h * 60 + m;
    };

    const targetMinutes = cleanTime(scheduledTime);
    const startMinutes = cleanTime(availability.startTime);
    const endMinutes = cleanTime(availability.endTime);

    if (startMinutes < endMinutes) {
      if (targetMinutes < startMinutes || targetMinutes > endMinutes) return false;
    }
  }

  return true;
}

export const WorkerMatchingService = {
  /**
   * Finds matching workers using progressive multi-tier priority matching.
   * Flow: Check Category/Skill -> Check Service Area -> Check Distance -> Check Availability -> Check Verified/Active -> Check Capacity.
   */
  async findEligibleWorkers(options: MatchFilterOptions): Promise<{
    matchedWorkers: MatchedWorker[];
    tierUsed: number;
    radiusKmUsed: number;
  }> {
    const {
      categoryName,
      categorySlug,
      subcategoryName,
      subcategorySlug,
      address,
      scheduledDate,
      scheduledTime,
      excludeWorkerIds = [],
      targetTier,
    } = options;

    // 1. Fetch all online, verified, non-suspended worker profiles
    const rawWorkers = (await WorkerProfile.find({
      status: "verified",
      isOnline: true,
      $or: [{ "kyc.status": "verified" }, { "kyc.status": { $exists: false } }, { status: "verified" }],
    })
      .populate({
        path: "userId",
        select: "_id name phone isActive role",
        match: {
          isActive: true,
          role: "worker",
          _id: { $nin: excludeWorkerIds.map((id) => new mongoose.Types.ObjectId(id)) },
        },
      })
      .lean()) as any[];

    // Filter out workers whose User account is inactive or not populated
    const validWorkers: any[] = rawWorkers.filter((w: any) => w.userId && w.userId.isActive && w.userId.role === "worker");

    // 2. Fetch active job counts for capacity filtering
    const workerUserIds = validWorkers.map((w) => (w.userId as any)._id);
    const activeJobCounts = await Job.aggregate([
      {
        $match: {
          workerId: { $in: workerUserIds },
          status: { $in: ["worker_accepted", "on_the_way", "arrived", "work_started", "in_progress"] },
        },
      },
      {
        $group: {
          _id: "$workerId",
          count: { $sum: 1 },
        },
      },
    ]);

    const activeJobCountMap = new Map<string, number>();
    activeJobCounts.forEach((item) => {
      activeJobCountMap.set(item._id.toString(), item.count);
    });

    // 3. Filter workers passing all baseline requirements
    const eligiblePool: {
      worker: any;
      distanceKm: number;
    }[] = [];

    const jobLat = address.lat;
    const jobLng = address.lng;

    for (const worker of validWorkers) {
      const uId = (worker.userId as any)._id.toString();

      // Check Active Job Capacity Limit
      const currentActiveJobs = activeJobCountMap.get(uId) || 0;
      if (currentActiveJobs >= MAX_CONCURRENT_ACTIVE_JOBS) {
        continue; // Worker is at capacity
      }

      // Check Category & Skill Match
      const matchesSkill = checkSkillMatch(
        worker.skills || [],
        categoryName,
        categorySlug,
        subcategoryName,
        subcategorySlug
      );
      if (!matchesSkill) continue;

      // Check Worker Availability (Day & Time)
      const isAvailable = checkAvailabilityMatch(worker.availability, scheduledDate, scheduledTime);
      if (!isAvailable) continue;

      // Check Service Area & Distance
      let distanceKm = 3.0; // Default estimate if GPS unavailable
      let matchesServiceArea = false;

      // Check City / Pincode text match in worker's declared service areas
      const cityMatches = (worker.serviceAreas || []).some((area: string) => {
        const a = area.toLowerCase().trim();
        return (
          a === address.city.toLowerCase().trim() ||
          a === address.pincode.trim() ||
          address.city.toLowerCase().includes(a)
        );
      });

      const workerCoords = worker.location?.coordinates; // [lng, lat]
      if (
        jobLat !== undefined &&
        jobLng !== undefined &&
        workerCoords &&
        workerCoords.length >= 2 &&
        (workerCoords[0] !== 0 || workerCoords[1] !== 0)
      ) {
        distanceKm = calculateHaversineDistanceKm(jobLat, jobLng, workerCoords[1], workerCoords[0]);
        // Distance must not exceed worker's personal max service radius
        const maxRadius = worker.serviceRadiusKm || 15;
        if (distanceKm <= maxRadius) {
          matchesServiceArea = true;
        }
      } else {
        // Fallback to City or Pincode match
        matchesServiceArea =
          cityMatches ||
          (worker.location?.city && worker.location.city.toLowerCase() === address.city.toLowerCase()) ||
          (worker.location?.pincode && worker.location.pincode === address.pincode);
      }

      if (!matchesServiceArea) continue;

      eligiblePool.push({
        worker,
        distanceKm,
      });
    }

    // 4. Progressive Multi-Tier Distance Matching
    // Try Tier 1 -> Tier 2 -> Tier 3
    let matchedTier = 1;
    let radiusLimit = MATCHING_TIERS[0].radiusKm;
    let tierMatches: typeof eligiblePool = [];

    const tierToEvaluate = targetTier ? [MATCHING_TIERS[targetTier - 1] || MATCHING_TIERS[0]] : MATCHING_TIERS;

    for (const tierConfig of tierToEvaluate) {
      const candidates = eligiblePool.filter((item) => item.distanceKm <= tierConfig.radiusKm);
      if (candidates.length > 0) {
        tierMatches = candidates;
        matchedTier = tierConfig.tier;
        radiusLimit = tierConfig.radiusKm;
        break;
      }
    }

    // If even Tier 3 yielded no candidates within tight radius, use any remaining eligible workers within their own radius
    if (tierMatches.length === 0 && eligiblePool.length > 0 && !targetTier) {
      tierMatches = eligiblePool;
      matchedTier = 3;
      radiusLimit = MATCHING_TIERS[2].radiusKm;
    }

    // 5. Sort by Priority:
    // 1st: Distance (nearest first)
    // 2nd: Rating (highest first)
    // 3rd: Experience (highest first)
    tierMatches.sort((a, b) => {
      if (Math.abs(a.distanceKm - b.distanceKm) > 1.0) {
        return a.distanceKm - b.distanceKm;
      }
      if ((b.worker.rating || 0) !== (a.worker.rating || 0)) {
        return (b.worker.rating || 0) - (a.worker.rating || 0);
      }
      return (b.worker.experience || 0) - (a.worker.experience || 0);
    });

    const matchedWorkers: MatchedWorker[] = tierMatches.map(({ worker, distanceKm }) => ({
      userId: (worker.userId as any)._id.toString(),
      workerProfileId: worker._id.toString(),
      name: (worker.userId as any).name || "Verified Professional",
      phone: (worker.userId as any).phone,
      distanceKm,
      rating: worker.rating || 5.0,
      totalJobs: worker.totalJobs || 0,
      experience: worker.experience || 1,
      skills: worker.skills || [],
      serviceRadiusKm: worker.serviceRadiusKm || 15,
    }));

    return {
      matchedWorkers,
      tierUsed: matchedTier,
      radiusKmUsed: radiusLimit,
    };
  },

  /**
   * Fast verification check: Determines if a given worker is eligible to view, claim, or accept a specific job.
   */
  async isWorkerEligibleForJob(workerUserId: string, job: any): Promise<{ eligible: boolean; reason?: string }> {
    // 1. Verify User & Worker Profile status
    const user = await User.findById(workerUserId).select("isActive role");
    if (!user || !user.isActive || user.role !== "worker") {
      return { eligible: false, reason: "Worker account is inactive or not a provider" };
    }

    const profile = await WorkerProfile.findOne({ userId: workerUserId });
    if (!profile) {
      return { eligible: false, reason: "Worker profile not found" };
    }

    if (profile.status !== "verified") {
      return { eligible: false, reason: `Worker profile status is '${profile.status}' (Must be verified)` };
    }

    if (!profile.isOnline) {
      return { eligible: false, reason: "Worker is currently offline" };
    }

    // 2. Check if worker previously declined this job
    if (job.declinedWorkerIds && job.declinedWorkerIds.some((id: any) => id.toString() === workerUserId)) {
      return { eligible: false, reason: "Worker previously declined this job request" };
    }

    // 3. Check Active Job Capacity Limit
    const activeJobs = await Job.countDocuments({
      workerId: workerUserId,
      status: { $in: ["worker_accepted", "on_the_way", "arrived", "work_started", "in_progress"] },
    });
    if (activeJobs >= MAX_CONCURRENT_ACTIVE_JOBS) {
      return { eligible: false, reason: `Worker has reached active concurrent job limit (${MAX_CONCURRENT_ACTIVE_JOBS})` };
    }

    // 4. Check Skill & Category Match
    let category = job.categoryId;
    if (!category?.name) {
      category = await ServiceCategory.findById(job.categoryId).select("name slug subcategories");
    }

    if (category) {
      const subcategory = category.subcategories?.find(
        (sub: any) => sub._id?.toString() === job.subcategoryId?.toString()
      );

      const hasSkill = checkSkillMatch(
        profile.skills || [],
        category.name,
        category.slug,
        subcategory?.name,
        subcategory?.slug
      );

      if (!hasSkill) {
        return { eligible: false, reason: `Worker skills do not match category '${category.name}'` };
      }
    }

    // 5. Check Service Area & Distance Match
    if (job.address) {
      const jobLat = job.address.lat;
      const jobLng = job.address.lng;
      const workerCoords = profile.location?.coordinates;

      if (
        jobLat !== undefined &&
        jobLng !== undefined &&
        workerCoords &&
        workerCoords.length >= 2 &&
        (workerCoords[0] !== 0 || workerCoords[1] !== 0)
      ) {
        const distanceKm = calculateHaversineDistanceKm(jobLat, jobLng, workerCoords[1], workerCoords[0]);
        const allowedRadius = Math.max(profile.serviceRadiusKm || 15, job.broadcastRadiusKm || 15);
        if (distanceKm > allowedRadius) {
          return { eligible: false, reason: `Job location (${distanceKm} km) is outside worker coverage radius (${allowedRadius} km)` };
        }
      } else {
        const cityMatches =
          (profile.serviceAreas || []).some(
            (area: string) =>
              area.toLowerCase() === job.address.city?.toLowerCase() ||
              area === job.address.pincode
          ) ||
          profile.location?.city?.toLowerCase() === job.address.city?.toLowerCase() ||
          profile.location?.pincode === job.address.pincode;

        if (!cityMatches) {
          return { eligible: false, reason: `Job city '${job.address.city}' is outside worker service areas` };
        }
      }
    }

    return { eligible: true };
  },

  /**
   * Priority Notification Dispatcher:
   * Dispatches push and realtime notifications ONLY to the matched eligible workers.
   */
  async notifyMatchedWorkers(job: any, matchedWorkers: MatchedWorker[], categoryName: string): Promise<void> {
    if (!matchedWorkers || matchedWorkers.length === 0) return;

    for (const worker of matchedWorkers) {
      try {
        // Send In-App Realtime Notification
        await RealtimeService.sendUserNotification({
          userId: worker.userId,
          type: "targeted_job_lead",
          title: `New ${categoryName} Request Nearby! 🎯`,
          message: `Booking #${job.jobNumber} in ${job.address.city} (${worker.distanceKm} km away). Tap to review.`,
          data: {
            jobId: job._id.toString(),
            jobNumber: job.jobNumber,
            screen: "JobDetail",
            category: categoryName,
            distanceKm: worker.distanceKm,
            city: job.address.city,
            estimatedPrice: job.estimatedPrice,
          },
        });

        // Send Native Push Notification
        await sendJobPushNotification({
          event: "job_assigned",
          userId: worker.userId,
          jobId: job._id.toString(),
          jobNumber: job.jobNumber,
          serviceName: categoryName,
          amount: job.estimatedPrice,
        });
      } catch (err) {
        console.warn(`Failed to dispatch match notification to worker ${worker.userId}:`, err);
      }
    }
  },

  /**
   * Expands the search radius when a job remains unclaimed or is declined.
   * Advances Tier 1 (5km) -> Tier 2 (12km) -> Tier 3 (25km).
   */
  async expandJobSearchRadius(jobId: string): Promise<{ expanded: boolean; newCount: number; tier: number }> {
    const job = await Job.findById(jobId).populate("categoryId", "name slug subcategories");
    if (!job || job.status !== "searching") {
      return { expanded: false, newCount: 0, tier: 1 };
    }

    const currentTier = job.matchingTier || 1;
    if (currentTier >= 3) {
      return { expanded: false, newCount: 0, tier: currentTier }; // Already at max radius
    }

    const nextTier = currentTier + 1;
    const category = job.categoryId as any;

    const subcategory = category?.subcategories?.find(
      (s: any) => s._id?.toString() === job.subcategoryId?.toString()
    );

    const matchResult = await this.findEligibleWorkers({
      categoryId: job.categoryId._id || job.categoryId,
      subcategoryId: job.subcategoryId,
      categoryName: category?.name || "Service",
      categorySlug: category?.slug,
      subcategoryName: subcategory?.name,
      subcategorySlug: subcategory?.slug,
      address: job.address,
      scheduledDate: job.scheduledDate,
      scheduledTime: job.scheduledTime,
      excludeWorkerIds: (job.declinedWorkerIds || []).map((id: any) => id.toString()),
      targetTier: nextTier,
    });

    const newWorkerUserIds = matchResult.matchedWorkers.map((w) => new mongoose.Types.ObjectId(w.userId));

    // Combine previous targets with new targets
    const updatedTargetIds = Array.from(
      new Set([...(job.targetWorkerIds || []).map((id: any) => id.toString()), ...newWorkerUserIds.map((id) => id.toString())])
    ).map((id) => new mongoose.Types.ObjectId(id));

    job.targetWorkerIds = updatedTargetIds;
    job.matchingTier = nextTier;
    job.broadcastRadiusKm = matchResult.radiusKmUsed;
    await job.save();

    // Notify newly matched workers
    const newlyAddedWorkers = matchResult.matchedWorkers.filter(
      (w) => !(job.targetWorkerIds || []).some((id: any) => id.toString() === w.userId)
    );

    await this.notifyMatchedWorkers(job, newlyAddedWorkers, category?.name || "Service");

    return {
      expanded: true,
      newCount: newlyAddedWorkers.length,
      tier: nextTier,
    };
  },
};
