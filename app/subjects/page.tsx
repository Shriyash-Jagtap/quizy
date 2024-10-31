"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Menu, BookOpen, SquareMenu, Search, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface Category {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface Subject {
  id: number;
  name: string;
  description: string;
  category_id: number;
  created_at: string;
  updated_at: string;
  category: Category;
}

const isValidSubject = (value: unknown): value is Subject => {
  const subject = value as Subject;

  return (
    subject &&
    typeof subject.id === 'number' &&
    typeof subject.name === 'string' &&
    typeof subject.description === 'string' &&
    typeof subject.category_id === 'number' &&
    typeof subject.created_at === 'string' &&
    typeof subject.updated_at === 'string' &&
    subject.category &&
    typeof subject.category.id === 'number' &&
    typeof subject.category.name === 'string' &&
    typeof subject.category.description === 'string'
  );
};

export default function QuizzesPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesResponse, subjectsResponse] = await Promise.all([
          supabase.from('categories').select('*').order('id'),
          supabase.from('subjects').select(`
            id,
            name,
            description,
            category_id,
            created_at,
            updated_at,
            category:categories (
              id,
              name,
              description,
              created_at,
              updated_at
            )
          `).order('id')
        ]);

        if (categoriesResponse.error) throw categoriesResponse.error;
        if (subjectsResponse.error) throw subjectsResponse.error;

        setCategories(categoriesResponse.data);
        
        const transformedData = subjectsResponse.data
          .map(item => ({
            ...item,
            category: Array.isArray(item.category) ? item.category[0] : item.category
          }))
          .filter(isValidSubject);
        
        setSubjects(transformedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredSubjects = subjects
    .filter(subject => 
      (selectedCategory === 'all' || subject.category_id === parseInt(selectedCategory)) &&
      (searchQuery === '' || 
        subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subject.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center w-full py-12">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <Loader2 className="w-8 h-8 text-blue-400" />
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
      quizify
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
            <motion.div 
              className="flex flex-col items-center text-center space-y-6 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <BookOpen className="h-12 w-12 text-blue-400" />
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                  Available Subjects
                </span>
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl">
              Search for subjects where you&#39;d like ACE to excel.
              </p>
              
              <div className="w-full max-w-md mt-8">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Search quizzes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border-gray-800 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="w-full py-8 bg-gray-950 min-h-[80vh]">
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
                  key={category.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.id.toString()
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={() => setSelectedCategory(category.id.toString())}
                >
                  {category.name}
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
                  key={selectedCategory + searchQuery}
                  className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {filteredSubjects.length === 0 ? (
                    <motion.div 
                      className="col-span-full text-center text-gray-400 py-12"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      No quizzes found matching your criteria
                    </motion.div>
                  ) : (
                    filteredSubjects.map((subject) => (
                      <motion.div
                        key={subject.id}
                        className="group relative flex flex-col space-y-4 p-6 rounded-xl border border-gray-800 bg-gray-900/50 hover:bg-gray-900/80 transition-all duration-200"
                        whileHover={{ scale: 1.02, y: -5 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div className="flex justify-between items-start">
                          <SquareMenu className="h-8 w-8 text-blue-400 group-hover:text-blue-300 transition-colors" />
                          <span className="text-sm px-3 py-1 rounded-full bg-gray-800 text-gray-300">
                            {subject.category?.name}
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold group-hover:text-blue-400 transition-colors">
                          {subject.name}
                        </h3>
                        <p className="text-gray-400 flex-1">{subject.description}</p>
                        <Link href={`/subjects/${subject.id}`} className="block mt-4">
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
      {/* Footer */}
      <footer className="w-full py-8 px-4 md:px-6 border-t border-gray-800">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">© 2024 quizify. All rights reserved.</p>
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