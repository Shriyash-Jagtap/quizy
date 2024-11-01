// app/quizzes/[id]/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { useEffect, useState } from 'react';
import 'katex/dist/katex.min.css'; // Import KaTeX CSS for styling
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import {
  Clock,
  Pause,
  Play,
  RotateCcw,
  BookOpen,
  FileText,
  AlertCircle,
  ChevronLeft,
  Menu,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';
import MarkdownRenderer from '@/components/MarkdownRenderer'; 
import Confetti from '@/components/ui/confetti';

interface Option {
  id: number;
  option_text: string;
  is_correct: boolean;
}

interface NumericAnswer {
  exact_answer?: number;
  range_min?: number;
  range_max?: number;
}

interface Question {
  id: number;
  question_text: string;
  question_type: string;
  marks: number;
  solution: string;
  options?: Option[];
  numeric_answer?: NumericAnswer;
}

interface Quiz {
  id: number;
  code: string;
  set: string;
  subject_id: number;
  quiz_category: string;
  created_at: string;
  updated_at: string;
}

interface QuestionFeedback {
  marksEarned: number;
  correctOptions: Option[]; 
  userSelectedOptions: number[]; 
  isNumericCorrect: boolean; 
  correctAnswer?: number | { range_min: number; range_max: number }; 
}

export default function QuizPage() {
  const { id } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [time, setTime] = useState(3600); // 60 minutes in seconds
  const [isPaused, setIsPaused] = useState(false);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [totalMarks, setTotalMarks] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Record<number, QuestionFeedback>>({});

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const quizResponse = await supabase
          .from('quizzes')
          .select('*')
          .eq('id', Number(id))
          .single();

        if (quizResponse.error) throw quizResponse.error;

        const questionsResponse = await supabase
          .from('questions')
          .select(`
            id,
            question_text,
            question_type,
            marks,
            solution,
            options:options (
              id,
              option_text,
              is_correct
            ),
            numeric_answer:numeric_answers!numeric_answers_question_id_fkey (
              exact_answer,
              range_min,
              range_max
            )
          `)
          .eq('quiz_id', quizResponse.data.id)
          .order('id', { ascending: true });

        if (questionsResponse.data) {
          const transformedQuestions = questionsResponse.data.map((question) => ({
            ...question,
            numeric_answer: question.numeric_answer ? question.numeric_answer[0] : undefined, 
          }));

          setQuestions(transformedQuestions);
        } else {
          console.error("No questions found or an error occurred while fetching questions.");
          setQuestions([]); 
        }

        if (questionsResponse.error) throw questionsResponse.error;

        setQuiz(quizResponse.data);
      } catch (error: any) {
        setError(
          error instanceof Error ? error.message : 'An unexpected error occurred'
        );
        console.error('Error fetching quiz data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [id]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!isPaused && time > 0) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPaused, time]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(
      secs
    ).padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId: number, answer: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const calculateMarks = () => {
    let total = 0;
    const newFeedback: Record<number, QuestionFeedback> = {};
  
    questions.forEach((question) => {
      const userAnswer = answers[question.id];
      const correctMarks = question.marks;
      let marksEarned = 0;
      let correctOptions: Option[] = [];
      let userSelectedOptions: number[] = [];
      let isNumericCorrect = false;
      let correctAnswer: number | { range_min: number; range_max: number } | undefined;

      if (question.question_type === 'multiple_choice') {
        const correctOption = question.options?.find((option) => option.is_correct);
        correctOptions = correctOption ? [correctOption] : [];
        userSelectedOptions = userAnswer ? [userAnswer] : [];

        if (correctOption && userAnswer === correctOption.id) {
          marksEarned = correctMarks;
        }
      } else if (question.question_type === 'multiple_select') {
        const correctOptionList = question.options?.filter((option) => option.is_correct) || [];
        correctOptions = correctOptionList;
        userSelectedOptions = Array.isArray(userAnswer) ? userAnswer : [];

        const selectedCorrectOptions = userSelectedOptions.filter((id) =>
          correctOptionList.some((option) => option.id === id)
        );
        const hasIncorrectSelection = userSelectedOptions.some(
          (id) => !correctOptionList.some((option) => option.id === id)
        );

        if (!hasIncorrectSelection && selectedCorrectOptions.length > 0) {
          const partialMarks =
            (correctMarks * selectedCorrectOptions.length) / correctOptionList.length;
          marksEarned = partialMarks;
        } else {
          marksEarned = 0;
        }
      } else if (question.question_type === 'numeric_input') {
        const correctValue = question.numeric_answer?.exact_answer;
        correctAnswer = correctValue;
        const userValue = parseFloat(userAnswer);
        if (
          correctValue !== undefined &&
          !isNaN(userValue) &&
          userValue === correctValue
        ) {
          marksEarned = correctMarks;
          isNumericCorrect = true;
        }
      } else if (question.question_type === 'numeric_range') {
        const rangeMin = question.numeric_answer?.range_min;
        const rangeMax = question.numeric_answer?.range_max;
        correctAnswer = { range_min: rangeMin!, range_max: rangeMax! };
        const userValue = parseFloat(userAnswer);
        if (
          rangeMin !== undefined &&
          rangeMax !== undefined &&
          !isNaN(userValue) &&
          userValue >= rangeMin &&
          userValue <= rangeMax
        ) {
          marksEarned = correctMarks;
          isNumericCorrect = true;
        }
      }

      total += marksEarned;

      newFeedback[question.id] = {
        marksEarned,
        correctOptions,
        userSelectedOptions,
        isNumericCorrect,
        correctAnswer,
      };
    });

    setTotalMarks(total);
    setFeedback(newFeedback); 
  };
  // Timer Component
  const TimerComponent = () => (
    <div className="bg-gray-900 rounded-lg p-4 mb-8">
      <div className="text-2xl font-bold text-center mb-4">
        {formatTime(time)}
      </div>
      <div className="flex justify-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsPaused(!isPaused)}
          className="bg-gray-800 hover:bg-gray-700 text-white"
          aria-label={isPaused ? 'Play Timer' : 'Pause Timer'}
        >
          {isPaused ? (
            <Play className="h-4 w-4 text-blue-400" />
          ) : (
            <Pause className="h-4 w-4 text-blue-400" />
          )}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTime(3600)}
          className="bg-gray-800 hover:bg-gray-700 text-white"
          aria-label="Reset Timer"
        >
          <RotateCcw className="h-4 w-4 text-blue-400" />
        </Button>
      </div>
    </div>
  );

  // Submit Button Component
  const SubmitButtonComponent = () => (
    <motion.div
      className="mt-auto w-full"
      whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
      whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
    >
      <Button
        className={`w-full h-12 relative overflow-hidden ${
          isSubmitting ? 'bg-blue-600/50 cursor-not-allowed' : 'bg-blue-600'
        } hover:bg-blue-500 transition-colors`}
        disabled={isSubmitting || totalMarks !== null}
        onClick={handleSubmit}
        aria-label="Submit Exam"
      >
        {isSubmitting ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Clock className="w-5 h-5" />
            </motion.div>
          </div>
        ) : totalMarks !== null ? (
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <span>Submitted</span>
          </div>
        ) : (
          <span>Submit Exam</span>
        )}
      </Button>
    </motion.div>
  );
  
  

  // Updated handleSubmit with try-catch-finally to ensure isSubmitting is reset
  const handleSubmit = async () => {
    if (isSubmitting || totalMarks !== null) return; // Prevent multiple submissions

    setIsSubmitting(true);
    try {
      // Simulate loading for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      calculateMarks();
      setShowConfetti(true);
    } catch (error) {
      console.error('Error submitting exam:', error);
      // Optionally, set an error state here to display to the user
    } finally {
      setIsSubmitting(false);
      // Hide confetti after 3 seconds
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  // Conditional Rendering based on Loading and Error States
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Clock className="w-8 h-8 text-blue-400" />
        </motion.div>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-red-500 bg-red-500/10 p-6 rounded-lg">
          Error: {error}
        </div>
      </div>
    );

  if (!quiz)
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-gray-400">Quiz not found.</div>
      </div>
    );

  return (
    <div className="flex flex-col min-h-screen bg-black text-white overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 lg:px-6 h-16 flex items-center justify-between border-b border-gray-800 bg-black/90 backdrop-blur-sm after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-gradient-to-r after:from-transparent after:via-blue-500/50 after:to-transparent">
        <Link href="/" className="flex items-center">
          <motion.span
            className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400"
            whileHover={{ scale: 1.05 }}
          >
            Quizify
          </motion.span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle Menu"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black pt-16"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <nav className="flex flex-col items-center gap-4 p-4 overflow-y-auto h-full">
              <Link
                href="/"
                className="text-lg font-medium hover:text-gray-300 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              {/* Add more navigation links here if needed */}
              <Button className="w-full mt-4">Get Started</Button>

              {/* Timer */}
              <div className="w-full mt-6">
                <TimerComponent />
              </div>

              {/* Submit Button */}
              <div className="w-full mt-4">
                <SubmitButtonComponent />
              </div>

              {/* Display Total Marks */}
              <AnimatePresence>
                {totalMarks !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="mt-4 p-4 rounded-lg bg-green-500/20 border border-green-500/30"
                  >
                    <div className="text-center">
                      <div className="text-sm text-green-400 mb-1">Total Score</div>
                      <div className="text-2xl font-bold text-green-300">
                        {totalMarks}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 pt-16 flex">
        {/* Sidebar */}
        <div className="hidden md:block w-[30vw] border-r border-gray-800/50 bg-gray-950/80 backdrop-blur-sm p-6 flex flex-col fixed h-[92vh] top-16 overflow-y-auto">
          <Link
            href="/subjects"
            className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-8"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Subjects
          </Link>

          {/* Exam Info */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center space-x-2 text-gray-400">
              <FileText className="h-4 w-4" />
              <span>Exam: {quiz.quiz_category}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-400">
              <BookOpen className="h-4 w-4" />
              <span>Set: {quiz.set}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-400">
              <AlertCircle className="h-4 w-4" />
              <span>Code: {quiz.code}</span>
            </div>
          </div>

          {/* Question Navigation */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-400 mb-4">Questions</h3>
            <div className="grid grid-cols-9 gap-2">
              {questions.map((question, index) => (
                <motion.button
                  key={question.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center font-medium transition-colors ${
                    answers[question.id]
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                  onClick={() => {
                    const element = document.getElementById(`question-${question.id}`);
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  aria-label={`Go to question ${index + 1}`}
                >
                  {index + 1}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Timer */}
          <TimerComponent />

          {/* Submit Button */}
          <SubmitButtonComponent />

          {/* Display Total Marks */}
          <AnimatePresence>
            {totalMarks !== null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="mt-4 p-4 rounded-lg bg-green-500/20 border border-green-500/30"
              >
                <div className="text-center">
                  <div className="text-sm text-green-400 mb-1">Total Score</div>
                  <div className="text-2xl font-bold text-green-300">
                    {totalMarks}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Questions Section - Scrollable */}
        <div className="flex-1 ml-0 md:ml-[30vw] overflow-y-auto pb-8 h-full">
          <Confetti showConfetti={showConfetti}/>
          <div className="p-4 md:p-8">
            {questions.map((question, index) => (
              <motion.div
                key={question.id}
                id={`question-${question.id}`}
                className="mb-12 bg-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-xl p-6 md:p-8 hover:border-gray-700/50 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                  <div className="flex justify-between items-center mb-4 md:mb-6">
                    <h2 className="text-lg md:text-xl font-semibold">
                      Question {index + 1}
                    </h2>
                    <span className="text-gray-400 text-sm md:text-base">
                      Marks: {question.marks}
                    </span>
                  </div>

                  {/* Render Markdown and LaTeX in question text */}
                  <MarkdownRenderer content={question.question_text} />

                  {/* Multiple Choice Question */}
                  {question.question_type === 'multiple_choice' && question.options && (
                    <div className="space-y-3 mt-4 md:mt-6">
                      {question.options.map((option) => {
                        const isSelected = answers[question.id] === option.id;
                        const isCorrect = option.is_correct;
                        const feedbackForQuestion = feedback[question.id];
                        let optionClass = 'form-radio text-blue-500 rounded-full border-gray-600 bg-gray-800';

                        if (totalMarks !== null && feedbackForQuestion) {
                          if (isSelected && isCorrect) {
                            optionClass += ' border-green-500 text-green-500';
                          } else if (isSelected && !isCorrect) {
                            optionClass += ' border-red-500 text-red-500';
                          }
                        }

                        return (
                          <motion.label
                            key={option.id}
                            className="flex items-center space-x-3 p-3 md:p-4 rounded-lg border border-gray-800 cursor-pointer transition-colors"
                            whileHover={{ scale: 1.0 }}
                            whileTap={{ scale: 0.99 }}
                          >
                            <input
                              type="radio"
                              name={`question_${question.id}`}
                              value={option.id}
                              checked={isSelected}
                              disabled={totalMarks !== null}
                              onChange={() => handleAnswerChange(question.id, option.id)}
                              className={optionClass}
                              aria-label={`Option ${option.id}`}
                            />
                            {/* Render Markdown and LaTeX in option text */}
                            <MarkdownRenderer
                              content={option.option_text}
                              className={`${
                                totalMarks !== null && isSelected
                                  ? isCorrect
                                    ? 'text-green-400'
                                    : 'text-red-400'
                                  : ''
                              }`}
                            />
                          </motion.label>
                        );
                      })}
                    </div>
                  )}

                  {/* Multiple Select Question */}
                  {question.question_type === 'multiple_select' && question.options && (
                    <div className="space-y-3 mt-4 md:mt-6">
                      {question.options.map((option) => {
                        const isSelected =
                          Array.isArray(answers[question.id]) &&
                          answers[question.id].includes(option.id);
                        const isCorrect = option.is_correct;
                        const feedbackForQuestion = feedback[question.id];
                        let optionClass = 'form-checkbox text-blue-500 rounded border-gray-600 bg-gray-800';

                        if (totalMarks !== null && feedbackForQuestion) {
                          if (isSelected && isCorrect) {
                            optionClass += ' border-green-500 text-green-500';
                          } else if (isSelected && !isCorrect) {
                            optionClass += ' border-red-500 text-red-500';
                          }
                        }

                        return (
                          <motion.label
                            key={option.id}
                            className="flex items-center space-x-3 p-3 md:p-4 rounded-lg border border-gray-800 cursor-pointer transition-colors"
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                          >
                            <input
                              type="checkbox"
                              name={`question_${question.id}`}
                              value={option.id}
                              checked={isSelected}
                              disabled={totalMarks !== null}
                              onChange={(e) => {
                                const currentAnswers = Array.isArray(answers[question.id])
                                  ? answers[question.id]
                                  : [];
                                const newAnswer = e.target.checked
                                  ? [...currentAnswers, option.id]
                                  : currentAnswers.filter((id: number) => id !== option.id);
                                handleAnswerChange(question.id, newAnswer);
                              }}
                              className={optionClass}
                              aria-label={`Option ${option.id}`}
                            />
                            {/* Render Markdown and LaTeX in option text */}
                            <MarkdownRenderer
                              content={option.option_text}
                              className={`${
                                totalMarks !== null && isSelected
                                  ? isCorrect
                                    ? 'text-green-400'
                                    : 'text-red-400'
                                  : ''
                              }`}
                            />
                          </motion.label>
                        );
                      })}
                    </div>
                  )}

                  {/* Numeric Input and Numeric Range Questions */}
                  {(question.question_type === 'numeric_input' ||
                    question.question_type === 'numeric_range') && (
                    <div className="mt-4 md:mt-6">
                      <input
                        type="number"
                        value={answers[question.id] || ''}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        placeholder="Enter your answer"
                        disabled={totalMarks !== null}
                        className={`w-full px-3 py-2 md:px-4 md:py-3 bg-gray-900 border ${
                          totalMarks !== null
                            ? feedback[question.id]?.isNumericCorrect
                              ? 'border-green-500'
                              : 'border-red-500'
                            : 'border-gray-800'
                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          totalMarks !== null
                            ? 'bg-gray-800 cursor-not-allowed'
                            : ''
                        }`}
                        aria-label="Numeric Answer Input"
                      />
                      {totalMarks !== null && (
                        <div className="mt-2 text-sm md:text-base">
                          {question.question_type === 'numeric_input' && (
                            <span
                              className={`${
                                feedback[question.id]?.isNumericCorrect
                                  ? 'text-green-400'
                                  : 'text-red-400'
                              }`}
                            >
                              Correct Answer: {question.numeric_answer?.exact_answer}
                            </span>
                          )}
                          {question.question_type === 'numeric_range' && (
                            <span
                              className={`${
                                feedback[question.id]?.isNumericCorrect
                                  ? 'text-green-400'
                                  : 'text-red-400'
                              }`}
                            >
                              Correct Range: {question.numeric_answer?.range_min} -{' '}
                              {question.numeric_answer?.range_max}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Solution Section (Initially Hidden) */}
                  <details className="mt-4 md:mt-6">
                    <summary className="text-blue-500 hover:underline cursor-pointer">
                      View Solution
                    </summary>
                    <MarkdownRenderer content={question.solution} />
                  </details>

                  {/* Feedback After Submission */}
                  {totalMarks !== null && feedback[question.id] && (
                    <div className="mt-4 md:mt-6 p-3 md:p-4 bg-gray-800 rounded-lg">
                      {/* Display Correct Answers */}
                      {question.question_type === 'multiple_choice' && (
                        <div className="mb-2 text-sm md:text-base">
                          <strong>Correct Answer:</strong>{' '}
                     
                          <MarkdownRenderer content={`${feedback[question.id].correctOptions.map((opt) => opt.option_text).join(', ')}`} />
                        </div>
                      )}

                      {question.question_type === 'multiple_select' && (
                        <div className="mb-2 text-sm md:text-base">
                          <strong>Correct Answers:</strong>{' '}
                          <MarkdownRenderer content={`${feedback[question.id].correctOptions.map((opt) => opt.option_text).join(', ')}`} />
                        </div>
                      )}

                      {(question.question_type === 'numeric_input' ||
                        question.question_type === 'numeric_range') && (
                        <div className="mb-2 text-sm md:text-base">
                          <strong>Correct Answer:</strong>{' '}
                          
                          {question.question_type === 'numeric_input'
                            ? <MarkdownRenderer content={`${question.numeric_answer?.exact_answer}`} />
                            : <MarkdownRenderer content={`${question.numeric_answer?.range_min} - ${question.numeric_answer?.range_max}`} />}
                        </div>
                      )}

                      {/* Display Marks Earned */}
                      <div className="text-sm md:text-base">
                        <strong>Marks Earned:</strong> {feedback[question.id].marksEarned} /{' '}
                        {question.marks}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    
  );
}
