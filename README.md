# Interactive Learning Platform

A modern, interactive learning platform built with Next.js, React, and Tailwind CSS.

## Features

- **Course Discovery**: Browse and search through available courses
- **Course Details**: View comprehensive information about each course
- **Interactive Video Learning**: Enhanced video player with playback controls, speed adjustment, and progress tracking
- **Course Progress Tracking**: Keep track of completed lessons and overall course progress
- **Note-taking**: Take and save notes while watching lessons
- **Resources**: Access downloadable resources for each lesson
- **Transcripts**: Read along with lesson transcripts

## Enhanced Learning Experience

The platform features a modern, immersive learning page with:

- **React Player**: High-quality video playback with custom controls
- **Progress Tracking**: Automatic tracking of lesson completion
- **Sidebar Navigation**: Easily navigate between lessons and modules
- **Resource Management**: Access to lesson-specific resources
- **Note Taking**: Built-in note-taking functionality
- **Transcripts**: Follow along with lesson content

## Thumbnail Management System

The application includes a robust thumbnail management system for courses and videos:

### How it works:
1. When you upload a thumbnail image through the admin interface, the image is:
   - Saved to the `/public/thumbnails/` directory with a unique filename
   - Associated with the specific course or video
   - Served directly from the server's filesystem

### Key features:
- Persistent storage: Thumbnails remain available after page refreshes or browser restarts
- Organized naming: Files are saved with a naming pattern that includes course/video ID
- Optimized access: Images are served directly from the static public folder

### Implementation details:
- API Route: `/api/upload-image` handles all thumbnail uploads
- Storage: Images are stored in the `/public/thumbnails/` directory
- Format: Maintains the original image format (jpg, png, etc.)
- Unique filenames: Generated using a combination of IDs and UUIDs to prevent collisions

For development or testing environments, you might need to create the `/public/thumbnails/` directory if it doesn't exist.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack

- **Next.js**: React framework for server-rendered applications
- **React**: UI library
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library
- **React Player**: Video playback
- **React Icons**: Icon library

## Usage

### Course Learning Page

The `CourseLearningPage` component provides an immersive learning experience:

```jsx
import CourseLearningPage from "@/components/student/CourseLearningPage";

// Use the component with course data and optional initial lesson ID
<CourseLearningPage 
  course={courseData} 
  initialLessonId="lesson-1" 
/>
```

The component handles:
- Video playback with React Player
- Lesson navigation
- Progress tracking
- Resource management
- Note-taking
- Transcript display

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.