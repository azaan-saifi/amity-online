/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

export async function getAssistantReponse(messages: any) {
  const { textStream } = streamText({
    model: openai("gpt-4o-mini"),
    messages,
  });

  return textStream;
}
