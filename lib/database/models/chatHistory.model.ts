import { Schema, model, models, Document } from "mongoose";

// Interface for individual messages
export interface IMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// Define the message schema
const messageSchema = new Schema<IMessage>({
  role: {
    type: String,
    enum: ["user", "assistant"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Interface for the chat history document
export interface IChatHistory extends Document {
  userId: string;
  videoId: string;
  courseId: Schema.Types.ObjectId;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

// Define the chat history schema
const chatHistorySchema = new Schema<IChatHistory>({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  videoId: {
    type: String,
    required: true,
  },
  courseId: {
    type: Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  messages: [messageSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create a compound index for efficient querying
chatHistorySchema.index({ userId: 1, videoId: 1 });

const ChatHistory =
  models.ChatHistory || model("ChatHistory", chatHistorySchema);

export default ChatHistory;
