// app/admin/page.tsx

'use client'; 

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { Button } from '@/components/ui/button'; 
import withProtectedRoute from '@/hoc/withProtectedRoute';

interface Quiz {
  id: number;
  code: string;
  set: string;
  subject_id: number;
  quiz_category: string;
  created_at: string;
  updated_at: string;
}

const AdminDashboard: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuizzes = async () => {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;

      setQuizzes(data);
    } catch (err: unknown) { 
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred while fetching quizzes.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
     
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Link href="/admin/create-quiz">
            <Button>Add New Quiz</Button>
          </Link>
        </div>
        {loading && <p>Loading quizzes...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        {!loading && !error && (
          <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
            <thead>
              <tr>
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Set</th>
                <th className="px-6 py-3">Code</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map((quiz) => (
                <tr key={quiz.id}>
                  <td className="px-6 py-4">{quiz.id}</td>
                  <td className="px-6 py-4">{quiz.quiz_category}</td>
                  <td className="px-6 py-4">{quiz.set}</td>
                  <td className="px-6 py-4">{quiz.code}</td>
                  <td className="px-6 py-4 space-x-2">
                    <Link href={`/admin/edit-quiz/${quiz.id}`}>
                      <Button variant="secondary" size="sm">Edit</Button>
                    </Link>
                    {/* Optionally add Delete functionality */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default withProtectedRoute(AdminDashboard, { requireAdmin: true });
