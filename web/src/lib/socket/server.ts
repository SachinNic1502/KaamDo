import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import { randomUUID } from "node:crypto";
import { authenticateToken, AuthUser } from "../auth-session";
import Job from "../models/job.model";

// Rooms are routing hints only. Every delivery rechecks the current account and job.
export class SocketServer {
  private io: SocketIOServer;
  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: { origin: process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:3000"], credentials: true },
      maxHttpBufferSize: 16_384,
    });
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || /^Bearer ([^\s]+)$/i.exec(socket.handshake.headers.authorization || "")?.[1];
        const user = typeof token === "string" ? await authenticateToken(token) : null;
        if (!user) return next(new Error("Unauthorized"));
        socket.data.token = token;
        socket.data.user = user;
        next();
      } catch { next(new Error("Unauthorized")); }
    });
    this.io.on("connection", socket => {
      let windowStart = Date.now(), count = 0;
      const safe = (handler: (data: unknown) => Promise<void>) => (data: unknown) => {
        if (Date.now() - windowStart >= 60000) { windowStart = Date.now(); count = 0; }
        if (++count > 120) { socket.emit("error", { message: "Too many requests" }); return; }
        void handler(data).catch(() => socket.emit("error", { message: "Request denied" }));
      };
      for (const event of ["join-job", "join_job", "join_chat"]) socket.on(event, safe(async data => {
        const id = this.jobId(data);
        await this.authorize(socket, id);
        if (socket.rooms.size >= 21 && !socket.rooms.has(`job:${id}`)) throw new Error("Room limit");
        await socket.join(`job:${id}`);
      }));
      for (const event of ["leave-job", "leave_job", "leave_chat"]) socket.on(event, safe(async data => {
        await socket.leave(`job:${this.jobId(data)}`);
      }));
      for (const event of ["send-message", "send_message"]) socket.on(event, safe(async data => {
        if (!data || typeof data !== "object") throw new Error("Invalid message");
        const input = data as Record<string, unknown>;
        const id = this.jobId(input);
        if (input.chatId && input.chatId !== id) throw new Error("Invalid chat");
        const text = input.text ?? input.message;
        if (typeof text !== "string" || !text.trim() || text.length > 4000) throw new Error("Invalid message");
        const { user, job } = await this.authorize(socket, id);
        const receiverId = String(job.customerId) === user.userId ? String(job.workerId || "") : String(job.customerId);
        const message = { _id: randomUUID(), jobId: id, senderId: user.userId, receiverId, text: text.trim(), createdAt: new Date().toISOString(), read: false };
        await this.deliverJob(id, "new-message", message);
      }));
      socket.on("typing", safe(async data => {
        const id = this.jobId(data);
        const { user } = await this.authorize(socket, id);
        await this.deliverJob(id, "user-typing", { jobId: id, userId: user.userId, isTyping: (data as Record<string, unknown>).isTyping === true }, socket.id);
      }));
    });
  }
  private jobId(data: unknown): string {
    const id = typeof data === "string" ? data : data && typeof data === "object" ? (data as Record<string, unknown>).jobId ?? (data as Record<string, unknown>).chatId : null;
    if (typeof id !== "string" || !/^[a-f\d]{24}$/i.test(id)) throw new Error("Invalid job");
    return id;
  }
  private async currentUser(socket: Socket): Promise<AuthUser> {
    const user = await authenticateToken(socket.data.token);
    if (!user) { socket.disconnect(true); throw new Error("Unauthorized"); }
    socket.data.user = user;
    return user;
  }
  private async authorize(socket: Socket, jobId: string) {
    const user = await this.currentUser(socket);
    const job = await Job.findOne({ _id: jobId, $or: [{ customerId: user.userId }, { workerId: user.userId }] }).select("customerId workerId").lean();
    if (!job || !["customer", "worker"].includes(user.role)) {
      await socket.leave(`job:${jobId}`);
      throw new Error("Forbidden");
    }
    return { user, job };
  }
  private async deliverJob(jobId: string, event: string, payload: unknown, except?: string) {
    for (const socket of this.io.sockets.sockets.values()) {
      if (socket.id === except || !socket.rooms.has(`job:${jobId}`)) continue;
      try { await this.authorize(socket, jobId); socket.emit(event, payload); } catch { /* Revoked recipients receive nothing. */ }
    }
  }
  public async sendNotificationToUser(userId: string, notification: unknown) {
    for (const socket of this.io.sockets.sockets.values()) {
      try { if ((await this.currentUser(socket)).userId === userId) socket.emit("notification", notification); } catch { /* disconnected */ }
    }
  }
  public async sendNotificationToRole(role: string, notification: unknown) {
    for (const socket of this.io.sockets.sockets.values()) {
      try { if ((await this.currentUser(socket)).role === role) socket.emit("notification", notification); } catch { /* disconnected */ }
    }
  }
  public async broadcastJobUpdate(jobId: string, update: Record<string, unknown>) {
    await this.deliverJob(jobId, "job-status-update", { ...update, jobId });
  }
  public async sendToChat(jobId: string, message: unknown) { await this.deliverJob(jobId, "new-message", message); }
  public isUserOnline(userId: string) { return [...this.io.sockets.sockets.values()].some(s => s.data.user?.userId === userId); }
  public getConnectedUsersCount() { return new Set([...this.io.sockets.sockets.values()].map(s => s.data.user?.userId)).size; }
  public getOnlineUsersByRole(role: string): string[] { return [...new Set<string>([...this.io.sockets.sockets.values()].filter(s => s.data.user?.role === role).map(s => s.data.user.userId))]; }
  public getIO() { return this.io; }
}
let instance: SocketServer | null = null;
export function initializeSocketServer(server: HTTPServer) { return instance ??= new SocketServer(server); }
export function getSocketServer() { return instance; }
