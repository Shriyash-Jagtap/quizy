'use client';

import React, { useEffect, useState } from 'react';
import withAuth from '@/hoc/withAuth';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button'; // Adjust based on your project

// Interface Definitions
interface Quiz {
  id: number;
  quiz_category: string;
  set: string;
}

interface Option {
  option_text: string;
  is_correct: boolean;
}

// Define QuestionType for `questionType` state
type QuestionType = 'multiple_choice' | 'numeric_input' | 'multiple_select' | 'numeric_range' | 'comprehension';

const CreateQuestion: React.FC = () => {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<number | null>(null);
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState<QuestionType>('multiple_choice');
  const [marks, setMarks] = useState<number>(0);
  const [solution, setSolution] = useState('');
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
      // Handle error with proper typing
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleAddOption = () => {
    setOptions([...options, { option_text: '', is_correct: false }]);
  };

  const handleOptionChange = (
    index: number,
    field: 'option_text' | 'is_correct',
    value: string | boolean // Specify exact types for `value`
  ) => {
    const updatedOptions = options.map((opt, i) =>
      i === index ? { ...opt, [field]: value } : opt
    );
    setOptions(updatedOptions);
  };

  const handleRemoveOption = (index: number) => {
    const updatedOptions = options.filter((_, i) => i !== index);
    setOptions(updatedOptions);
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    if (!selectedQuiz) {
      setError('Please select a quiz.');
      setSaving(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('questions')
        .insert([
          {
            quiz_id: selectedQuiz,
            question_text: questionText,
            question_type: questionType,
            marks: marks,
            solution: solution,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Insert options if applicable
      if (['multiple_choice', 'multiple_select'].includes(questionType)) {
        const optionsData = options.map((opt) => ({
          question_id: data.id,
          option_text: opt.option_text,
          is_correct: opt.is_correct,
        }));

        const { error: optionsError } = await supabase
          .from('options')
          .insert(optionsData);

        if (optionsError) throw optionsError;
      }

      router.push('/admin'); // Redirect to dashboard after creation
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading quizzes...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Create New Question</h1>
      <form onSubmit={handleCreateQuestion} className="space-y-4">
        <div>
          <label className="block text-gray-400 mb-2">Select Quiz</label>
          <select
            value={selectedQuiz || ''}
            onChange={(e) => setSelectedQuiz(Number(e.target.value))}
            required
            className="w-full p-2 rounded bg-gray-700 text-white"
          >
            <option value="" disabled>Select a quiz</option>
            {quizzes.map((quiz) => (
              <option key={quiz.id} value={quiz.id}>
                {quiz.quiz_category} - {quiz.set}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-gray-400 mb-2">Question Text</label>
          <textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            required
            className="w-full p-2 rounded bg-gray-700 text-white"
            placeholder="Enter your question here..."
          />
        </div>
        <div>
          <label className="block text-gray-400 mb-2">Question Type</label>
          <select
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value as QuestionType)}
            required
            className="w-full p-2 rounded bg-gray-700 text-white"
          >
            <option value="multiple_choice">Multiple Choice</option>
            <option value="multiple_select">Multiple Select</option>
            <option value="numeric_input">Numeric Input</option>
            <option value="numeric_range">Numeric Range</option>
            <option value="comprehension">Comprehension</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-400 mb-2">Marks</label>
          <input
            type="number"
            value={marks}
            onChange={(e) => setMarks(Number(e.target.value))}
            required
            min={0}
            className="w-full p-2 rounded bg-gray-700 text-white"
            placeholder="e.g., 5"
          />
        </div>
        <div>
          <label className="block text-gray-400 mb-2">Solution</label>
          <textarea
            value={solution}
            onChange={(e) => setSolution(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white"
            placeholder="Enter the solution here..."
          />
        </div>
        {/* Options for Multiple Choice and Multiple Select */}
        {['multiple_choice', 'multiple_select'].includes(questionType) && (
          <div>
            <label className="block text-gray-400 mb-2">Options</label>
            {options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={option.option_text}
                  onChange={(e) => handleOptionChange(index, 'option_text', e.target.value)}
                  required
                  className="flex-1 p-2 rounded bg-gray-700 text-white"
                  placeholder={`Option ${index + 1}`}
                />
                <label className="flex items-center space-x-1">
                  <input
                    type="checkbox"
                    checked={option.is_correct}
                    onChange={(e) => handleOptionChange(index, 'is_correct', e.target.checked)}
                    className="form-checkbox text-green-500 rounded border-gray-600 bg-gray-800"
                  />
                  <span className="text-gray-400">Correct</span>
                </label>
                <button
                  type="button"
                  onClick={() => handleRemoveOption(index)}
                  className="text-red-500 hover:text-red-400"
                >
                  &times;
                </button>
              </div>
            ))}
            <Button type="button" onClick={handleAddOption}>
              Add Option
            </Button>
          </div>
        )}
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Create Question'}
        </Button>
      </form>
    </div>
  );
};

export default withAuth(CreateQuestion);
