'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { Button } from "@/components/ui/button";
import { BookOpen,Menu, ArrowLeft, Clock, Activity, Award } from 'lucide-react';

interface Quiz {
  id: number;
  code: string;
  set: string;
  subject_id: number;
  quiz_category: string;
  created_at: string;
  updated_at: string;
}

export default function SubjectPage() {
  const { id } = useParams();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const fetchQuizzes = async () => {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('subject_id', Number(id));

      if (error) {
        setError(error.message);
      } else if (data) {
        setQuizzes(data);
      }
      setLoading(false);
    };

    fetchQuizzes();
  }, [id]);

  const categories = Array.from(new Set(quizzes.map(quiz => quiz.quiz_category)));
  
  const filteredQuizzes = quizzes.filter(quiz => 
    selectedCategory === 'all' || quiz.quiz_category === selectedCategory
  );

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center w-full py-12">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <Clock className="w-8 h-8 text-blue-400" />
      </motion.div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <header className="fixed top-0 left-0 right-0 z-50 px-4 lg:px-6 h-16 flex items-center justify-between border-b border-gray-800 backdrop-blur-md bg-black/50">
  <Link className="flex items-center" href="/">
    <motion.span 
      className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400"
      whileHover={{ scale: 1.05 }}
    >
      Quizify
    </motion.span>
  </Link>

  {/* Desktop Navigation */}
  <nav className="hidden md:flex items-center gap-6 ml-auto">
    <Link className="text-sm font-medium text-gray-400 hover:text-white transition-colors" href="#">Features</Link>
    <Link className="text-sm font-medium text-gray-400 hover:text-white transition-colors" href="#">About</Link>
    {/* <Link className="text-sm font-medium text-gray-400 hover:text-white transition-colors" href="#">Pricing</Link>
    <Button variant="ghost" className="text-gray-400">Sign In</Button> */}
    <Button>Get Started</Button>
  </nav>

  {/* Mobile Menu Button */}
  <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
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
              <Link className="text-lg font-medium hover:text-gray-300 transition-colors" href="#">Features</Link>
              <Link className="text-lg font-medium hover:text-gray-300 transition-colors" href="#">Resources</Link>
              <Link className="text-lg font-medium hover:text-gray-300 transition-colors" href="#">Pricing</Link>
              <Button variant="ghost" className="text-gray-400">Sign In</Button>
              <Button className="w-full mt-4">Get Started</Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
      <main className="flex-1 pt-16">
        <section className="w-full py-16 md:py-24 relative overflow-hidden">
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-purple-800/20 to-blue-800/20"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.3, 0.5],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
          <div className="container px-4 md:px-6 relative">
            <Link href="/subjects" className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-8">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Subjects
            </Link>
            <motion.div 
              className="flex flex-col items-center text-center space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <BookOpen className="h-12 w-12 text-blue-400" />
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                  Available Quizzes
                </span>
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl">
                Choose a quiz to test your knowledge and track your progress.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="w-full py-8 bg-gray-950 min-h-[60vh]">
          <div className="container px-4 md:px-6">
            <div className="flex flex-wrap gap-2 mb-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
                onClick={() => setSelectedCategory('all')}
              >
                All Categories
              </motion.button>
              {categories.map((category) => (
                <motion.button
                  key={category}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </motion.button>
              ))}
            </div>

            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <motion.div 
                className="text-center text-red-500 bg-red-500/10 p-6 rounded-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {error}
              </motion.div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div 
                  key={selectedCategory}
                  className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {filteredQuizzes.length === 0 ? (
                    <motion.div 
                      className="col-span-full text-center text-gray-400 py-12"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      No quizzes available in this category
                    </motion.div>
                  ) : (
                    filteredQuizzes.map((quiz) => (
                      <motion.div
                        key={quiz.id}
                        className="group relative flex flex-col space-y-4 p-6 rounded-xl border border-gray-800 bg-gray-900/50 hover:bg-gray-900/80 transition-all duration-200"
                        whileHover={{ scale: 1.02, y: -5 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div className="flex justify-between items-start">
                          <Activity className="h-8 w-8 text-blue-400 group-hover:text-blue-300 transition-colors" />
                          <span className="text-sm px-3 py-1 rounded-full bg-gray-800 text-gray-300">
                            {quiz.quiz_category.charAt(0).toUpperCase() + quiz.quiz_category.slice(1)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold group-hover:text-blue-400 transition-colors">
                            Set {quiz.set}
                          </h3>
                          <p className="text-gray-400 mt-2">
                            Quiz Code: {quiz.code}
                          </p>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-400">
                          <div className="flex items-center">
                            <Award className="h-4 w-4 mr-1" />
                            <span>10 Questions</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{quiz.quiz_category.toLowerCase() === "end term" ? "90 mins" : "60 mins"}</span>
                          </div>
                        </div>
                        <Link href={`/quizzes/${quiz.id}`} className="block mt-4">
                          <Button className="w-full bg-blue-600 hover:bg-blue-500 transition-colors">
                            Start Quiz
                          </Button>
                        </Link>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </section>
      </main>

      <footer className="w-full py-8 px-4 md:px-6 border-t border-gray-800">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">© 2024 Quizify. All rights reserved.</p>
          <nav className="flex gap-6">
            <Link className="text-sm text-gray-400 hover:text-white transition-colors" href="#">Terms</Link>
            <Link className="text-sm text-gray-400 hover:text-white transition-colors" href="#">Privacy</Link>
            <Link className="text-sm text-gray-400 hover:text-white transition-colors" href="#">Contact</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
