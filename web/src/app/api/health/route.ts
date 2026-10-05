import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";

export async function GET() {
  const startTime = Date.now();
  let dbStatus = "disconnected";
  let pingMs = -1;

  try {
    await connectDB();
    const readyState = mongoose.connection.readyState;
    if (readyState === 1 && mongoose.connection.db) {
      const pingStart = Date.now();
      await mongoose.connection.db.admin().ping();
      pingMs = Date.now() - pingStart;
      dbStatus = "connected";
    } else if (readyState === 2) {
      dbStatus = "connecting";
    }
  } catch {
    dbStatus = "unreachable";
  }

  const memory = process.memoryUsage();
  const isHealthy = dbStatus === "connected";

  const payload = {
    status: isHealthy ? "healthy" : "degraded",
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
    responseTimeMs: Date.now() - startTime,
    checks: {
      database: {
        status: dbStatus,
        readyState: mongoose.connection.readyState,
        pingMs,
      },
      memory: {
        rssMb: Math.round((memory.rss / (1024 * 1024)) * 10) / 10,
        heapTotalMb: Math.round((memory.heapTotal / (1024 * 1024)) * 10) / 10,
        heapUsedMb: Math.round((memory.heapUsed / (1024 * 1024)) * 10) / 10,
      },
    },
  };

  return NextResponse.json(payload, {
    status: isHealthy ? 200 : 503,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
