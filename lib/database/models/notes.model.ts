import { Schema, model, models } from "mongoose";

const NotesSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  videoId: {
    type: Schema.Types.ObjectId,
    ref: "Video",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  markdownContent: {
    type: String,
    default: "",
  },
  title: {
    type: String,
    default: "Untitled Note",
  },
  tags: {
    type: [String],
    default: [],
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Notes = models.Notes || model("Notes", NotesSchema);

export default Notes;
