'use client'; // Ensure this is a client component

import React, { useState } from 'react';
import withAuth from '@/hoc/withAuth';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button'; // Adjust based on your project

const CreateQuiz: React.FC = () => {
  const router = useRouter();
  const [quizCategory, setQuizCategory] = useState('');
  const [setName, setSetName] = useState('');
  const [code, setCode] = useState('');
  const [subjectId, setSubjectId] = useState<number>(0); // Adjust based on your subjects table
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('quizzes')
        .insert([
          {
            quiz_category: quizCategory,
            set: setName,
            code: code,
            subject_id: subjectId,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      router.push('/admin'); // Redirect to dashboard after creation
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Create New Quiz</h1>
      {error && <p className="text-red-500 mb-4">Error: {error}</p>}
      <form onSubmit={handleCreateQuiz} className="space-y-4">
        <div>
          <label className="block text-gray-400 mb-2">Quiz Category</label>
          <input
            type="text"
            value={quizCategory}
            onChange={(e) => setQuizCategory(e.target.value)}
            required
            className="w-full p-2 rounded bg-gray-700 text-white"
            placeholder="e.g., Mathematics"
          />
        </div>
        <div>
          <label className="block text-gray-400 mb-2">Set Name</label>
          <input
            type="text"
            value={setName}
            onChange={(e) => setSetName(e.target.value)}
            required
            className="w-full p-2 rounded bg-gray-700 text-white"
            placeholder="e.g., Algebra Set 1"
          />
        </div>
        <div>
          <label className="block text-gray-400 mb-2">Quiz Code</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            className="w-full p-2 rounded bg-gray-700 text-white"
            placeholder="e.g., MATH-ALG-001"
          />
        </div>
        <div>
          <label className="block text-gray-400 mb-2">Subject ID</label>
          <input
            type="number"
            value={subjectId}
            onChange={(e) => setSubjectId(Number(e.target.value))}
            required
            className="w-full p-2 rounded bg-gray-700 text-white"
            placeholder="e.g., 1"
          />
          {/* Ideally, replace this with a dropdown of subjects */}
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Quiz'}
        </Button>
      </form>
    </div>
  );
};

export default withAuth(CreateQuiz);
