import { io, Socket } from "socket.io-client";
import * as SecureStore from "expo-secure-store";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

let socket: Socket | null = null;

export interface ChatMessage {
  _id: string;
  jobId: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: string;
  read: boolean;
}

export interface TypingEvent {
  userId: string;
  jobId: string;
  isTyping: boolean;
}

export async function connectSocket(): Promise<Socket> {
  if (socket?.connected) return socket;

  const token = await SecureStore.getItemAsync("token");

  socket = io(API_BASE_URL, {
    auth: { token },
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    console.log("Socket connected:", socket?.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
  });

  socket.on("connect_error", (error) => {
    console.warn("Socket connection error:", error.message);
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getSocket(): Socket | null {
  return socket;
}

export function joinJobRoom(jobId: string) {
  socket?.emit("join-job", { jobId });
}

export function leaveJobRoom(jobId: string) {
  socket?.emit("leave-job", { jobId });
}

export function sendMessage(data: {
  jobId: string;
  receiverId: string;
  text: string;
}) {
  socket?.emit("send-message", data);
}

export function onNewMessage(callback: (message: ChatMessage) => void) {
  socket?.on("new-message", callback);
  return () => {
    socket?.off("new-message", callback);
  };
}

export function emitTyping(data: TypingEvent) {
  socket?.emit("typing", data);
}

export function onTyping(callback: (data: TypingEvent) => void) {
  socket?.on("user-typing", callback);
  return () => {
    socket?.off("user-typing", callback);
  };
}

export function markAsRead(data: { jobId: string; messageIds: string[] }) {
  socket?.emit("mark-read", data);
}

export function onMessagesRead(callback: (data: { messageIds: string[] }) => void) {
  socket?.on("messages-read", callback);
  return () => {
    socket?.off("messages-read", callback);
  };
}

export function onJobStatusUpdate(callback: (data: { jobId: string; status: string }) => void) {
  socket?.on("job-status-update", callback);
  return () => {
    socket?.off("job-status-update", callback);
  };
}
