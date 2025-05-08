/* eslint-disable no-undef */
"use server";
import { createUserProps, deleteUserProps, updateUserProps } from "@/types";

import ChatHistory from "../database/models/chatHistory.model";
import Notes from "../database/models/notes.model";
import User from "../database/models/user.model";
import UserEnrollment from "../database/models/userEnrollment.model";
import VideoProgress from "../database/models/videoProgress.model";
import { connectToDatabase } from "../database/mongoose";

export async function createUser(userData: createUserProps) {
  try {
    await connectToDatabase();
    const newUser = await User.create(userData);
    return newUser;
  } catch (error) {
    console.log("Error while creating the user: ", error);
    throw error;
  }
}

export async function updateUser(params: updateUserProps) {
  try {
    await connectToDatabase();
    const { clerkId, updateData } = params;

    await User.findOneAndUpdate({ clerkId }, updateData);
  } catch (error) {
    console.log("Error while updated the user: ", error);
    throw error;
  }
}

export async function deleteUser(params: deleteUserProps) {
  try {
    await connectToDatabase();
    const { clerkId } = params;

    // Find the user before deleting to get any needed references
    const user = await User.findOne({ clerkId });

    if (!user) {
      console.log(`User with clerkId ${clerkId} not found`);
      return;
    }

    // Delete all user data from different collections

    // 1. Delete chat history
    const chatHistoryResult = await ChatHistory.deleteMany({ userId: clerkId });
    console.log(
      `Deleted ${chatHistoryResult.deletedCount} chat history records`
    );

    // 2. Delete notes
    const notesResult = await Notes.deleteMany({ userId: clerkId });
    console.log(`Deleted ${notesResult.deletedCount} notes`);

    // 3. Delete video progress
    const videoProgressResult = await VideoProgress.deleteMany({
      userId: clerkId,
    });
    console.log(
      `Deleted ${videoProgressResult.deletedCount} video progress records`
    );

    // 4. Delete course enrollments
    const enrollmentResult = await UserEnrollment.deleteMany({
      userId: clerkId,
    });
    console.log(`Deleted ${enrollmentResult.deletedCount} course enrollments`);

    // 5. Finally delete the user
    const userDeletionResult = await User.findOneAndDelete({ clerkId });
    console.log(`User ${clerkId} deleted`);

    return {
      success: true,
      deletedData: {
        user: userDeletionResult ? 1 : 0,
        chatHistory: chatHistoryResult.deletedCount,
        notes: notesResult.deletedCount,
        videoProgress: videoProgressResult.deletedCount,
        enrollments: enrollmentResult.deletedCount,
      },
    };
  } catch (error) {
    console.log("Error while deleting the user and related data: ", error);
    throw error;
  }
}

export async function getUserById({ userId }: { userId: string }) {
  try {
    await connectToDatabase();

    const user = await User.findOne({ clerkId: userId });
    return user;
  } catch (error) {
    console.log("Error while fetching the user: ", error);
    throw error;
  }
}
