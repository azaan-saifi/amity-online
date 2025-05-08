import { Schema, model, models, Document } from "mongoose";

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  startTime: number;
  reinforcementQuestions: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }[];
}

export interface IQuizProgress extends Document {
  userId: string;
  videoId: string;
  courseId: Schema.Types.ObjectId;
  quizStarted: boolean;
  quizCompleted: boolean;
  currentQuestionIndex: number;
  selectedAnswers: (string | null)[];
  showExplanations: boolean[];
  correctAnswers: boolean[];
  attemptedReinforcement: boolean[];
  reinforcementIndex: number[]; // 0 = no reinforcement, 1 = first, 2 = second
  mastered: boolean[];
  questions: QuizQuestion[];
  createdAt: Date;
  updatedAt: Date;
}

const quizProgressSchema = new Schema<IQuizProgress>({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  videoId: {
    type: String,
    required: true,
    index: true,
    maxlength: 100, // Limit the length to avoid issues
  },
  courseId: {
    type: Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  quizStarted: {
    type: Boolean,
    default: false,
  },
  quizCompleted: {
    type: Boolean,
    default: false,
  },
  currentQuestionIndex: {
    type: Number,
    default: 0,
  },
  selectedAnswers: {
    type: [Schema.Types.Mixed],
    default: [],
  },
  showExplanations: {
    type: [Boolean],
    default: [],
  },
  correctAnswers: {
    type: [Boolean],
    default: [],
  },
  attemptedReinforcement: {
    type: [Boolean],
    default: [],
  },
  reinforcementIndex: {
    type: [Number],
    default: [],
  },
  mastered: {
    type: [Boolean],
    default: [],
  },
  questions: {
    type: [
      {
        question: String,
        options: [String],
        correctAnswer: Number,
        explanation: String,
        startTime: Number,
        reinforcementQuestions: [
          {
            question: String,
            options: [String],
            correctAnswer: Number,
            explanation: String,
          },
        ],
      },
    ],
    default: [],
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

// Create a compound index for efficient querying but allow for potential fixes
quizProgressSchema.index(
  { userId: 1, videoId: 1 },
  { unique: true, partialFilterExpression: { videoId: { $exists: true } } }
);

const QuizProgress =
  models.QuizProgress || model("QuizProgress", quizProgressSchema);

export default QuizProgress;
