import { Schema, model, models, Document } from "mongoose";

export interface IUserEnrollment extends Document {
  userId: string;
  courseId: Schema.Types.ObjectId;
  enrolledAt: Date;
  completionPercent: number;
  lastAccessedAt: Date;
  isActive: boolean;
  completedLessons?: number;
  totalLessons?: number;
}

const userEnrollmentSchema = new Schema<IUserEnrollment>({
  userId: {
    type: String,
    required: true,
  },
  courseId: {
    type: Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  enrolledAt: {
    type: Date,
    default: Date.now,
  },
  completionPercent: {
    type: Number,
    default: 0,
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  completedLessons: {
    type: Number,
    default: 0,
  },
  totalLessons: {
    type: Number,
    default: 0,
  },
});

// Create a compound index on userId and courseId to ensure uniqueness
userEnrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

const UserEnrollment =
  models.UserEnrollment || model("UserEnrollment", userEnrollmentSchema);

export default UserEnrollment;
