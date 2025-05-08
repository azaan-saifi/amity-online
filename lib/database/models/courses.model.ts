import { Schema, model, models, Document } from "mongoose";

export interface ICourse extends Document {
  title: string;
  description: string;
  lessons: string;
  thumbnail: string;
  enrolled: boolean;
  progress?: number;
  completedLessons?: number;
  totalLessons?: number;
  playlistId?: string;
}

const CourseSchema = new Schema<ICourse>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  lessons: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
    required: true,
  },
  enrolled: {
    type: Boolean,
    default: false,
  },
  progress: {
    type: Number,
    default: 0, // Percentage from 0-100
  },
  completedLessons: {
    type: Number,
    default: 0,
  },
  totalLessons: {
    type: Number,
    default: 0,
  },
  playlistId: {
    type: String,
  },
});

const Course = models.Course || model("Course", CourseSchema);
export default Course;
