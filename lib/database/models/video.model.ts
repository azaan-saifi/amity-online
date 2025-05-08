import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  thumbnail: { type: String },
  duration: { type: String },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  position: { type: Number, required: true },
  url: { type: String, required: true },
  locked: {
    type: Boolean,
    default: true,
  },
});

const Video = mongoose.models.Video || mongoose.model("Video", videoSchema);

export default Video;
