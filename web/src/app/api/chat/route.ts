import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Chat, User, Job } from "@/lib/models";
import { Message } from "@/lib/models/chat.model";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth-middleware";
import { paginationSchema } from "@/lib/validations";
import { objectIdSchema } from "@/lib/security-schemas";
import { getSocketServer } from "@/lib/socket/server";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const authUser = await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams);
    const { page, limit } = paginationSchema.parse(query);
    const jobId = query.jobId ? objectIdSchema.parse(query.jobId) : undefined;

    // Find chats where the user is a participant
    const filter: Record<string, unknown> = {
      participants: authUser.userId,
    };

    if (jobId) {
      filter.jobId = jobId;
    }

    const total = await Chat.countDocuments(filter);
    const chats = await Chat.find(filter)
      .populate("participants", "name phone avatar")
      .populate("jobId", "jobNumber status")
      .populate("lastMessage.senderId", "name phone avatar")
      .sort({ "lastMessage.timestamp": -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Calculate unread count for this user
    const chatsWithUnread = chats.map((chat: any) => {
      const unreadCount = chat.unreadCount?.get(authUser.userId.toString()) || 0;
      return {
        ...chat,
        unreadCount,
      };
    });

    return paginatedResponse(chatsWithUnread, total, page, limit);
  } catch (error) {
    console.error("Get chats error:", error);
    return errorResponse("Internal server error", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const authUser = await requireAuth(request);

    const body = await request.json();
    const { participantId, jobId } = body;

    if (!participantId) {
      return errorResponse("participantId is required", 400);
    }

    // Check if chat already exists between these participants
    const existingChat = await Chat.findOne({
      participants: { $all: [authUser.userId, participantId] },
      ...(jobId && { jobId }),
    });

    if (existingChat) {
      return successResponse(existingChat, "Chat already exists");
    }

    // Create new chat
    const chat = await Chat.create({
      participants: [authUser.userId, participantId],
      jobId: jobId || undefined,
      unreadCount: new Map([
        [authUser.userId.toString(), 0],
        [participantId.toString(), 0],
      ]),
    });

    // Populate the chat
    const populatedChat = await Chat.findById(chat._id)
      .populate("participants", "name phone avatar")
      .populate("jobId", "jobNumber status")
      .lean();

    return successResponse(populatedChat, "Chat created", 201);
  } catch (error) {
    console.error("Create chat error:", error);
    return errorResponse("Internal server error", 500);
  }
}