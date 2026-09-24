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
    const chatId = query.chatId ? objectIdSchema.parse(query.chatId) : undefined;
    const unreadOnly = query.unreadOnly === "true" || query.unreadOnly === "1";

    if (!chatId) {
      return errorResponse("chatId is required", 400);
    }

    // Verify user is part of the chat
    const chat = await Chat.findOne({
      _id: chatId,
      participants: authUser.userId,
    });

    if (!chat) {
      return errorResponse("Chat not found or access denied", 404);
    }

    const filter: Record<string, unknown> = {
      chatId,
    };

    if (unreadOnly) {
      filter.receiverId = authUser.userId;
      filter.read = false;
    }

    const total = await Message.countDocuments(filter);
    const messages = await Message.find(filter)
      .populate("senderId", "name phone avatar")
      .populate("receiverId", "name phone avatar")
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Reverse to get chronological order
    const chronologicalMessages = messages.reverse();

    return paginatedResponse(chronologicalMessages, total, page, limit);
  } catch (error) {
    console.error("Get messages error:", error);
    return errorResponse("Internal server error", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const authUser = await requireAuth(request);

    const body = await request.json();
    const { chatId, message, messageType = "text", mediaUrl } = body;

    if (!chatId || !message) {
      return errorResponse("chatId and message are required", 400);
    }

    // Verify user is part of the chat
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.includes(authUser.userId)) {
      return errorResponse("Chat not found or access denied", 404);
    }

    // Determine receiver (the other participant)
    const receiverId = chat.participants.find(
      (id: string) => id.toString() !== authUser.userId.toString()
    );

    if (!receiverId) {
      return errorResponse("Invalid chat participants", 400);
    }

    // Create message
    const newMessage = await Message.create({
      chatId,
      senderId: authUser.userId,
      receiverId,
      jobId: chat.jobId,
      message,
      messageType,
      mediaUrl,
      read: false,
    });

    // Update chat's last message
    chat.lastMessage = newMessage;
    
    // Increment unread count for receiver
    const currentUnread = chat.unreadCount.get(receiverId.toString()) || 0;
    chat.unreadCount.set(receiverId.toString(), currentUnread + 1);
    
    await chat.save();

    // Populate message for response
    const populatedMessage = await Message.findById(newMessage._id)
      .populate("senderId", "name phone avatar")
      .populate("receiverId", "name phone avatar")
      .lean();

    // Send real-time notification via Socket.IO
    const socketServer = getSocketServer();
    if (socketServer) {
      socketServer.sendToChat(chatId, populatedMessage);
      socketServer.sendNotificationToUser(receiverId.toString(), {
        type: "new_message",
        chatId,
        message: populatedMessage,
        timestamp: new Date().toISOString(),
      });
    }

    return successResponse(populatedMessage, "Message sent", 201);
  } catch (error) {
    console.error("Send message error:", error);
    return errorResponse("Internal server error", 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    const authUser = await requireAuth(request);

    const body = await request.json();
    const { messageId, markAsRead } = body;

    if (!messageId) {
      return errorResponse("messageId is required", 400);
    }

    if (markAsRead) {
      // Mark message as read
      const message = await Message.findByIdAndUpdate(
        messageId,
        { read: true, readAt: new Date() },
        { new: true }
      );

      if (!message) {
        return errorResponse("Message not found", 404);
      }

      // Update chat unread count
      const chat = await Chat.findById(message.chatId);
      if (chat) {
        const currentUnread = chat.unreadCount.get(authUser.userId.toString()) || 0;
        if (currentUnread > 0) {
          chat.unreadCount.set(authUser.userId.toString(), currentUnread - 1);
          await chat.save();
        }
      }

      return successResponse(message, "Message marked as read");
    }

    return errorResponse("Invalid action", 400);
  } catch (error) {
    console.error("Update message error:", error);
    return errorResponse("Internal server error", 500);
  }
}