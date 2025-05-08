"use server";
import { ObjectId } from "mongodb";

import QuizProgress, {
  QuizQuestion,
} from "../database/models/quizProgress.model";
import { connectToDatabase } from "../database/mongoose";

// Interface for quiz state to be saved/updated
export interface QuizState {
  quizStarted?: boolean;
  quizCompleted?: boolean;
  currentQuestionIndex?: number;
  selectedAnswers?: (string | null)[];
  showExplanations?: boolean[];
  correctAnswers?: boolean[];
  attemptedReinforcement?: boolean[];
  reinforcementIndex?: number[];
  mastered?: boolean[];
  questions?: QuizQuestion[]; // Add questions to the state
  currentAttemptId?: string; // Current quiz attempt ID
}

/**
 * Get quiz progress by its MongoDB ID
 */
export async function getQuizProgressById(quizProgressId: string) {
  try {
    await connectToDatabase();

    const id = ObjectId.createFromHexString(quizProgressId);

    // Find progress record by its ID
    const quizProgress = await QuizProgress.findById(id);

    // If no record exists, return empty object
    if (!quizProgress) {
      return JSON.stringify({
        _id: null,
        quizStarted: false,
        quizCompleted: false,
        currentQuestionIndex: 0,
        selectedAnswers: [],
        showExplanations: [],
        correctAnswers: [],
        attemptedReinforcement: [],
        reinforcementIndex: [],
        mastered: [],
        questions: [], // No questions loaded yet
      });
    }

    // Convert _id to string to ensure it's properly serialized
    const result = quizProgress.toObject();
    result._id = result._id.toString();

    return JSON.stringify(result);
  } catch (error) {
    console.error("Error getting quiz progress by ID:", error);
    throw error;
  }
}

/**
 * Get quiz progress for a specific video and user
 */
export async function getQuizProgress(videoId: string, userId: string) {
  try {
    await connectToDatabase();

    // Find or create progress record
    const quizProgress = await QuizProgress.findOne({
      userId,
      videoId,
    });

    // If no record exists, return empty object
    if (!quizProgress) {
      return JSON.stringify({
        _id: null,
        quizStarted: false,
        quizCompleted: false,
        currentQuestionIndex: 0,
        selectedAnswers: [],
        showExplanations: [],
        correctAnswers: [],
        attemptedReinforcement: [],
        reinforcementIndex: [],
        mastered: [],
        questions: [], // No questions loaded yet
      });
    }

    // Convert _id to string to ensure it's properly serialized
    const result = quizProgress.toObject();
    result._id = result._id.toString();

    return JSON.stringify(result);
  } catch (error) {
    console.error("Error getting quiz progress:", error);
    throw error;
  }
}

/**
 * Update quiz progress for a specific video and user
 */
export async function updateQuizProgress(
  videoId: string,
  userId: string,
  courseId: string,
  quizState: QuizState
) {
  try {
    await connectToDatabase();

    // Create the update object
    const updateData = {
      ...quizState,
      updatedAt: new Date(),
    };

    // First, check if a record already exists
    const existingRecord = await QuizProgress.findOne({ videoId, userId });

    if (existingRecord) {
      console.log("Updating existing record:", existingRecord._id);
      // Update existing record
      const result = await QuizProgress.findOneAndUpdate(
        { _id: existingRecord._id },
        { $set: updateData },
        { new: true }
      );

      // Convert _id to string for client-side use
      const resultObj = result.toObject();
      resultObj._id = resultObj._id.toString();

      return JSON.stringify(resultObj);
    } else {
      console.log("Creating new record");
      // Create a new record
      const newProgressData = {
        userId,
        videoId,
        courseId,
        ...updateData,
      };

      // Log what we're saving
      console.log("Saving QuizProgress with data:", newProgressData);

      const newProgress = new QuizProgress(newProgressData);
      const savedProgress = await newProgress.save();

      console.log("Saved QuizProgress document:", savedProgress._id);

      // Convert _id to string for client-side use
      const savedObj = savedProgress.toObject();
      savedObj._id = savedObj._id.toString();

      return JSON.stringify(savedObj);
    }
  } catch (error) {
    console.error("Error updating quiz progress:", error);
    throw error;
  }
}

/**
 * Update quiz progress by its MongoDB ID
 */
export async function updateQuizProgressById(
  quizProgressId: string,
  quizState: QuizState
) {
  try {
    await connectToDatabase();

    // Create the update object
    const updateData = {
      ...quizState,
      updatedAt: new Date(),
    };

    const id = ObjectId.createFromHexString(quizProgressId);

    // Update the record by ID
    const result = await QuizProgress.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!result) {
      throw new Error(`Quiz progress with ID ${quizProgressId} not found`);
    }

    // Convert _id to string for client-side use
    const resultObj = result.toObject();
    resultObj._id = resultObj._id.toString();

    return JSON.stringify(resultObj);
  } catch (error) {
    console.error("Error updating quiz progress by ID:", error);
    throw error;
  }
}

/**
 * Check if quiz is completed for a specific video
 */
export async function isQuizCompleted(videoId: string, userId: string) {
  try {
    await connectToDatabase();

    const quizProgress = await QuizProgress.findOne({
      userId,
      videoId,
      quizCompleted: true,
    });

    return !!quizProgress;
  } catch (error) {
    console.error("Error checking quiz completion:", error);
    throw error;
  }
}
