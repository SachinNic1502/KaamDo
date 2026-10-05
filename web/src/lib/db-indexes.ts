import { connectDB } from "@/lib/db";
import {
  User,
  WorkerProfile,
  Job,
  Payment,
  Attendance,
  Dispute,
  Project,
  Message,
} from "@/lib/models";
import { logger } from "@/lib/logger";

export async function ensureDatabaseIndexes() {
  try {
    await connectDB();
    logger.info("Initializing database compound indexes...");

    await Promise.all([
      // Job Indexes
      Job.collection.createIndex({ customerId: 1, status: 1, createdAt: -1 }),
      Job.collection.createIndex({ workerId: 1, status: 1, createdAt: -1 }),
      Job.collection.createIndex({ "address.city": 1, status: 1 }),
      Job.collection.createIndex({ jobNumber: 1 }, { unique: true }),

      // WorkerProfile Indexes
      WorkerProfile.collection.createIndex({ status: 1, isOnline: 1, serviceAreas: 1 }),
      WorkerProfile.collection.createIndex({ rating: -1, totalJobs: -1 }),
      WorkerProfile.collection.createIndex({ userId: 1 }, { unique: true }),

      // User Indexes
      User.collection.createIndex({ phone: 1 }, { unique: true }),
      User.collection.createIndex({ role: 1, isActive: 1 }),

      // Payment Indexes
      Payment.collection.createIndex({ jobId: 1, status: 1 }),
      Payment.collection.createIndex({ orderId: 1 }),
      Payment.collection.createIndex({ transactionId: 1 }),

      // Attendance Indexes
      Attendance.collection.createIndex({ workerId: 1, date: -1 }),
      Attendance.collection.createIndex({ jobId: 1 }),

      // Message Indexes
      Message.collection.createIndex({ jobId: 1, createdAt: 1 }),
      Message.collection.createIndex({ receiverId: 1, isRead: 1 }),

      // Project Indexes
      Project.collection.createIndex({ customerId: 1, status: 1 }),
      Project.collection.createIndex({ contractorId: 1, status: 1 }),

      // Dispute Indexes
      Dispute.collection.createIndex({ status: 1, createdAt: -1 }),
    ]);

    logger.info("Database compound indexes ensured successfully.");
    return { success: true };
  } catch (err) {
    logger.error("Failed to ensure database indexes", err);
    return { success: false, error: err };
  }
}
