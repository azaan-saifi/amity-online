"use server";

import SystemSettings from "@/lib/database/models/systemSettings.model";

import { connectToDatabase } from "../database/mongoose";

export async function getSystemSetting(key: string): Promise<string | null> {
  try {
    await connectToDatabase();
    const setting = await SystemSettings.findOne({ key });
    return setting ? setting.value : null;
  } catch (error) {
    console.error(`Error getting system setting ${key}:`, error);
    return null;
  }
}

export async function updateSystemSetting(
  key: string,
  value: string
): Promise<boolean> {
  try {
    await connectToDatabase();
    await SystemSettings.findOneAndUpdate(
      { key },
      { value, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    return true;
  } catch (error) {
    console.error(`Error updating system setting ${key}:`, error);
    return false;
  }
}

export async function getLastCourseUpdate(): Promise<string | null> {
  return getSystemSetting("lastCourseUpdate");
}

export async function updateLastCourseUpdate(): Promise<boolean> {
  const now = new Date().getTime().toString();
  return updateSystemSetting("lastCourseUpdate", now);
}
