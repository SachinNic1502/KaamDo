import mongoose from "mongoose";

/**
 * Transaction Service
 * Provides transaction support for complex operations that require atomicity
 */

export class TransactionService {
  /**
   * Execute a function within a database transaction
   * @param fn - Function to execute within transaction
   * @returns Result of the function
   */
  static async withTransaction<T>(
    fn: (session: mongoose.ClientSession) => Promise<T>
  ): Promise<T> {
    const session = await mongoose.startSession();
    
    try {
      session.startTransaction();
      
      const result = await fn(session);
      
      await session.commitTransaction();
      
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Execute payment transaction
   * Ensures atomicity of payment processing, job status update, and payout creation
   */
  static async processPaymentTransaction(params: {
    jobId: string;
    customerId: string;
    workerId: string;
    finalAmount: number;
    platformFee: number;
    workerEarning: number;
    paymentMethod: string;
    transactionId: string;
  }) {
    return this.withTransaction(async (session) => {
      const { Job, Payment, Payout, User } = await import("../models");

      // Update job status to paid
      const job = await Job.findByIdAndUpdate(
        params.jobId,
        { status: "paid", finalPrice: params.finalAmount },
        { session, new: true }
      );

      if (!job) {
        throw new Error("Job not found");
      }

      // Create payment record
      const payment = await Payment.create(
        [
          {
            jobId: params.jobId,
            customerId: params.customerId,
            workerId: params.workerId,
            amount: params.finalAmount,
            platformFee: params.platformFee,
            workerEarning: params.workerEarning,
            status: "completed",
            paymentMethod: params.paymentMethod,
            transactionId: params.transactionId,
          },
        ],
        { session }
      );

      // Create payout record
      const payout = await Payout.create(
        [
          {
            workerId: params.workerId,
            amount: params.workerEarning,
            status: "eligible",
            bankDetails: {
              accountNumber: "Pending",
              ifsc: "Pending",
            },
          },
        ],
        { session }
      );

      // Update worker total earnings
      await User.findByIdAndUpdate(
        params.workerId,
        { $inc: { totalEarnings: params.workerEarning } },
        { session }
      );

      return { job, payment: payment[0], payout: payout[0] };
    });
  }

  /**
   * Execute refund transaction
   * Ensures atomicity of refund processing and status updates
   */
  static async processRefundTransaction(params: {
    paymentId: string;
    refundAmount: number;
    refundReason: string;
  }) {
    return this.withTransaction(async (session) => {
      const { Payment, Job, Payout } = await import("../models");

      // Find payment
      const payment = await Payment.findById(params.paymentId).session(session);
      if (!payment) {
        throw new Error("Payment not found");
      }

      // Update payment status
      payment.status = "refunded";
      payment.refundAmount = params.refundAmount;
      payment.refundReason = params.refundReason;
      await payment.save({ session });

      // Update job status
      await Job.findByIdAndUpdate(
        payment.jobId,
        { status: "refunded" },
        { session }
      );

      // Find and cancel associated payout
      const payout = await Payout.findOne({
        jobId: payment.jobId,
        status: { $in: ["eligible", "processing", "submitted"] },
      }).session(session);

      if (payout) {
        payout.status = "failed";
        payout.failureReason = "Payment refunded";
        await payout.save({ session });
      }

      return { payment, payout };
    });
  }

  /**
   * Execute job assignment transaction
   * Ensures atomicity of worker assignment and job status update
   */
  static async assignWorkerTransaction(params: {
    jobId: string;
    workerId: string;
  }) {
    return this.withTransaction(async (session) => {
      const { Job, WorkerProfile } = await import("../models");

      // Update job with worker assignment
      const job = await Job.findByIdAndUpdate(
        params.jobId,
        {
          workerId: params.workerId,
          status: "worker_assigned",
        },
        { session, new: true }
      );

      if (!job) {
        throw new Error("Job not found");
      }

      // Update worker stats
      await WorkerProfile.findOneAndUpdate(
        { userId: params.workerId },
        { $inc: { totalJobs: 1 } },
        { session }
      );

      return job;
    });
  }

  /**
   * Execute job completion transaction
   * Ensures atomicity of job completion, status update, and worker rating update
   */
  static async completeJobTransaction(params: {
    jobId: string;
    rating?: number;
    review?: string;
  }) {
    return this.withTransaction(async (session) => {
      const { Job, WorkerProfile } = await import("../models");

      // Update job status
      const job = await Job.findByIdAndUpdate(
        params.jobId,
        {
          status: "completed",
          rating: params.rating,
          review: params.review,
          endTime: new Date(),
        },
        { session, new: true }
      );

      if (!job) {
        throw new Error("Job not found");
      }

      // Update worker rating if provided
      if (params.rating && job.workerId) {
        const workerProfile = await WorkerProfile.findOne({
          userId: job.workerId,
        }).session(session);

        if (workerProfile) {
          // Calculate new average rating
          const totalRating = (workerProfile.rating * workerProfile.totalJobs) + params.rating;
          workerProfile.rating = totalRating / (workerProfile.totalJobs + 1);
          await workerProfile.save({ session });
        }
      }

      return job;
    });
  }

  /**
   * Execute dispute creation transaction
   * Ensures atomicity of dispute creation and job status update
   */
  static async createDisputeTransaction(params: {
    jobId: string;
    raisedBy: string;
    reason: string;
    description: string;
    images: string[];
  }) {
    return this.withTransaction(async (session) => {
      const { Job, Dispute } = await import("../models");

      // Update job status to disputed
      const job = await Job.findByIdAndUpdate(
        params.jobId,
        { status: "disputed" },
        { session, new: true }
      );

      if (!job) {
        throw new Error("Job not found");
      }

      // Create dispute
      const dispute = await Dispute.create(
        [
          {
            jobId: params.jobId,
            raisedBy: params.raisedBy,
            reason: params.reason,
            description: params.description,
            images: params.images,
            status: "raised",
          },
        ],
        { session }
      );

      return { job, dispute: dispute[0] };
    });
  }

  /**
   * Execute payout processing transaction
   * Ensures atomicity of payout status update and worker balance update
   */
  static async processPayoutTransaction(params: {
    payoutId: string;
    processedAt: Date;
  }) {
    return this.withTransaction(async (session) => {
      const { Payout, User } = await import("../models");

      // Update payout status
      const payout = await Payout.findByIdAndUpdate(
        params.payoutId,
        {
          status: "paid",
          processedAt: params.processedAt,
        },
        { session, new: true }
      );

      if (!payout) {
        throw new Error("Payout not found");
      }

      // Update worker balance
      await User.findByIdAndUpdate(
        payout.workerId,
        {
          $inc: { totalEarnings: -payout.amount },
        },
        { session }
      );

      return payout;
    });
  }

  /**
   * Execute attendance creation transaction
   * Ensures atomicity of attendance record creation and worker status update
   */
  static async createAttendanceTransaction(params: {
    jobId: string;
    workerId: string;
    customerId: string;
    date: Date;
    checkIn?: Date;
    checkOut?: Date;
    status: string;
  }) {
    return this.withTransaction(async (session) => {
      const { Attendance, Job } = await import("../models");

      // Create attendance record
      const attendance = await Attendance.create(
        [
          {
            jobId: params.jobId,
            workerId: params.workerId,
            customerId: params.customerId,
            date: params.date,
            checkIn: params.checkIn,
            checkOut: params.checkOut,
            status: params.status,
          },
        ],
        { session }
      );

      // Update job if check-in/out affects job status
      if (params.checkIn) {
        await Job.findByIdAndUpdate(
          params.jobId,
          { status: "work_started", startTime: params.checkIn },
          { session }
        );
      }

      if (params.checkOut) {
        await Job.findByIdAndUpdate(
          params.jobId,
          { endTime: params.checkOut },
          { session }
        );
      }

      return attendance[0];
    });
  }
}