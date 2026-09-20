import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Payment, Job, User, Commission, Payout } from "@/lib/models";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth-middleware";
import { paginationSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const authUser = await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams);
    const { page, limit, search, status } = paginationSchema.parse(query);

    const filter: Record<string, unknown> = {};

    if (authUser.role === "customer") {
      const user = await User.findOne({ phone: authUser.phone });
      if (user) filter.customerId = user._id;
    } else if (authUser.role === "worker") {
      const user = await User.findOne({ phone: authUser.phone });
      if (user) filter.workerId = user._id;
    }

    if (search) {
      filter.$or = [
        { transactionId: { $regex: search, $options: "i" } },
      ];
    }
    if (status) filter.status = status;

    const total = await Payment.countDocuments(filter);
    const payments = await Payment.find(filter)
      .populate("jobId", "jobNumber")
      .populate("customerId", "name phone")
      .populate("workerId", "name phone")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return paginatedResponse(payments, total, page, limit);
  } catch (error) {
    console.error("Get payments error:", error);
    return errorResponse("Internal server error", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const authUser = await requireAuth(request);

    const body = await request.json();
    const { jobId, paymentMethod } = body;

    if (!jobId) return errorResponse("jobId is required");

    const job = await Job.findById(jobId);
    if (!job) return errorResponse("Job not found", 404);
    if (job.status !== "completed") return errorResponse("Job not completed", 400);

    const existingPayment = await Payment.findOne({ jobId, status: "completed" });
    if (existingPayment) return errorResponse("Payment already made", 409);

    const totalAmount = job.finalPrice || job.estimatedPrice || 0;
    const additionalAmount = job.additionalCharges
      .filter((c: { status: string }) => c.status === "approved")
      .reduce((sum: number, c: { amount: number }) => sum + c.amount, 0);
    const materialAmount = job.materials.reduce(
      (sum: number, m: { totalPrice: number }) => sum + m.totalPrice,
      0
    );

    const finalAmount = totalAmount + additionalAmount + materialAmount;

    const commissionRule = await Commission.findOne({
      $or: [{ category: job.categoryId }, { category: "default" }],
      isActive: true,
    });

    let platformFee = 0;
    if (commissionRule) {
      if (commissionRule.type === "percentage") {
        platformFee = (finalAmount * commissionRule.value) / 100;
      } else {
        platformFee = commissionRule.value;
      }
    }

    const workerEarning = finalAmount - platformFee;

    const payment = await Payment.create({
      jobId,
      customerId: job.customerId,
      workerId: job.workerId,
      amount: finalAmount,
      platformFee,
      workerEarning,
      status: "completed",
      paymentMethod,
      transactionId: `TXN-${Date.now()}`,
    });

    job.status = "paid";
    await job.save();

    const payout = await Payout.create({
      workerId: job.workerId,
      amount: workerEarning,
      status: "eligible",
      bankDetails: {
        accountNumber: "Pending",
        ifsc: "Pending",
      },
    });

    return successResponse({ payment, payout }, "Payment processed", 201);
  } catch (error) {
    console.error("Create payment error:", error);
    return errorResponse("Internal server error", 500);
  }
}
