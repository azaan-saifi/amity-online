"use client";

import dynamic from "next/dynamic";
import { FiSave } from "react-icons/fi";

// Dynamically import the markdown editor to avoid SSR issues
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full animate-pulse rounded-md bg-zinc-800"></div>
  ),
});

interface CourseNotesProps {
  noteContent: string;
  noteTitle: string;
  isSavingNote: boolean;
  onNoteContentChange: (content: string) => void;
  onNoteTitleChange: (title: string) => void;
  onSaveNote: () => void;
}

const CourseNotes = ({
  noteContent,
  noteTitle,
  isSavingNote,
  onNoteContentChange,
  onNoteTitleChange,
  onSaveNote,
}: CourseNotesProps) => {
  return (
    <div className="rounded-lg border border-zinc-800 bg-black/40 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-medium text-white">Your Notes</h3>
        <button
          onClick={onSaveNote}
          disabled={isSavingNote}
          className="flex items-center justify-center rounded bg-[#f0bb1c] px-4 py-2 text-sm font-medium text-black hover:bg-[#f0bb1c]/80"
        >
          {isSavingNote ? (
            "Saving..."
          ) : (
            <>
              <FiSave className="mr-2" /> Save Notes
            </>
          )}
        </button>
      </div>

      {/* Note Title */}
      <div className="mb-4">
        <input
          type="text"
          value={noteTitle}
          onChange={(e) => onNoteTitleChange(e.target.value)}
          placeholder="Note Title"
          className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-white"
        />
      </div>

      {/* Markdown Editor */}
      <div data-color-mode="dark">
        <MDEditor
          value={noteContent}
          onChange={(val) => onNoteContentChange(val || "")}
          height={300}
          preview="edit"
          className="border border-zinc-800"
        />
      </div>
    </div>
  );
};

export default CourseNotes;
