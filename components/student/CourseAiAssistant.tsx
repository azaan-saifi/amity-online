"use client";

import { useChat } from "@ai-sdk/react";
import { useRef, useEffect, useCallback, useState } from "react";
import { FaArrowUpLong } from "react-icons/fa6";
import { v4 } from "uuid";

import { getChatHistory } from "@/lib/actions/chatHistory.action";
import { updateVideoProgress } from "@/lib/actions/videoProgress.action";

import {
  AssistantMessage,
  ThinkingMessage,
  UserMessage,
} from "../LoadingMessage";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatHistoryMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface CourseAiAssistantProps {
  userId?: string;
  videoId?: string;
  currentTimestamp?: number;
  onSeekTo?: (seconds: number) => void; // Optional callback to control the video player
  courseId?: string;
}

const CourseAiAssistant = ({
  userId,
  videoId,
  currentTimestamp,
  onSeekTo,
  courseId,
}: CourseAiAssistantProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [chatHistory, setChatHistory] = useState<ChatHistoryMessage[]>([]);
  const chatId = `${userId}-${videoId}`;

  // Track previous videoId to detect changes
  const previousVideoIdRef = useRef<string | undefined>(videoId);

  // Initialize chat with history from the database
  useEffect(() => {
    // Check if videoId changed - this means we need to reset the chat
    const videoChanged = previousVideoIdRef.current !== videoId;
    previousVideoIdRef.current = videoId;

    if (videoChanged) {
      // Reset chat state when changing videos
      setChatHistory([]);
      console.log("Video changed, resetting chat history");
    }

    const loadChatHistory = async () => {
      if (userId && videoId) {
        setIsLoading(true);
        try {
          // Fetch chat history from the database
          const historyJson = await getChatHistory(userId, videoId);
          const history = JSON.parse(historyJson);

          if (history && history.length > 0) {
            setChatHistory(history);
            console.log(
              `Loaded ${history.length} messages for video ${videoId}`
            );
          } else {
            console.log(`No chat history found for video ${videoId}`);
          }
        } catch (error) {
          console.error("Error loading chat history:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    loadChatHistory();
  }, [userId, videoId]);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    setMessages,
    status,
  } = useChat({
    experimental_throttle: 120,
    maxSteps: 6,
    body: {
      userId,
      videoId,
      currentTimestamp,
      courseId,
    },
    id: chatId,
    initialMessages: [], // Start with empty messages, we'll set them after loading
  });

  // Add debug logging for messages
  useEffect(() => {
    console.log(
      `Current messages (${messages.length}) for video ${videoId}:`,
      messages.map((m) => ({ role: m.role, contentLength: m.content.length }))
    );
  }, [messages, videoId]);

  // Effect to set initial messages when chat history loads
  useEffect(() => {
    // Only set messages when chat history is loaded
    if (chatHistory.length > 0) {
      console.log("Setting initial messages from history:", chatHistory.length);

      // Map the history to the format expected by useChat
      const initialMessages = chatHistory.map((msg) => ({
        id: v4(),
        role: msg.role,
        content: msg.content,
      }));

      // Set the messages
      setMessages(initialMessages);
    } else if (videoId && !isLoading) {
      // If there's no chat history but we have a video ID and we're not loading,
      // make sure the chat is reset
      setMessages([]);
    }
  }, [chatHistory, setMessages, isLoading, videoId]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  console.log(messages);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle timestamp click
  const handleTimestampClick = useCallback(
    async (seconds: number, targetVideoId: string) => {
      console.log("Timestamp click:", targetVideoId, videoId, seconds);
      // If the clicked timestamp is from the current video
      if ((!targetVideoId || targetVideoId === videoId) && videoId && userId) {
        console.log(`Seeking to ${seconds} seconds`);

        // Call the onSeekTo callback if provided (to control the video player)
        if (onSeekTo) {
          onSeekTo(seconds);
        }

        // Update video progress in the database with the new position
        if (courseId) {
          try {
            // Calculate a percentage based on the estimated duration (adjust as needed)
            const estimatedDuration = 600; // 10 minutes in seconds
            const percent = Math.min(
              Math.round((seconds / estimatedDuration) * 100),
              100
            );

            await updateVideoProgress(
              videoId,
              courseId,
              percent,
              userId,
              seconds // Update the playback position to the clicked timestamp
            );

            console.log("Progress updated with new timestamp position");
          } catch (error) {
            console.error("Error updating progress with timestamp:", error);
          }
        }
      } else if (targetVideoId && targetVideoId !== videoId) {
        // If it's a timestamp from another video, we could potentially navigate to that video
        // This would require additional logic to handle navigation between videos
        console.log(`Timestamp is from a different video: ${targetVideoId}`);
        // Future enhancement: Navigate to the other video and seek to the timestamp
      }
    },
    [videoId, userId, courseId, onSeekTo]
  );

  return (
    <div className="flex h-[500px] flex-col rounded-lg bg-black/40">
      {/* Messages container */}
      <div className="custom-scrollbar flex flex-1 flex-col gap-4 overflow-y-auto">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <ThinkingMessage content="Loading chat history..." />
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div key={message.id} className="">
                {message.role === "user" ? (
                  <UserMessage
                    // picture={JSON.stringify(userData?.picture) || undefined}
                    content={message.content}
                  />
                ) : (
                  <AssistantMessage
                    content={message.content}
                    videoId={videoId}
                    toolInvocations={message.toolInvocations}
                    onTimestampClick={handleTimestampClick}
                  />
                )}
              </div>
            ))}
            {status === "submitted" &&
              messages.length > 0 &&
              messages[messages.length - 1].role === "user" && (
                <ThinkingMessage content="Thinking..." />
              )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-zinc-800 p-3">
        <div className="flex items-center">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Ask a question about this video..."
            className="flex-1 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-[#f0bb1c] focus:outline-none"
            disabled={isLoading}
          />
          <button
            onClick={handleSubmit}
            disabled={
              isLoading ||
              status === "submitted" ||
              status === "streaming" ||
              input.trim() === ""
            }
            className="ml-2 flex size-9 items-center justify-center rounded-full bg-gradient-yellow text-black hover:bg-gradient-yellow-hover disabled:opacity-50"
          >
            <FaArrowUpLong size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseAiAssistant;
