"use server";

import ChatHistory, { IMessage } from "@/lib/database/models/chatHistory.model";
import { connectToDatabase } from "@/lib/database/mongoose";

/**
 * Saves a new message to the chat history
 */
export async function saveChatMessage(
  userId: string,
  videoId: string,
  courseId: string,
  message: { role: "user" | "assistant"; content: string }
) {
  try {
    await connectToDatabase();

    if (!userId) throw new Error("Unauthorized");

    // Find or create a chat history document for this user-video combination
    let chatHistory = await ChatHistory.findOne({ userId, videoId });

    if (chatHistory) {
      // Add the new message to the existing history
      chatHistory.messages.push({
        role: message.role,
        content: message.content,
        timestamp: new Date(),
      });
      chatHistory.updatedAt = new Date();
      await chatHistory.save();
    } else {
      // Create a new chat history document
      chatHistory = new ChatHistory({
        userId,
        videoId,
        courseId,
        messages: [
          {
            role: message.role,
            content: message.content,
            timestamp: new Date(),
          },
        ],
      });
      await chatHistory.save();
    }

    return { success: true };
  } catch (error) {
    console.error("Error saving chat message:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Saves a complete conversation to the chat history
 */
export async function saveConversation(
  userId: string,
  videoId: string,
  courseId: string,
  messages: IMessage[]
) {
  try {
    await connectToDatabase();

    if (!userId) throw new Error("Unauthorized");

    // Find or create a chat history document for this user-video combination
    let chatHistory = await ChatHistory.findOne({ userId, videoId });

    if (chatHistory) {
      // Replace existing messages with the new conversation
      chatHistory.messages = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp || new Date(),
      }));
      chatHistory.updatedAt = new Date();
      await chatHistory.save();
    } else {
      // Create a new chat history document
      chatHistory = new ChatHistory({
        userId,
        videoId,
        courseId,
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp || new Date(),
        })),
      });
      await chatHistory.save();
    }

    return { success: true };
  } catch (error) {
    console.error("Error saving conversation:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Gets the chat history for a user-video combination
 */
export async function getChatHistory(userId: string, videoId: string) {
  try {
    await connectToDatabase();

    if (!userId) throw new Error("Unauthorized");

    const chatHistory = await ChatHistory.findOne({ userId, videoId });

    return chatHistory ? JSON.stringify(chatHistory.messages) : "[]";
  } catch (error) {
    console.error("Error getting chat history:", error);
    return "[]";
  }
}

/**
 * Gets all chat histories for a user
 */
export async function getUserChatHistories(userId: string) {
  try {
    await connectToDatabase();

    if (!userId) throw new Error("Unauthorized");

    const chatHistories = await ChatHistory.find({ userId }).sort({
      updatedAt: -1,
    });

    return JSON.stringify(chatHistories);
  } catch (error) {
    console.error("Error getting user chat histories:", error);
    throw error;
  }
}

/**
 * Clears the chat history for a user-video combination
 */
export async function clearChatHistory(userId: string, videoId: string) {
  try {
    await connectToDatabase();

    if (!userId) throw new Error("Unauthorized");

    await ChatHistory.findOneAndUpdate({ userId, videoId }, { messages: [] });

    return { success: true };
  } catch (error) {
    console.error("Error clearing chat history:", error);
    return { success: false, error: (error as Error).message };
  }
}
