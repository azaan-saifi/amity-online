"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { FiArrowLeft, FiSave, FiUpload } from "react-icons/fi";

interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  lessons: string;
}

const EditCoursePage = () => {
  const params = useParams();
  const courseId = params.id as string;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [course, setCourse] = useState<Course>({
    _id: "",
    title: "",
    description: "",
    thumbnail: "",
    lessons: "",
  });

  console.log(course);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`/api/courses/${courseId}`);
        const data = await response.json();
        if (response.ok) {
          setCourse(data.course);
          // Set the thumbnail as the preview URL
          setPreviewUrl(data.course.thumbnail);
        } else {
          console.error("Error fetching course:", data.error);
        }
      } catch (error) {
        console.error("Error fetching course:", error);
      }
    };

    fetchCourse();
  }, [courseId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCourse({ ...course, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setThumbnailFile(file);

    // Create preview URL
    const fileUrl = URL.createObjectURL(file);
    setPreviewUrl(fileUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Handle file upload if there's a new thumbnail
      let thumbnailUrl = course.thumbnail;

      if (thumbnailFile) {
        // Upload the image to our server
        const formData = new FormData();
        formData.append("thumbnail", thumbnailFile);
        formData.append("courseId", courseId);

        const imageUploadResponse = await fetch("/api/upload-image", {
          method: "POST",
          body: formData,
        });

        if (!imageUploadResponse.ok) {
          throw new Error("Failed to upload image");
        }

        const imageData = await imageUploadResponse.json();
        thumbnailUrl = imageData.url;
      }

      const response = await fetch(`/api/courses/${courseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...course,
          thumbnail: thumbnailUrl,
        }),
      });

      const data = await response.json();

      if (data.error) {
        toast.error(`Error: ${data.error}`);
      } else {
        router.push(`/admin/courses`);
      }
    } catch (error) {
      console.error("Error updating course:", error);
      toast.error("Failed to update course. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Back button */}
      <div>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-sm text-zinc-400 transition-colors hover:text-white"
        >
          <FiArrowLeft className="mr-1" /> Back to course
        </button>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Edit Course</h1>
        <p className="mt-1 text-zinc-400">Modify course details</p>
      </div>

      <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-black/60 p-6 backdrop-blur-sm">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-white"
              >
                Course Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={course.title}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-white placeholder:text-zinc-500 focus:border-[#f0bb1c] focus:outline-none"
                placeholder="e.g., Advanced Web Development"
                required
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-white"
              >
                Course Description
              </label>
              <textarea
                id="description"
                name="description"
                value={course.description || ""}
                onChange={handleInputChange}
                rows={4}
                className="mt-1 block w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-white placeholder:text-zinc-500 focus:border-[#f0bb1c] focus:outline-none"
                placeholder="Enter course description..."
                required
              />
            </div>

            <div>
              <label
                htmlFor="thumbnail"
                className="block text-sm font-medium text-white"
              >
                Course Thumbnail
              </label>
              <div className="mt-1 flex items-center space-x-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative flex h-32 w-48 cursor-pointer items-center justify-center rounded-md border border-dashed border-zinc-700 bg-zinc-900/50 hover:border-zinc-500"
                >
                  {previewUrl ? (
                    <Image
                      src={previewUrl}
                      width={190}
                      height={126}
                      alt="Thumbnail preview"
                      className="rounded-md object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center">
                      <FiUpload className="size-8 text-zinc-500" />
                      <span className="mt-2 text-xs text-zinc-500">
                        Click to upload image
                      </span>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="thumbnail"
                    name="thumbnail"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                {previewUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewUrl(null);
                      setThumbnailFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    className="text-sm text-zinc-400 hover:text-white"
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className="mt-1 text-xs text-zinc-400">
                Recommended size: 640x360 pixels (16:9 ratio)
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-md border border-zinc-800 bg-transparent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md bg-[#ffc20b31] px-4 py-2 text-sm font-medium text-[#f0bb1c] transition-colors hover:bg-[#ffc20b50]"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <span className="mr-2 size-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Saving...
                </div>
              ) : (
                <div className="flex items-center">
                  <FiSave className="mr-2" />
                  Save Changes
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCoursePage;
