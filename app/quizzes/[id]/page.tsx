// app/quizzes/[id]/page.tsx

'use client';

import { useEffect, useState } from 'react';
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
  Activity,
  Award,
  Menu,
} from 'lucide-react';
import Link from 'next/link';
import MarkdownRenderer from '@/components/MarkdownRenderer'; // Import the MarkdownRenderer component

interface Option {
  id: number;
  option_text: string;
  is_correct: boolean;
}

interface Question {
  id: number;
  question_text: string;
  question_type: string;
  marks: number;
  solution: string;
  options?: Option[];
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

export default function QuizPage() {
  const { id } = useParams();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [time, setTime] = useState(3600); // 60 minutes in seconds
  const [isPaused, setIsPaused] = useState(false);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
            )
          `)
          .eq('quiz_id', quizResponse.data.id);

        if (questionsResponse.error) throw questionsResponse.error;

        setQuiz(quizResponse.data);
        setQuestions(questionsResponse.data);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : 'An unexpected error occurred'
        );
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

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center w-full py-12">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      >
        <Clock className="w-8 h-8 text-blue-400" />
      </motion.div>
    </div>
  );

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
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 lg:px-6 h-16 flex items-center justify-between border-b border-gray-800 bg-black">
        <Link href="/" className="flex items-center">
          <motion.span
            className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400"
            whileHover={{ scale: 1.05 }}
          >
            Quizify
          </motion.span>
        </Link>
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
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
            <nav className="flex flex-col items-center gap-4 p-4">
              <Link
                href="/"
                className="text-lg font-medium hover:text-gray-300 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              {/* Add more navigation links here if needed */}
              <Button className="w-full mt-4">Get Started</Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex flex-1 pt-16">
        {/* Left Sidebar */}
        <div className="w-96 border-r border-gray-800 bg-gray-950 p-6 flex flex-col">
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
            <div className="grid grid-cols-5 gap-2">
              {questions.map((question, index) => (
                <motion.button
                  key={question.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-12 h-12 rounded-lg flex items-center justify-center font-medium transition-colors ${
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
                >
                  {index + 1}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Timer */}
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
    >
      {isPaused ? <Play className="h-4 w-4 text-blue-400" /> : <Pause className="h-4 w-4 text-blue-400" />}
    </Button>
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTime(3600)}
      className="bg-gray-800 hover:bg-gray-700 text-white"
    >
      <RotateCcw className="h-4 w-4 text-blue-400" />
    </Button>
  </div>
</div>


          {/* Submit Button */}
          <Button
            className="mt-auto bg-blue-600 hover:bg-blue-500"
            size="lg"
            onClick={() => {
              // Handle quiz submission logic here
              // You can validate answers, calculate scores, and navigate to a results page
              console.log('Submitted Answers:', answers);
            }}
          >
            Submit Exam
          </Button>
        </div>

        {/* Questions Section */}
        <div className="flex-1 p-8 overflow-y-auto">
          {questions.map((question, index) => (
            <motion.div
              key={question.id}
              id={`question-${question.id}`}
              className="mb-12 bg-gray-900/50 border border-gray-800 rounded-xl p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">
                  Question {index + 1}
                </h2>
                <span className="text-gray-400">
                  Marks: {question.marks}
                </span>
              </div>

              {/* Render Markdown and LaTeX in question text */}
              <MarkdownRenderer content={question.question_text} />

              {question.question_type === 'multiple_choice' && question.options && (
                <div className="space-y-4 mt-6">
                  {question.options.map((option) => (
                    <motion.label
                      key={option.id}
                      className="flex items-center space-x-3 p-4 rounded-lg border border-gray-800 bg-gray-900/30 hover:bg-gray-900/50 cursor-pointer transition-colors"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <input
                        type="checkbox"
                        name={`question_${question.id}`}
                        value={option.id}
                        checked={
                          Array.isArray(answers[question.id]) &&
                          answers[question.id].includes(option.id)
                        }
                        onChange={(e) => {
                          const currentAnswers = Array.isArray(answers[question.id])
                            ? answers[question.id]
                            : [];
                          const newAnswer = e.target.checked
                            ? [...currentAnswers, option.id]
                            : currentAnswers.filter((id: number) => id !== option.id);
                          handleAnswerChange(question.id, newAnswer);
                        }}
                        className="form-checkbox text-blue-500 rounded border-gray-600 bg-gray-800"
                      />
                      {/* Render Markdown and LaTeX in option text */}
                      <MarkdownRenderer content={option.option_text} />
                    </motion.label>
                  ))}
                </div>
              )}

              {question.question_type === 'numeric_input' && (
                <input
                  type="number"
                  value={answers[question.id] || ''}
                  onChange={(e) =>
                    handleAnswerChange(question.id, e.target.value)
                  }
                  placeholder="Enter your answer"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mt-6"
                />
              )}

              {/* Solution Section (Initially Hidden) */}
              <details className="mt-6">
                <summary className="text-blue-500 hover:underline cursor-pointer">
                  View Solution
                </summary>
                <MarkdownRenderer content={question.solution} />
              </details>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-8 px-4 md:px-6 border-t border-gray-800 bg-black">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">© 2024 Quizify. All rights reserved.</p>
          <nav className="flex gap-6">
            <Link
              className="text-sm text-gray-400 hover:text-white transition-colors"
              href="#"
            >
              Terms
            </Link>
            <Link
              className="text-sm text-gray-400 hover:text-white transition-colors"
              href="#"
            >
              Privacy
            </Link>
            <Link
              className="text-sm text-gray-400 hover:text-white transition-colors"
              href="#"
            >
              Contact
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
