// app/quizzes/[id]/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation'; 
import { supabase } from '@/lib/supabaseClient';
import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Subject {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

// Type guard to validate Subject
const isValidSubject = (value: unknown): value is Subject => {
  const subject = value as Subject;
  return (
    subject &&
    typeof subject.id === 'number' &&
    typeof subject.name === 'string' &&
    typeof subject.description === 'string' &&
    typeof subject.created_at === 'string' &&
    typeof subject.updated_at === 'string'
  );
};

export default function QuizPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  console.log("Route Params:", params);
  console.log("Subject ID:", id);

  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubject = async () => {
      if (!id) {
        setError('No subject ID provided.');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('subjects')
          .select('*')
          .eq('id', Number(id))
          .single();

        console.log("Fetched Data:", data);
        console.log("Fetch Error:", error);

        if (error) {
          setError(error.message);
        } else if (data && isValidSubject(data)) {
          setSubject(data);
        } else {
          setSubject(null);
          setError('Invalid subject data received.');
        }
      } catch (err) {
        console.error("Fetch Exception:", err);
        setError('An unexpected error occurred while fetching the data.');
      } finally {
        setLoading(false);
      }
    };

    fetchSubject();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-20">
        <p className="text-gray-400">Loading quiz...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-20">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-20">
        <p className="text-gray-400">Subject not found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 lg:px-6 h-16 flex items-center border-b border-gray-800 backdrop-blur-md bg-black/50">
        <Link className="flex items-center justify-center" href="/">
          <span className="font-bold text-2xl">Quizify</span>
        </Link>
        <nav className="hidden md:flex ml-auto gap-6">
          <Link className="text-sm font-medium text-gray-400 hover:text-white transition-colors" href="#">Features</Link>
          <Link className="text-sm font-medium text-gray-400 hover:text-white transition-colors" href="#">Resources</Link>
          <Link className="text-sm font-medium text-gray-400 hover:text-white transition-colors" href="#">Pricing</Link>
        </nav>
        <div className="hidden md:flex items-center gap-4 ml-6">
          <Button variant="ghost" className="text-gray-400">Sign In</Button>
          <Button>Get Started</Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-16">
        {/* Quiz Detail Section */}
        <section className="w-full py-20 md:py-32 relative overflow-hidden">
          <div className="container px-4 md:px-6 relative">
            <motion.div 
              className="flex flex-col items-center text-center space-y-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="space-y-4">
                <BookOpen className="h-10 w-10 text-blue-400 mx-auto" />
                <h1 className="text-3xl font-bold text-white">{subject.name} Quiz</h1>
                <p className="text-gray-400 mt-2">{subject.description}</p>
              </div>

              <div className="flex flex-col items-center">
                <p className="text-gray-400 mb-4">Quiz functionality is under development.</p>
                <Button onClick={() => router.push('/subjects')}>Back to Quizzes</Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
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
