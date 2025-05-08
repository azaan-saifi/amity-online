import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

import { saveChatMessage } from "@/lib/actions/chatHistory.action";
import { VideoTranscript } from "@/lib/database/models/transcript.model";
import { connectToDatabase } from "@/lib/database/mongoose";

export async function POST(req: NextRequest) {
  const { messages, currentTimestamp, videoId, userId, courseId } =
    await req.json();

  console.log("API received videoId:", videoId);

  try {
    // Connect to the database
    await connectToDatabase();

    // Find the transcript by videoId instead of direct ID
    let videoTranscriptDoc;

    try {
      // First try to find with direct videoId match (in case it's already stored as a string)
      videoTranscriptDoc = await VideoTranscript.findOne({ videoId });

      // If not found and videoId is a valid ObjectId string, try converting it
      if (!videoTranscriptDoc && mongoose.isValidObjectId(videoId)) {
        const objectId = new mongoose.Types.ObjectId(videoId);
        console.log("Trying with converted ObjectId:", objectId);
        videoTranscriptDoc = await VideoTranscript.findOne({
          videoId: objectId,
        });
      }
    } catch (error) {
      console.error("Error finding transcript:", error);
    }

    console.log("Transcript found:", videoTranscriptDoc ? "Yes" : "No");

    if (!videoTranscriptDoc) {
      return NextResponse.json(
        { error: "Transcript not found for this video" },
        { status: 404 }
      );
    }

    const transcriptData = JSON.parse(videoTranscriptDoc.transcript);
    console.log(
      "Transcript data sample:",
      transcriptData && transcriptData.length > 0
        ? `Found ${transcriptData.length} transcript segments`
        : "No transcript segments found"
    );

    // Save the user's message to chat history if userId and courseId are provided
    if (userId && videoId && courseId && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "user") {
        console.log("Saving user message to chat history:", {
          userId,
          videoId,
          contentLength: lastMessage.content.length,
        });

        await saveChatMessage(userId, videoId, courseId, {
          role: lastMessage.role,
          content: lastMessage.content,
        });
      }
    }

    // Flag to track if the assistant response has been saved
    let savedAssistantResponse = false;

    // Stream the AI response
    const response = streamText({
      model: google("gemini-2.5-pro-exp-03-25"),
      system: `You are an AI Learning Assistant for an educational platform with video lectures.
Your goal is to help students understand the video content, navigate to relevant parts of lectures, and provide additional explanations.

You have access to transcripts from the video lectures, and you can:
1. Help users find specific moments in videos where topics were discussed
2. Explain concepts from the lectures in simpler terms or provide more details
3. Connect related topics across different parts of the lectures
4. Provide direct links to specific timestamps in videos

When responding:
- If the user asks where something was mentioned, provide the timestamp where it was discussed
- If the user is confused about the current part of the lecture, provide a simpler explanation
- If the user wants an example, try to elaborate on the topic with practical examples
- If the user wants to jump to a specific time, extract the timestamp and fetch relevant content

IMPORTANT FORMAT FOR TIMESTAMPS:
When referencing timestamps from the transcript data, ALWAYS follow these strict rules:
1. DO NOT try to convert seconds to minutes:seconds format yourself
2. When you find a relevant moment in the transcript, use this EXACT format: [timestamp](seconds)
   For example: If you find content at timestamp 160.179 seconds, write it as: [timestamp](160)
   For example: If you find content at timestamp 75.76 seconds, write it as: [timestamp](76)
3. ALWAYS round the seconds to the nearest integer, removing any decimals
4. The UI will automatically convert and display the seconds in the correct format for users

For example, instead of writing:
"This concept is explained at 5:45 in the video"

Write:
"This concept is explained at [timestamp](345) in the video"

Or:
"You can find an explanation [timestamp](122) in the lecture"

DO NOT use any other format for timestamps. The word "timestamp" in brackets is required, and the integer seconds value in parentheses is required.

Here's the videoId: ${videoId}
Here's user's current time in the lecture, in case they didn't specify - Current time: ${currentTimestamp}
And here's the whole transcript of the video:
${JSON.stringify(transcriptData)}
.
`,
      messages,
      async onFinish(completion) {
        // Save the assistant's response to chat history if userId and courseId are provided
        if (userId && videoId && courseId && !savedAssistantResponse) {
          savedAssistantResponse = true;
          try {
            console.log("Saving assistant response to chat history:", {
              userId,
              videoId,
              contentLength: completion.text.length,
              time: new Date().toISOString(),
            });

            const result = await saveChatMessage(userId, videoId, courseId, {
              role: "assistant",
              content: completion.text,
            });

            console.log("Save assistant message result:", result);
          } catch (error) {
            console.error("Error saving assistant message:", error);
          }
        } else {
          console.warn("Missing data for saving assistant message:", {
            hasUserId: !!userId,
            hasVideoId: !!videoId,
            hasCourseId: !!courseId,
            alreadySaved: savedAssistantResponse,
          });
        }
      },
    });

    return response.toDataStreamResponse();
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json({ message: "Error while fetching", error });
  }
}

// Use the format: [watch this part](https://youtube.com/watch?v=${videoId}&t={start})

// To ensure the link works correctly with the video player, make sure to include the full URL including https:// prefix.
