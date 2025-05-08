"use server";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function getAssistantReponse(messages: any) {
  const { textStream } = streamText({
    model: openai("gpt-4o-mini"),
    messages: messages,
  });

  return textStream;
}
