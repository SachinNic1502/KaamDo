import mongoose, { Schema, Document } from "mongoose";

export interface IMessageDocument extends Document {
  chatId: string;
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  jobId?: mongoose.Types.ObjectId;
  message: string;
  messageType: "text" | "image" | "audio" | "video" | "file" | "location";
  mediaUrl?: string;
  read: boolean;
  readAt?: Date;
  timestamp: Date;
}

export interface IChatDocument extends Document {
  participants: mongoose.Types.ObjectId[];
  jobId?: mongoose.Types.ObjectId;
  lastMessage?: IMessageDocument;
  unreadCount: Map<string, number>;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessageDocument>(
  {
    chatId: { type: String, required: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    jobId: { type: Schema.Types.ObjectId, ref: "Job" },
    message: { type: String, required: true },
    messageType: {
      type: String,
      enum: ["text", "image", "audio", "video", "file", "location"],
      default: "text",
    },
    mediaUrl: String,
    read: { type: Boolean, default: false },
    readAt: Date,
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const ChatSchema = new Schema<IChatDocument>(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    jobId: { type: Schema.Types.ObjectId, ref: "Job" },
    lastMessage: MessageSchema,
    unreadCount: {
      type: Map,
      of: Number,
      default: new Map(),
    },
  },
  { timestamps: true }
);

// Indexes for efficient querying
MessageSchema.index({ chatId: 1, timestamp: -1 });
MessageSchema.index({ senderId: 1, timestamp: -1 });
MessageSchema.index({ receiverId: 1, read: 1, timestamp: -1 }); // For unread messages
MessageSchema.index({ jobId: 1, timestamp: -1 });

ChatSchema.index({ participants: 1 });
ChatSchema.index({ jobId: 1 });
ChatSchema.index({ "lastMessage.timestamp": -1 });
ChatSchema.index({ participants: 1, "lastMessage.timestamp": -1 }); // For user's chats

export const Message = mongoose.models.Message || 
  mongoose.model<IMessageDocument>("Message", MessageSchema);
export const Chat = mongoose.models.Chat || 
  mongoose.model<IChatDocument>("Chat", ChatSchema);