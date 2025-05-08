import { z } from "zod";

// Define the schema for the reinforcement question
const ReinforcementQuestionSchema = z.object({
  question: z.string().describe("The reinforcement question text"),
  options: z.array(z.string()).length(4).describe("Four answer options"),
  correctAnswer: z
    .number()
    .min(0)
    .max(3)
    .describe("Index of the correct answer (0-3)"),
  explanation: z
    .string()
    .describe(
      "Smart,concise and interesting explanation of why the correct answer is right and why others are wrong"
    ),
});

// Define the schema for a quiz question
const QuizQuestionSchema = z.object({
  question: z.string().describe("The question text"),
  options: z.array(z.string()).length(4).describe("Four answer options"),
  correctAnswer: z
    .number()
    .min(0)
    .max(3)
    .describe("Index of the correct answer (0-3)"),
  explanation: z
    .string()
    .describe(
      "Smart,concise and interesting explanation of why the correct answer is right and why others are wrong"
    ),
  startTime: z
    .number()
    .describe(
      "The timestamp in seconds where this topic appears in the video about which the question is asked"
    ),
  reinforcementQuestions: z
    .array(ReinforcementQuestionSchema)
    .length(2)
    .describe(
      "Two reinforcement questions to show if the user gets the original question wrong"
    ),
});

// Define the schema for the quiz response
export const QuizResponseSchema = z.object({
  questions: z.array(QuizQuestionSchema).length(2),
});
