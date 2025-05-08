"use client";

import { AnimatePresence, motion } from "framer-motion";
import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import {
  FiCheck,
  FiX,
  FiChevronRight,
  FiChevronLeft,
  FiRefreshCw,
  FiPlay,
  FiLock,
  FiHelpCircle,
  FiClock,
  FiArrowRight,
} from "react-icons/fi";

import {
  getQuizProgressById,
  updateQuizProgressById,
  updateQuizProgress,
  getQuizProgress,
} from "@/lib/actions/quizProgress.action";
import { updateVideoTime } from "@/lib/actions/videoProgress.action";
import { QuizQuestion, ReinforcementQuestion } from "@/types";

// Define QuizProgressModel type for the component
interface QuizProgressModel {
  userId?: string;
  videoId?: string;
  courseId?: string;
  quizStarted?: boolean;
  quizCompleted?: boolean;
  currentQuestionIndex?: number;
  selectedAnswers?: (string | null)[];
  showExplanations?: boolean[];
  correctAnswers?: boolean[];
  attemptedReinforcement?: boolean[];
  reinforcementIndex?: number[];
  mastered?: boolean[];
  questions?: QuizQuestion[];
}

interface Question {
  id: string;
  text: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  explanation: string;
  startTime: number;
  reinforcementQuestions: ReinforcementQuestion[];
}

// Convert QuizQuestion from API to component Question format
const convertApiQuestionToComponentFormat = (
  apiQuestion: QuizQuestion,
  index: number
): Question => {
  return {
    id: `q${index + 1}`,
    text: apiQuestion.question,
    options: apiQuestion.options.map((option, optIndex) => ({
      id: `q${index + 1}-${String.fromCharCode(97 + optIndex)}`, // a, b, c, d as suffixes
      text: option,
      isCorrect: optIndex === apiQuestion.correctAnswer,
    })),
    explanation: apiQuestion.explanation,
    startTime: apiQuestion.startTime || 0,
    reinforcementQuestions: apiQuestion.reinforcementQuestions || [],
  };
};

interface CoursePracticeQuizProps {
  videoTitle: string;
  videoId: string;
  courseId: string;
  userId: string;
  videoProgressId: string;
  watchedPercent?: number;
  setCurrentPlaybackPosition?: (time: number) => void;
  onQuizCompleted?: () => void;
  updateVideoProgress?: (time: number) => void;
  onSeekTo?: (seconds: number) => void;
}

const CoursePracticeQuiz = ({
  videoTitle,
  videoId,
  courseId,
  userId,
  videoProgressId,
  setCurrentPlaybackPosition,
  watchedPercent = 0,
  onQuizCompleted,
  onSeekTo,
}: CoursePracticeQuizProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // Add state to track the MongoDB document ID for this quiz
  const [quizProgressId, setQuizProgressId] = useState<string | null>(null);

  // Add state for storing questions fetched from API
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);

  // Reinforcement learning states
  const [showReinforcement, setShowReinforcement] = useState(false);
  const [currentReinforcementIndex, setCurrentReinforcementIndex] = useState(0); // 0 = first, 1 = second
  const [reinforcementQuestion, setReinforcementQuestion] =
    useState<ReinforcementQuestion | null>(null);
  const [reinforcementOptionId, setReinforcementOptionId] = useState<
    string | null
  >(null);
  const [reinforcementSubmitted, setReinforcementSubmitted] = useState(false);
  const [loadingReinforcement, setLoadingReinforcement] = useState(false);
  const [reinforcementAttempts, setReinforcementAttempts] = useState(0);
  const [reinforcementSuccess, setReinforcementSuccess] = useState(false);
  const [maxAttemptsReached, setMaxAttemptsReached] = useState(false);

  // Tracking answers and explanations for each question
  const [questionStates, setQuestionStates] = useState<{
    answerSelected: (string | null)[];
    showExplanation: boolean[];
    isCorrect: boolean[];
    attemptedReinforcement: boolean[];
    reinforcementIndex: number[]; // 0 = none, 1 = first reinforcement, 2 = second
    mastered: boolean[];
  }>({
    answerSelected: [],
    showExplanation: [],
    isCorrect: [],
    attemptedReinforcement: [],
    reinforcementIndex: [],
    mastered: [],
  });

  // Process questions with video title
  const currentQuestion =
    quizStarted && questions.length > 0
      ? questions[currentQuestionIndex]
      : null;

  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const canStartQuiz = watchedPercent >= 95;

  console.log("Current question index:", currentQuestionIndex);
  console.log("Re-Rendering...");

  // Jump to video position function
  const handleJumpToPosition = (startTime: number) => {
    // Update player position immediately first
    setCurrentPlaybackPosition?.(startTime);

    // Directly seek the player to this position
    if (onSeekTo) {
      onSeekTo(startTime);
      toast.success("Jumped to video position");
    }

    // Then update the position in the database
    updateVideoTime(videoProgressId, userId, startTime)
      .then((result) => {
        if (!result.success) {
          toast.error("Failed to update video position");
        }
      })
      .catch((error) => {
        console.error("Error updating video position:", error);
        toast.error("Failed to update video position");
      });
  };

  // Handle start new attempt
  const handleStartNewAttempt = async () => {
    if (!userId || !videoId || !courseId) return;

    try {
      setLoadingQuestions(true);
      // Reset quiz progress in the database
      await updateQuizProgress(videoId, userId, courseId, {
        quizStarted: true,
        quizCompleted: false,
        currentQuestionIndex: 0,
        selectedAnswers: [],
        showExplanations: [],
        correctAnswers: [],
        attemptedReinforcement: [],
        reinforcementIndex: [],
        mastered: [],
        questions: [],
      });

      // Reset local state
      setQuizCompleted(false);
      setQuizStarted(true);
      setCurrentQuestionIndex(0);
      setSelectedOptionId(null);
      setHasSubmitted(false);

      // Fetch questions again
      await fetchQuestions();
    } catch (error) {
      console.error("Error starting new quiz attempt:", error);
      toast.error("Failed to start new quiz attempt");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle return to question
  const handleReturnToQuestion = () => {
    setShowReinforcement(false);
    setReinforcementQuestion(null);
    setReinforcementOptionId(null);
    setReinforcementSubmitted(false);
    setReinforcementAttempts(0);
  };

  // Handle next question
  const handleNextQuestion = async () => {
    if (isLastQuestion) {
      setQuizCompleted(true);

      // Save completion status when quiz is completed
      await saveQuizProgress({ quizCompleted: true });

      // Call the parent component's completion callback
      if (onQuizCompleted) {
        onQuizCompleted();
      }
    } else {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      console.log("Saving progress when navigating to next question");
      // Save progress when navigating to next question
      await saveQuizProgress({ currentQuestionIndex: nextIndex });
      console.log("Progress saved when navigating to next question");
      setSelectedOptionId(questionStates.answerSelected[nextIndex] || null);
      setHasSubmitted(questionStates.showExplanation[nextIndex] || false);
    }
  };

  // Handle previous question
  const handlePreviousQuestion = async () => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIndex);
      setSelectedOptionId(questionStates.answerSelected[prevIndex] || null);
      setHasSubmitted(questionStates.showExplanation[prevIndex] || false);

      // Save progress when navigating to previous question
      await saveQuizProgress({ currentQuestionIndex: prevIndex });
    }
  };

  // Handle option select
  const handleOptionSelect = (optionId: string) => {
    if (hasSubmitted) return;
    setSelectedOptionId(optionId);
  };

  // Handle submit answer
  const handleSubmitAnswer = async () => {
    if (!selectedOptionId || hasSubmitted || !currentQuestion) return;

    const selectedOption = currentQuestion.options.find(
      (option) => option.id === selectedOptionId
    );
    const isCorrect = selectedOption?.isCorrect || false;

    // Update question states
    const newQuestionStates = { ...questionStates };
    newQuestionStates.answerSelected[currentQuestionIndex] = selectedOptionId;
    newQuestionStates.showExplanation[currentQuestionIndex] = true;
    newQuestionStates.isCorrect[currentQuestionIndex] = isCorrect;
    setQuestionStates(newQuestionStates);

    setHasSubmitted(true);

    if (isCorrect) {
      newQuestionStates.mastered[currentQuestionIndex] = true;
    }

    // Save progress immediately after question is answered
    await saveQuizProgress({
      selectedAnswers: newQuestionStates.answerSelected,
      showExplanations: newQuestionStates.showExplanation,
      correctAnswers: newQuestionStates.isCorrect,
      mastered: newQuestionStates.mastered,
    });
  };

  // Handle start reinforcement
  const handleStartReinforcement = async () => {
    if (!selectedOptionId || !currentQuestion) return;

    setShowReinforcement(true);
    setLoadingReinforcement(true);
    setReinforcementAttempts(0);
    setMaxAttemptsReached(false);
    setReinforcementSuccess(false);

    // Start with the first reinforcement question (index 0)
    setCurrentReinforcementIndex(0);

    // Mark this question as having attempted reinforcement
    const newQuestionStates = { ...questionStates };
    newQuestionStates.attemptedReinforcement[currentQuestionIndex] = true;
    newQuestionStates.reinforcementIndex[currentQuestionIndex] = 1;
    setQuestionStates(newQuestionStates);

    try {
      const reinforcementQ = currentQuestion?.reinforcementQuestions[0];
      setReinforcementQuestion(reinforcementQ);
    } catch (error) {
      console.error("Failed to get reinforcement question:", error);
    } finally {
      setLoadingReinforcement(false);
    }
  };

  // Handle reinforcement option select
  const handleReinforcementOptionSelect = (optionId: string) => {
    if (reinforcementSubmitted) return;
    setReinforcementOptionId(optionId);
  };

  // Handle submit reinforcement answer
  const handleSubmitReinforcementAnswer = () => {
    if (
      !reinforcementOptionId ||
      reinforcementSubmitted ||
      !reinforcementQuestion
    )
      return;

    const reinforcementOptions = reinforcementQuestion.options.map(
      (option, optIndex) => ({
        id: `r-q${currentQuestionIndex + 1}-${String.fromCharCode(
          97 + optIndex
        )}`, // a, b, c, d as suffixes
        text: option,
        isCorrect: optIndex === reinforcementQuestion.correctAnswer,
      })
    );

    const selectedOption = reinforcementOptions.find(
      (option) => option.id === reinforcementOptionId
    );
    const isCorrect = selectedOption?.isCorrect || false;

    setReinforcementSubmitted(true);

    if (isCorrect) {
      setReinforcementSuccess(true);

      // Mark this question as mastered if reinforcement was successful
      const newQuestionStates = { ...questionStates };
      newQuestionStates.mastered[currentQuestionIndex] = true;
      setQuestionStates(newQuestionStates);
    } else {
      const newAttempts = reinforcementAttempts + 1;
      setReinforcementAttempts(newAttempts);

      if (newAttempts >= 3) {
        setMaxAttemptsReached(true);
      }
    }
  };

  // Handle try next reinforcement
  const handleTryNextReinforcement = () => {
    setCurrentReinforcementIndex(currentReinforcementIndex + 1);
    const reinforcementQ = currentQuestion?.reinforcementQuestions[1];
    setReinforcementQuestion(reinforcementQ!);
    setReinforcementOptionId(null);
    setReinforcementSubmitted(false);
  };

  // The fetchQuestions function to fetch the quiz questions from the API
  async function fetchQuestions() {
    if (!canStartQuiz || !videoId || !videoTitle) return;
    setLoadingQuestions(true);

    console.log("Fetching quiz questions");

    // Set quiz started state
    setQuizStarted(true);
    setCurrentQuestionIndex(0);
    setSelectedOptionId(null);
    setHasSubmitted(false);
    setQuizError(null);

    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        body: JSON.stringify({ videoId, videoTitle }),
      });

      const data = await response.json();

      if (data.error) {
        toast.error("Failed to generate quiz questions");
        throw new Error(data.error);
      }

      const fetchedQuestions = data.questions;

      // Convert API questions to component format
      const convertedQuestions = fetchedQuestions.map(
        convertApiQuestionToComponentFormat
      );

      // Update state with the new questions
      setQuestions(convertedQuestions);

      // Initialize question states with the new questions
      const newQuestionStates = {
        answerSelected: convertedQuestions.map(() => null),
        showExplanation: convertedQuestions.map(() => false),
        isCorrect: convertedQuestions.map(() => false),
        attemptedReinforcement: convertedQuestions.map(() => false),
        reinforcementIndex: convertedQuestions.map(() => 0),
        mastered: convertedQuestions.map(() => false),
      };

      setQuestionStates(newQuestionStates);

      // Save questions to database - this is crucial for persistence between tab switches
      if (userId && videoId && courseId) {
        console.log("Saving questions to database");
        await updateQuizProgress(videoId, userId, courseId, {
          quizStarted: true,
          quizCompleted: false,
          currentQuestionIndex: 0,
          selectedAnswers: newQuestionStates.answerSelected,
          showExplanations: newQuestionStates.showExplanation,
          correctAnswers: newQuestionStates.isCorrect,
          attemptedReinforcement: newQuestionStates.attemptedReinforcement,
          reinforcementIndex: newQuestionStates.reinforcementIndex,
          mastered: newQuestionStates.mastered,
          questions: fetchedQuestions, // Save the raw questions from API to database
        });
        console.log("Questions saved to database");
      }
    } catch (error) {
      console.error("Error fetching quiz questions:", error);

      // Reset quiz started state on error only if no questions are loaded
      if (questions.length === 0) {
        setQuizStarted(false);
      }
    } finally {
      setLoadingQuestions(false);
    }
  }

  // Load quiz progress from database
  useEffect(() => {
    const loadQuizProgress = async () => {
      if (!userId) return;

      // setIsLoading(true);
      try {
        let progressData;
        let progress;

        // First, try to load by MongoDB ID if available
        if (quizProgressId) {
          console.log("Loading quiz progress by ID:", quizProgressId);
          progressData = await getQuizProgressById(quizProgressId);
          progress = JSON.parse(progressData);

          // Validate that the quiz belongs to this user and video
          if (
            progress &&
            progress.userId === userId &&
            progress.videoId === videoId
          ) {
            console.log("Successfully loaded quiz by ID");
          } else {
            // If the quiz doesn't match our user/video, fall back to regular loading
            throw new Error(
              "Quiz ID exists but doesn't match current user/video"
            );
          }
        } else {
          // No quiz ID available, load by user and video
          console.log("Loading quiz progress by user/video:", userId, videoId);
          progressData = await getQuizProgress(videoId, userId);
          progress = JSON.parse(progressData);
        }

        console.log("Loaded progress:", progress);

        // Store the MongoDB ID for future operations
        if (progress && progress._id) {
          setQuizProgressId(progress._id);
          console.log("Set quiz progress ID:", progress._id);
        }

        // Update local state with saved progress
        setQuizStarted(progress.quizStarted);
        setQuizCompleted(progress.quizCompleted);

        // If we have questions stored in the database, use those
        if (progress.questions && progress.questions.length > 0) {
          const convertedQuestions = progress.questions.map(
            convertApiQuestionToComponentFormat
          );
          setQuestions(convertedQuestions);

          // Only set question index if we have questions
          setCurrentQuestionIndex(progress.currentQuestionIndex || 0);

          // Initialize question states with saved data
          if (progress.selectedAnswers && progress.selectedAnswers.length > 0) {
            setSelectedOptionId(
              progress.selectedAnswers[progress.currentQuestionIndex]
            );
            setHasSubmitted(
              progress.showExplanations[progress.currentQuestionIndex] || false
            );

            // Update question states with the loaded data
            setQuestionStates({
              answerSelected:
                progress.selectedAnswers || convertedQuestions.map(() => null),
              showExplanation:
                progress.showExplanations ||
                convertedQuestions.map(() => false),
              isCorrect:
                progress.correctAnswers || convertedQuestions.map(() => false),
              attemptedReinforcement:
                progress.attemptedReinforcement ||
                convertedQuestions.map(() => false),
              reinforcementIndex:
                progress.reinforcementIndex || convertedQuestions.map(() => 0),
              mastered:
                progress.mastered || convertedQuestions.map(() => false),
            });
          }
        }
      } catch (error) {
        console.error("Error loading quiz progress:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadQuizProgress();
  }, [userId, videoId, quizProgressId]);

  // // Fix: When questions are loaded, make sure we're starting at the first question
  // useEffect(() => {
  //   if (questions.length > 0 && quizStarted) {
  //     // Only reset to first question if the quiz was just started
  //     if (loadingQuestions === false && currentQuestionIndex !== 0) {
  //       setCurrentQuestionIndex(0);
  //       setSelectedOptionId(questionStates.answerSelected[0] || null);
  //       setHasSubmitted(questionStates.showExplanation[0] || false);
  //     }
  //   }
  // }, [
  //   questions,
  //   loadingQuestions,
  //   quizStarted,
  //   currentQuestionIndex,
  //   questionStates.answerSelected,
  //   questionStates.showExplanation,
  // ]);

  // Helper function to convert question format
  const convertComponentQuestionToApiFormat = (questions: Question[]) => {
    return questions.map((q) => ({
      question: q.text,
      options: q.options.map((o) => o.text),
      correctAnswer: q.options.findIndex((o) => o.isCorrect),
      explanation: q.explanation,
      startTime: q.startTime,
      reinforcementQuestions: q.reinforcementQuestions || [],
    }));
  };

  /**
   * Saves the current quiz progress to the database
   */
  async function saveQuizProgress(
    progressUpdates: Partial<QuizProgressModel> = {}
  ) {
    if (!userId || !videoId) {
      console.log("Missing userId or videoId - cannot save progress");
      return;
    }

    try {
      // Prepare the complete progress object with current state
      const progress: Partial<QuizProgressModel> = {
        quizStarted: true,
        currentQuestionIndex,
        quizCompleted,
        questions: convertComponentQuestionToApiFormat(questions),
        selectedAnswers: questionStates.answerSelected,
        showExplanations: questionStates.showExplanation,
        correctAnswers: questionStates.isCorrect,
        attemptedReinforcement: questionStates.attemptedReinforcement,
        reinforcementIndex: questionStates.reinforcementIndex,
        mastered: questionStates.mastered,
        ...progressUpdates,
      };

      let result;
      // Use update by ID if we have a progressId, otherwise create new record
      if (quizProgressId) {
        result = await updateQuizProgressById(quizProgressId, progress);
      } else {
        result = await updateQuizProgress(videoId, userId, courseId, progress);
      }

      // Save the progress ID for future updates
      if (result) {
        const parsed = JSON.parse(result);
        if (parsed && parsed._id) {
          setQuizProgressId(parsed._id);
        }
      }
    } catch (error) {
      console.error("Error saving quiz progress:", error);
    }
  }

  // Auto-scroll to top when question changes
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentQuestionIndex, showReinforcement]);

  // Calculate overall mastery
  const masteryCount = questionStates.mastered.filter(Boolean).length;
  const masteryPercentage =
    questions.length > 0
      ? Math.round((masteryCount / questions.length) * 100)
      : 0;

  // Modified Quiz loading screen
  if (isLoading) {
    return (
      <div className="flex h-[500px] flex-col items-center justify-center rounded-lg bg-black/40 p-6 text-center">
        <div className="mb-6 size-10 animate-spin rounded-full border-4 border-zinc-600 border-t-[#f0bb1c]"></div>
        <p className="text-zinc-400">Loading quiz data...</p>
      </div>
    );
  }

  // If quiz is already completed, show a message
  if (quizCompleted && questions.length > 0 && quizStarted) {
    return (
      <div className="flex h-[500px] flex-col overflow-hidden rounded-lg bg-black/40 p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex h-full flex-col"
        >
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-2xl font-semibold text-white">
              Quiz Completed!
            </h3>
          </div>

          <div className="relative mb-4 flex justify-center">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-white">
                {masteryPercentage}%
              </span>
            </div>
            <svg className="size-16" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#1f2937"
                strokeWidth="8"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#f0bb1c"
                strokeLinecap="round"
                strokeWidth="8"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: masteryPercentage / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                style={{
                  transformOrigin: "center",
                  transform: "rotate(-90deg)",
                }}
              />
            </svg>
          </div>

          <div className="mb-6 rounded-lg bg-black/30 p-4 text-left">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-zinc-400">
                  Your Understanding Progress
                </h4>
                <p className="text-sm font-medium text-white">
                  You understood {masteryCount} out of {questions.length}{" "}
                  concepts
                </p>
              </div>
              <div className="hidden rounded-lg border border-zinc-800 px-3 py-1.5 md:block">
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <span className="flex items-center">
                    <span className="mr-1.5 inline-block size-2 rounded-full bg-green-500"></span>
                    Understood
                  </span>
                  <span className="flex items-center">
                    <span className="mr-1.5 inline-block size-2 rounded-full bg-amber-500"></span>
                    Needs Review
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 grid max-h-[220px] grid-cols-1 gap-3 overflow-y-auto">
              {questions.map((question, index) => (
                <div
                  key={question.id}
                  className={`flex items-center justify-between rounded-md border p-3 ${
                    questionStates.mastered[index]
                      ? "border-green-500/20 bg-green-500/5"
                      : "border-amber-500/20 bg-amber-500/5"
                  }`}
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <div
                      className={`flex size-6 min-w-6 items-center justify-center rounded-full text-xs font-medium ${
                        questionStates.mastered[index]
                          ? "bg-green-500 text-white"
                          : "bg-amber-500 text-black"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <span className="line-clamp-1 flex-1 text-sm text-zinc-300">
                      {question.text}
                    </span>
                  </div>
                  <div className="ml-2 flex shrink-0 items-center gap-2">
                    {!questionStates.mastered[index] &&
                      question.startTime > 0 && (
                        <button
                          onClick={() =>
                            handleJumpToPosition(question.startTime)
                          }
                          className="flex items-center rounded-full bg-amber-500/10 px-2 py-1 text-xs text-amber-500 hover:bg-amber-500/20"
                          title={`Jump to ${Math.floor(
                            question.startTime / 60
                          )}:${(question.startTime % 60)
                            .toString()
                            .padStart(2, "0")}`}
                        >
                          <FiPlay className="mr-1 size-3" />{" "}
                          {Math.floor(question.startTime / 60)}:
                          {(question.startTime % 60)
                            .toFixed()
                            .toString()
                            .padStart(2, "0")}
                        </button>
                      )}
                    <span
                      className={`hidden items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs sm:flex ${
                        questionStates.mastered[index]
                          ? "bg-green-500/20 text-green-500"
                          : "bg-amber-500/20 text-amber-500"
                      }`}
                    >
                      {questionStates.mastered[index] ? (
                        <>
                          <FiCheck className="mr-1 size-3" /> Understood
                        </>
                      ) : (
                        <>
                          <FiRefreshCw className="mr-1 size-3" /> Needs Review
                        </>
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto flex flex-wrap justify-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                console.log(
                  "Continue to Next Lecture clicked, calling onQuizCompleted..."
                );
                if (onQuizCompleted) {
                  onQuizCompleted();
                }
              }}
              className="flex items-center rounded-lg bg-gradient-to-r from-amber-500 to-[#f0bb1c] px-5 py-2.5 text-sm font-medium text-black shadow-md hover:shadow-lg"
            >
              <FiArrowRight className="mr-2" /> Continue to Next Lecture
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartNewAttempt}
              className="flex items-center rounded-lg border border-[#f0bb1c] bg-transparent px-5 py-2.5 text-sm font-medium text-[#f0bb1c] hover:bg-[#f0bb1c]/10"
            >
              <FiRefreshCw className="mr-2" /> Attempt New Quiz
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (showReinforcement) {
    return (
      <div className="flex h-[500px] flex-col rounded-lg bg-black/40 p-6">
        <div
          ref={contentRef}
          className="custom-scrollbar flex-1 overflow-y-auto pr-3"
        >
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center text-lg font-medium text-white">
                <span className="mr-2 flex size-6 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-black">
                  <FiHelpCircle className="size-3" />
                </span>
                Reinforcement Question
              </h3>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReturnToQuestion}
                className="rounded-md px-2 py-1 text-xs text-zinc-400 hover:bg-black/20"
              >
                Return to Question
              </motion.button>
            </div>

            {loadingReinforcement ? (
              <div className="mt-8 flex flex-col items-center justify-center">
                <div className="size-10 animate-spin rounded-full border-4 border-zinc-600 border-t-[#f0bb1c]"></div>
                <p className="mt-4 text-zinc-400">
                  Generating personalized reinforcement question...
                </p>
              </div>
            ) : reinforcementQuestion ? (
              <>
                <div className="mb-5 mt-6 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
                  <h4 className="text-base font-medium text-amber-500">
                    {reinforcementQuestion.question}
                  </h4>
                </div>

                <div className="space-y-3">
                  {reinforcementQuestion.options.map((option, index) => {
                    const isSelected =
                      reinforcementOptionId ===
                      `r-q${currentQuestionIndex + 1}-${String.fromCharCode(
                        97 + index
                      )}`;
                    const isCorrect =
                      index === reinforcementQuestion.correctAnswer &&
                      reinforcementSubmitted;
                    const isIncorrect =
                      index !== reinforcementQuestion.correctAnswer &&
                      isSelected &&
                      reinforcementSubmitted;
                    const optionLetters = ["A", "B", "C", "D"];

                    return (
                      <motion.button
                        key={`r-q${
                          currentQuestionIndex + 1
                        }-${String.fromCharCode(97 + index)}`}
                        whileHover={
                          !reinforcementSubmitted ? { scale: 1.01, x: 3 } : {}
                        }
                        whileTap={
                          !reinforcementSubmitted ? { scale: 0.99 } : {}
                        }
                        onClick={() =>
                          handleReinforcementOptionSelect(
                            `r-q${
                              currentQuestionIndex + 1
                            }-${String.fromCharCode(97 + index)}`
                          )
                        }
                        className={`flex w-full items-center rounded-md p-0.5 text-left text-sm transition-all duration-200 ${
                          isSelected
                            ? isCorrect
                              ? "bg-gradient-to-r from-green-500/20 to-green-500/10"
                              : isIncorrect
                              ? "bg-gradient-to-r from-red-500/20 to-red-500/10"
                              : "bg-gradient-to-r from-amber-500/20 to-amber-500/10"
                            : "bg-black/20 hover:bg-black/30"
                        }`}
                        disabled={reinforcementSubmitted}
                      >
                        <div
                          className={`mr-3 flex size-8 items-center justify-center rounded-md text-xs font-medium ${
                            isSelected
                              ? isCorrect
                                ? "bg-green-500 text-white"
                                : isIncorrect
                                ? "bg-red-500 text-white"
                                : "bg-amber-500 text-black"
                              : "bg-zinc-800 text-zinc-400"
                          }`}
                        >
                          {optionLetters[index]}
                        </div>

                        <span
                          className={`py-2.5 ${
                            isSelected
                              ? "font-medium text-white"
                              : "text-zinc-300"
                          }`}
                        >
                          {option}
                        </span>

                        {reinforcementSubmitted && (
                          <span className="ml-auto mr-3">
                            {index === reinforcementQuestion.correctAnswer ? (
                              <FiCheck className="text-green-500" />
                            ) : isIncorrect ? (
                              <FiX className="text-red-500" />
                            ) : null}
                          </span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {!reinforcementSubmitted ? (
                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={handleSubmitReinforcementAnswer}
                      disabled={!reinforcementOptionId}
                      className="flex w-full items-center justify-center rounded-md bg-amber-500 py-2.5 text-sm font-medium text-black hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Submit Answer
                    </button>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-6 rounded-lg border border-zinc-800 bg-black/30 p-4"
                  >
                    <h5 className="mb-2 flex items-center font-medium text-white">
                      {reinforcementSuccess ? (
                        <>
                          <span className="mr-2 inline-flex size-5 items-center justify-center rounded-full bg-green-500 text-white">
                            <FiCheck className="size-3" />
                          </span>{" "}
                          Correct
                        </>
                      ) : (
                        <>
                          <span className="mr-2 inline-flex size-5 items-center justify-center rounded-full bg-red-500 text-white">
                            <FiX className="size-3" />
                          </span>{" "}
                          Incorrect
                        </>
                      )}
                    </h5>
                    <p className="text-sm text-zinc-300">
                      {reinforcementQuestion.explanation}
                    </p>

                    <div className="mt-6 flex flex-wrap justify-center gap-2">
                      {reinforcementSuccess ? (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleReturnToQuestion}
                          className="flex items-center rounded-md bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-2 text-sm font-medium text-white"
                        >
                          <FiCheck className="mr-2" /> Continue
                        </motion.button>
                      ) : maxAttemptsReached ? (
                        <div className="text-start">
                          <p className="mb-4 text-start text-sm text-amber-500">
                            You need to review this concept again
                          </p>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleReturnToQuestion}
                            className="flex items-center rounded-md bg-amber-600 px-5 py-2 text-sm font-medium text-white hover:bg-amber-700"
                          >
                            <FiChevronRight className="mr-2" /> Continue
                          </motion.button>
                        </div>
                      ) : currentReinforcementIndex === 0 ? (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleTryNextReinforcement}
                          className="flex items-center rounded-md bg-amber-600 px-5 py-2 text-sm font-medium text-white hover:bg-amber-700"
                        >
                          Try Another Approach
                        </motion.button>
                      ) : (
                        <div className="text-center">
                          <p className="mb-4 text-sm text-amber-500">
                            You need to review this concept again
                          </p>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleReturnToQuestion}
                            className="flex items-center rounded-md bg-amber-600 px-5 py-2 text-sm font-medium text-white hover:bg-amber-700"
                          >
                            <FiChevronRight className="mr-2" /> Continue
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </>
            ) : (
              <div className="mt-6 text-center text-zinc-400">
                Something went wrong.
                <button
                  onClick={handleReturnToQuestion}
                  className="ml-2 text-[#f0bb1c] hover:underline"
                >
                  Return to question
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (loadingQuestions) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex h-[500px] flex-col items-center justify-center rounded-lg bg-black/40 p-6 text-center"
      >
        <div className="relative mb-4">
          <svg
            className="size-16 animate-spin text-[#f0bb1c]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <div className="absolute right-0 top-0 flex size-6 items-center justify-center rounded-full bg-white">
            <FiHelpCircle className="size-4 text-[#f0bb1c]" />
          </div>
        </div>

        <h3 className="mb-3 text-xl font-semibold text-white">
          Crafting Your Quiz
        </h3>
        <p className="mb-6 max-w-[280px] text-sm text-zinc-400">
          Our AI is analyzing the video and creating personalized questions to
          test your understanding.
        </p>

        <div className="w-full max-w-md space-y-1">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="h-2 w-full overflow-hidden rounded-full bg-zinc-800"
              initial={{ opacity: 0.4 + i * 0.2 }}
              animate={{ opacity: [0.4 + i * 0.2, 1, 0.4 + i * 0.2] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            >
              <motion.div
                className="h-full bg-[#f0bb1c]"
                initial={{ width: "0%" }}
                animate={{
                  width: ["0%", "100%"],
                }}
                transition={{
                  duration: 2.5,
                  ease: "easeInOut",
                  repeat: Infinity,
                  delay: i * 0.5,
                }}
              />
            </motion.div>
          ))}
        </div>

        <div className="mt-6 text-xs italic text-zinc-500">
          This will only take a few seconds...
        </div>
      </motion.div>
    );
  }

  if (quizError) {
    return (
      <div className="flex h-[500px] flex-col rounded-lg bg-black/40 p-6">
        <div
          ref={contentRef}
          className="custom-scrollbar flex-1 overflow-y-auto pr-3"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center py-8 text-center"
          >
            <div className="mb-6 flex size-24 items-center justify-center rounded-full bg-amber-500/20">
              <FiHelpCircle className="size-10 text-amber-500" />
            </div>

            <h3 className="mb-3 text-center text-2xl font-semibold text-white">
              Quiz Generation
            </h3>

            <p className="mb-8 max-w-md text-center text-sm text-zinc-300">
              We need to analyze the video content to create personalized quiz
              questions. Please click the button below to start the process.
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchQuestions}
              className="flex items-center justify-center rounded-lg bg-gradient-to-r from-amber-500 to-[#f0bb1c] px-10 py-3.5 text-base font-medium text-black shadow-md transition-all duration-200 hover:shadow-lg"
            >
              Generate Quiz
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-lg bg-black/40 p-6">
      <div ref={contentRef} className="custom-scrollbar flex-1 overflow-y-auto">
        {!quizStarted ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center py-4"
          >
            <div
              className={`mb-6 flex size-24 items-center justify-center rounded-full ${
                canStartQuiz ? "bg-green-500/20" : "bg-amber-500/20"
              }`}
            >
              {canStartQuiz ? (
                <FiPlay className="size-10 text-green-500" />
              ) : (
                <FiClock className="size-10 text-amber-500" />
              )}
            </div>

            <h3 className="mb-3 text-center text-xl font-semibold text-white">
              {canStartQuiz
                ? "Ready to Test Your Knowledge?"
                : "Keep Watching to Unlock Quiz"}
            </h3>

            <p className="mb-8 max-w-md text-center text-sm text-zinc-300">
              {canStartQuiz
                ? "You've watched enough of the video to take the quiz. Test your understanding of key concepts!"
                : `You need to watch at least 95% of the video to unlock the quiz. Current progress: ${Math.round(
                    watchedPercent
                  )}%`}
            </p>

            {canStartQuiz && (
              <>
                <p className="mb-8 max-w-md text-center text-sm text-zinc-300">
                  This quiz will test your understanding of key concepts from
                  the video. You&apos;ll need to answer multiple-choice
                  questions related to the content you just watched.
                </p>

                <div className="mb-6 flex flex-col items-start space-y-3">
                  <div className="flex items-center text-sm text-zinc-300">
                    <div className="mr-2 flex size-6 items-center justify-center rounded-full bg-green-500/20">
                      <FiCheck className="size-3 text-green-500" />
                    </div>
                    <span>Reinforced learning through targeted questions</span>
                  </div>
                  <div className="flex items-center text-sm text-zinc-300">
                    <div className="mr-2 flex size-6 items-center justify-center rounded-full bg-green-500/20">
                      <FiCheck className="size-3 text-green-500" />
                    </div>
                    <span>Detailed explanations for each answer</span>
                  </div>
                  <div className="flex items-center text-sm text-zinc-300">
                    <div className="mr-2 flex size-6 items-center justify-center rounded-full bg-green-500/20">
                      <FiCheck className="size-3 text-green-500" />
                    </div>
                    <span>Track your concept mastery</span>
                  </div>
                </div>
              </>
            )}

            <motion.button
              whileHover={canStartQuiz ? { scale: 1.05 } : {}}
              whileTap={canStartQuiz ? { scale: 0.95 } : {}}
              onClick={fetchQuestions}
              disabled={!canStartQuiz}
              className={`flex items-center justify-center rounded-lg px-10 py-3.5 text-base font-medium transition-all duration-200 ${
                canStartQuiz
                  ? "bg-gradient-to-r from-amber-500 to-[#f0bb1c] text-black shadow-md hover:shadow-lg"
                  : "cursor-not-allowed bg-zinc-700 text-zinc-400 opacity-50"
              }`}
            >
              {canStartQuiz ? (
                <>Start Quiz</>
              ) : (
                <>
                  <FiLock className="mr-2" /> Quiz Locked
                </>
              )}
            </motion.button>
          </motion.div>
        ) : (
          <>
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center text-lg font-medium text-white">
                  <span className="mr-2 flex size-6 items-center justify-center rounded-full bg-[#f0bb1c] text-xs font-bold text-black">
                    {currentQuestionIndex + 1}
                  </span>
                  Quiz Question
                </h3>
                <div className="flex items-center gap-2">
                  <p className="rounded-full bg-black/30 px-3 py-1 text-sm font-medium text-zinc-400">
                    {currentQuestionIndex + 1} of {questions.length}
                  </p>
                </div>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                <motion.div
                  initial={{
                    width: `${
                      (currentQuestionIndex / questions.length) * 100
                    }%`,
                  }}
                  animate={{
                    width: `${
                      ((currentQuestionIndex + (hasSubmitted ? 1 : 0)) /
                        questions.length) *
                      100
                    }%`,
                  }}
                  className="h-1.5 rounded-full bg-gradient-to-r from-amber-500 to-[#f0bb1c]"
                  transition={{ duration: 0.5 }}
                />
              </div>

              {/* Concept mastery indicator */}
              {questionStates.mastered[currentQuestionIndex] && (
                <div className="mt-2 flex items-center justify-end">
                  <span className="flex items-center rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-500">
                    <FiCheck className="mr-1 size-3" /> Concept understood
                  </span>
                </div>
              )}
            </div>

            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="mb-6"
            >
              <div className="mb-5 rounded-lg border border-zinc-800 bg-black/40 p-4">
                <h4 className="text-base font-medium text-white">
                  {currentQuestion?.text}
                </h4>
              </div>

              <div className="space-y-3">
                {currentQuestion?.options.map((option, index) => {
                  const isSelected = selectedOptionId === option.id;
                  const isCorrect = option.isCorrect && hasSubmitted;
                  const isIncorrect =
                    !option.isCorrect && isSelected && hasSubmitted;
                  const optionLetters = ["A", "B", "C", "D"];

                  return (
                    <motion.button
                      key={option.id}
                      whileHover={!hasSubmitted ? { scale: 1.01, x: 3 } : {}}
                      whileTap={!hasSubmitted ? { scale: 0.99 } : {}}
                      onClick={() => handleOptionSelect(option.id)}
                      className={`flex w-full items-center rounded-md p-0.5 text-left text-sm transition-all duration-200 ${
                        isSelected
                          ? isCorrect
                            ? "bg-gradient-to-r from-green-500/20 to-green-500/10"
                            : isIncorrect
                            ? "bg-gradient-to-r from-red-500/20 to-red-500/10"
                            : "bg-gradient-to-r from-[#f0bb1c]/20 to-[#f0bb1c]/10"
                          : "bg-black/20 hover:bg-black/30"
                      }`}
                      disabled={hasSubmitted}
                    >
                      <div
                        className={`mr-3 flex size-8 items-center justify-center rounded-md text-xs font-medium ${
                          isSelected
                            ? isCorrect
                              ? "bg-green-500 text-white"
                              : isIncorrect
                              ? "bg-red-500 text-white"
                              : "bg-[#f0bb1c] text-black"
                            : "bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        {optionLetters[index]}
                      </div>

                      <span
                        className={`py-2.5 ${
                          isSelected
                            ? "font-medium text-white"
                            : "text-zinc-300"
                        }`}
                      >
                        {option.text}
                      </span>

                      {hasSubmitted && (
                        <span className="ml-auto mr-3">
                          {option.isCorrect ? (
                            <FiCheck className="text-green-500" />
                          ) : isIncorrect ? (
                            <FiX className="text-red-500" />
                          ) : null}
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            <AnimatePresence>
              {hasSubmitted && (
                <motion.div
                  initial={{ opacity: 0, y: 20, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -20, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mb-6 rounded-lg border border-zinc-800 bg-black/40 p-4"
                >
                  <h5 className="mb-2 flex items-center font-medium text-white">
                    {questionStates.isCorrect[currentQuestionIndex] ? (
                      <>
                        <span className="mr-2 inline-flex size-5 items-center justify-center rounded-full bg-green-500 text-white">
                          <FiCheck className="size-3" />
                        </span>{" "}
                        Correct Answer
                      </>
                    ) : (
                      <>
                        <span className="mr-2 inline-flex size-5 items-center justify-center rounded-full bg-red-500 text-white">
                          <FiX className="size-3" />
                        </span>{" "}
                        Incorrect Answer
                      </>
                    )}
                  </h5>
                  <p className="text-sm text-zinc-300">
                    {currentQuestion?.explanation}
                  </p>

                  {!questionStates.isCorrect[currentQuestionIndex] &&
                    !questionStates.attemptedReinforcement[
                      currentQuestionIndex
                    ] && (
                      <div className="mt-4 flex justify-center">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleStartReinforcement}
                          className="flex items-center rounded-md bg-amber-500 px-4 py-2 text-xs font-semibold text-black hover:bg-amber-600"
                        >
                          <FiHelpCircle className="mr-2" /> Try Reinforcement
                          Question
                        </motion.button>
                      </div>
                    )}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      {quizStarted && questions.length > 0 && (
        <div className="mt-4 flex justify-between border-t border-zinc-800 pt-4">
          {!hasSubmitted ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmitAnswer}
              disabled={!selectedOptionId}
              className="flex w-full items-center justify-center rounded-md bg-[#f0bb1c] py-2.5 font-medium text-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              Submit Answer
            </motion.button>
          ) : (
            <>
              <div className="flex gap-2">
                {currentQuestionIndex > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05, x: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePreviousQuestion}
                    className="flex items-center rounded-md border border-zinc-700 bg-black/30 px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-black/50"
                  >
                    <FiChevronLeft className="mr-1" /> Previous
                  </motion.button>
                )}
              </div>

              {/* Next button - disabled when showing reinforcement questions or when answer is incorrect without reinforcement */}
              <motion.button
                whileHover={{ scale: 1.05, x: 2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNextQuestion}
                disabled={
                  showReinforcement ||
                  (!questionStates.isCorrect[currentQuestionIndex] &&
                    !questionStates.attemptedReinforcement[
                      currentQuestionIndex
                    ] &&
                    !maxAttemptsReached)
                }
                className={`flex items-center rounded-md px-4 py-2 text-sm font-medium ${
                  showReinforcement ||
                  (!questionStates.isCorrect[currentQuestionIndex] &&
                    !questionStates.attemptedReinforcement[
                      currentQuestionIndex
                    ] &&
                    !maxAttemptsReached)
                    ? "cursor-not-allowed bg-zinc-700 text-zinc-400 opacity-50"
                    : isLastQuestion
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                    : "bg-gradient-to-r from-amber-500 to-[#f0bb1c] text-black"
                }`}
              >
                {isLastQuestion ? "Finish Quiz" : "Next Question"}{" "}
                <FiChevronRight className="ml-1" />
              </motion.button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CoursePracticeQuiz;
