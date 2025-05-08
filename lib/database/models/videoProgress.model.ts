import { Schema, model, models } from "mongoose";

// First, check if the model is already defined to avoid recompilation errors
const VideoProgressModel = models.VideoProgress;

// Only define the schema if the model doesn't exist yet
const VideoProgressSchema = VideoProgressModel
  ? VideoProgressModel.schema
  : new Schema({
      userId: {
        type: String,
        required: true,
      },
      videoId: {
        type: Schema.Types.ObjectId,
        ref: "Video",
        required: true,
      },
      courseId: {
        type: Schema.Types.ObjectId,
        ref: "Course",
        required: true,
      },
      completed: {
        type: Boolean,
        default: false,
      },
      watchedPercent: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      playbackPositionSeconds: {
        type: Number,
        default: 0,
      },
      lastWatchedAt: {
        type: Date,
        default: Date.now,
      },
    });

// Add pre-save hook for debugging
if (!VideoProgressModel) {
  VideoProgressSchema.pre("save", function () {
    console.log("Saving VideoProgress with data:", this.toObject());
  });

  // Add post-save hook for debugging
  VideoProgressSchema.post("save", function (doc) {
    console.log("Saved VideoProgress document:", doc.toObject());
  });

  // Add hooks for findOneAndUpdate
  VideoProgressSchema.pre("findOneAndUpdate", function () {
    console.log("findOneAndUpdate called with update:", this.getUpdate());
  });

  VideoProgressSchema.post("findOneAndUpdate", function (doc) {
    console.log("findOneAndUpdate result:", doc);
  });

  // Compound index to ensure one progress record per user-video combination
  VideoProgressSchema.index({ userId: 1, videoId: 1 }, { unique: true });
}

const VideoProgress =
  VideoProgressModel || model("VideoProgress", VideoProgressSchema);

export default VideoProgress;
