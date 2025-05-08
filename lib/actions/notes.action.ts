"use server";

import { revalidatePath } from "next/cache";

import Notes from "@/lib/database/models/notes.model";

import { connectToDatabase } from "../database/mongoose";

export interface NoteData {
  content: string;
  markdownContent: string;
  title?: string;
  tags?: string[];
  isPublic?: boolean;
}

export async function saveNote(
  videoId: string,
  noteData: NoteData,
  userId: string
) {
  try {
    await connectToDatabase();

    if (!userId) throw new Error("Unauthorized");

    // Check if note already exists
    const existingNote = await Notes.findOne({
      userId,
      videoId,
    });

    if (existingNote) {
      // Update existing note
      existingNote.content = noteData.content;
      existingNote.markdownContent = noteData.markdownContent;

      if (noteData.title) existingNote.title = noteData.title;
      if (noteData.tags) existingNote.tags = noteData.tags;
      if (noteData.isPublic !== undefined)
        existingNote.isPublic = noteData.isPublic;

      existingNote.updatedAt = new Date();
      await existingNote.save();
    } else {
      // Create new note
      await Notes.create({
        userId,
        videoId,
        content: noteData.content,
        markdownContent: noteData.markdownContent,
        title: noteData.title || "Untitled Note",
        tags: noteData.tags || [],
        isPublic: noteData.isPublic || false,
      });
    }

    revalidatePath(`/student/courses/[id]`);
    return { success: true };
  } catch (error) {
    console.error("Error saving note:", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function getNoteForVideo(videoId: string, userId: string) {
  try {
    await connectToDatabase();

    if (!userId) return null;

    const note = await Notes.findOne({
      userId,
      videoId,
    });

    return note ? JSON.stringify(note) : null;
  } catch (error) {
    console.error("Error getting note:", error);
    return null;
  }
}

export async function getAllUserNotes(userId: string) {
  try {
    await connectToDatabase();

    if (!userId) return null;

    const notes = await Notes.find({
      userId,
    }).sort({ updatedAt: -1 });

    return JSON.stringify(notes);
  } catch (error) {
    console.error("Error getting all notes:", error);
    return null;
  }
}
