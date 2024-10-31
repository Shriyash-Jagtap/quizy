'use client'; // Ensure this is a client component
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button'; // Adjust based on your project
import { toast, ToastContainer } from 'react-toastify'; // For notifications
import 'react-toastify/dist/ReactToastify.css';
import Modal from 'react-modal'; // For edit modal
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ChevronDown, Edit2, Minus, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import router from 'next/router';
import withAdmin from '@/hoc/withAdmin';

// Type Definitions

interface Quiz {
  id: number;
  quiz_category: string;
  set: string;
  code: string;
  subject_id: number;
  created_at: string;
  updated_at: string;
}

interface Question {
  id: number;
  quiz_id: number;
  question_text: string;
  question_type: string;
  marks: number;
  solution: string | null;
  parent_question_id: number | null;
  options: Option[]; // Assuming options are fetched
  numeric_answer: NumericAnswer | null; // Added for numeric questions
}

interface Option {
  id: number;
  question_id: number;
  option_text: string;
  is_correct: boolean;
}

interface NumericAnswer {
  id: number;
  question_id: number;
  exact_answer: number | null;
  range_min: number | null;
  range_max: number | null;
}

interface Subject {
  id: number;
  name: string;
}

const EditQuiz: React.FC = () => {
  const { user, role } = useAuth();
  const params = useParams();
  const quizId = params.id as string; // Ensure `id` is string

  useEffect(() => {
    
    const appElement = document.querySelector('#__next');
    if (appElement) {
      Modal.setAppElement('#__next');
    } else {
      console.warn("App element '#__next' not found; Modal accessibility may be affected.");
    }
  }, []);
  useEffect(() => {
    if (user === null && role !== "admin") {
      // User not authenticated, redirect to login
      router.push('/login'); // Adjust the path as needed
    }
    
    // If user is undefined, auth state is being determined
  }, [user, router]);
  // Quiz State
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [quizCategory, setQuizCategory] = useState('');
  const [setName, setSetName] = useState('');
  const [code, setCode] = useState('');
  const [subjectId, setSubjectId] = useState<number>(0);

  // Questions State
  const [questions, setQuestions] = useState<Question[]>([]);

  // New Question State
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionType, setNewQuestionType] = useState<QuestionType>('multiple_choice');
  const [newMarks, setNewMarks] = useState<number>(1);
  const [newSolution, setNewSolution] = useState('');
  const [newOptions, setNewOptions] = useState<OptionInput[]>([]);
  const [newExactAnswer, setNewExactAnswer] = useState<number | ''>('');
  const [newRangeMin, setNewRangeMin] = useState<number | ''>('');
  const [newRangeMax, setNewRangeMax] = useState<number | ''>('');
  const [parentQuestionId, setParentQuestionId] = useState<number | null>(null); // Optional parent question
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);

  // Subjects State
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Existing Comprehension Questions for Parent Selection
  const [comprehensionQuestions, setComprehensionQuestions] = useState<Question[]>([]);

  // Loading and Error States
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editQuestion, setEditQuestion] = useState<Question | null>(null);
  const [editQuestionText, setEditQuestionText] = useState<string>('');
  const [editQuestionType, setEditQuestionType] = useState<QuestionType>('multiple_choice');
  const [editMarks, setEditMarks] = useState<number>(1);
  const [editSolution, setEditSolution] = useState<string>('');
  const [editOptions, setEditOptions] = useState<EditOptionInput[]>([]);
  const [editExactAnswer, setEditExactAnswer] = useState<number | ''>('');
  const [editRangeMin, setEditRangeMin] = useState<number | ''>('');
  const [editRangeMax, setEditRangeMax] = useState<number | ''>('');
  const [editParentQuestionId, setEditParentQuestionId] = useState<number | null>(null);

  // Define custom types for option inputs
  interface OptionInput {
    option_text: string;
    is_correct: boolean;
  }

  interface EditOptionInput extends OptionInput {
    id?: number;
  }

  // Define QuestionType
  type QuestionType = 'multiple_choice' | 'numeric_input' | 'multiple_select' | 'numeric_range' | 'comprehension';

  // Fetch Quiz Data
  const fetchQuizData = useCallback(async () => {
    if (!quizId) return;

    try {
      // Fetch Quiz Details
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', Number(quizId))
        .single();

      if (quizError) throw quizError;

      setQuiz(quizData);
      setQuizCategory(quizData.quiz_category);
      setSetName(quizData.set);
      setCode(quizData.code);
      setSubjectId(quizData.subject_id);

      // Fetch Associated Questions with Options and Numeric Answers
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*, options(*), numeric_answers(*)')
        .eq('quiz_id', Number(quizId))
        .order('id', { ascending: true });

      if (questionsError) throw questionsError;

      // Map numeric_answers to questions
      const mappedQuestions: Question[] = questionsData.map((q: any) => ({
        ...q,
        numeric_answer: q.numeric_answers && q.numeric_answers.length > 0 ? q.numeric_answers[0] : null,
      }));

      setQuestions(mappedQuestions);

      // Filter comprehension questions for parent selection
      const comprehensionQs = mappedQuestions.filter(
        (q) => q.question_type === 'comprehension'
      );
      setComprehensionQuestions(comprehensionQs);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
        toast.error(`Error fetching quiz data: ${err.message}`);
      } else {
        setError('An unexpected error occurred while fetching quiz data.');
        toast.error('An unexpected error occurred while fetching quiz data.');
      }
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  // Fetch Subjects for Dropdown
  const fetchSubjects = useCallback(async () => {
    try {
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select('*')
        .order('name', { ascending: true });

      if (subjectsError) throw subjectsError;

      setSubjects(subjectsData);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
        toast.error(`Error fetching subjects: ${err.message}`);
      } else {
        setError('An unexpected error occurred while fetching subjects.');
        toast.error('An unexpected error occurred while fetching subjects.');
      }
    }
  }, []);

  useEffect(() => {
    fetchQuizData();
    fetchSubjects();
  }, [fetchQuizData, fetchSubjects]); // Fixed dependency array by including both functions

  // Update Quiz Details
  const handleUpdateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const { data, error: updateError } = await supabase
        .from('quizzes')
        .update({
          quiz_category: quizCategory,
          set: setName,
          code: code,
          subject_id: subjectId,
        })
        .eq('id', Number(quizId))
        .select()
        .single();

      if (updateError) throw updateError;

      setQuiz(data);
      toast.success('Quiz updated successfully!');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
        toast.error(`Error updating quiz: ${err.message}`);
      } else {
        setError('An unexpected error occurred while updating the quiz.');
        toast.error('An unexpected error occurred while updating the quiz.');
      }
    } finally {
      setSaving(false);
    }
  };

  // Handlers for New Question Form
  const handleAddOption = () => {
    setNewOptions([...newOptions, { option_text: '', is_correct: false }]);
  };

  const handleOptionChange = (
    index: number,
    field: 'option_text' | 'is_correct',
    value: string | boolean // Replaced `any` with specific types
  ) => {
    const updatedOptions = newOptions.map((opt, i) =>
      i === index ? { ...opt, [field]: value } : opt
    );
    setNewOptions(updatedOptions);
  };

  const handleRemoveOption = (index: number) => {
    const updatedOptions = newOptions.filter((_, i) => i !== index);
    setNewOptions(updatedOptions);
  };

  // Create New Question
  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // Validation
    if (['multiple_choice', 'multiple_select'].includes(newQuestionType) && newOptions.length === 0) {
      setError('Please add at least one option for multiple choice questions.');
      setSaving(false);
      return;
    }

    if (newQuestionType === 'numeric_input' && newExactAnswer === '') {
      setError('Please provide an exact answer for numeric input questions.');
      setSaving(false);
      return;
    }

    if (newQuestionType === 'numeric_range') {
      if (newRangeMin === '' || newRangeMax === '') {
        setError('Please provide both minimum and maximum values for numeric range questions.');
        setSaving(false);
        return;
      }
      if (typeof newRangeMin === 'number' && typeof newRangeMax === 'number' && newRangeMin > newRangeMax) {
        setError('Minimum value cannot be greater than maximum value.');
        setSaving(false);
        return;
      }
    }

    // Validation for comprehension questions removed to make parent optional
    // Now, any question type (except comprehension itself) can optionally have a parent question
    if (newQuestionType !== 'comprehension' && parentQuestionId !== null) {
      // Ensure the selected parent is a comprehension question
      const parentQ = comprehensionQuestions.find(q => q.id === parentQuestionId);
      if (!parentQ) {
        setError('Selected parent question is invalid.');
        setSaving(false);
        return;
      }
    }

    try {
      // Insert the new question
      const { data: questionData, error: questionError } = await supabase
        .from('questions')
        .insert([
          {
            quiz_id: Number(quizId),
            question_text: newQuestionText,
            question_type: newQuestionType,
            marks: newMarks,
            solution: newSolution || null,
            parent_question_id: (newQuestionType !== 'comprehension' && parentQuestionId) ? parentQuestionId : null,
          },
        ])
        .select()
        .single();

      if (questionError) throw questionError;

      // Insert numeric_answers if applicable
      if (newQuestionType === 'numeric_input' || newQuestionType === 'numeric_range') {
        const numericAnswer: Partial<NumericAnswer> = {
          question_id: questionData.id,
        };

        if (newQuestionType === 'numeric_input') {
          numericAnswer.exact_answer = typeof newExactAnswer === 'number' ? newExactAnswer : null;
        } else if (newQuestionType === 'numeric_range') {
          numericAnswer.range_min = typeof newRangeMin === 'number' ? newRangeMin : null;
          numericAnswer.range_max = typeof newRangeMax === 'number' ? newRangeMax : null;
        }

        const { error: numericError } = await supabase
          .from('numeric_answers')
          .insert([numericAnswer]);

        if (numericError) throw numericError;
      }

      // Insert options if applicable
      if (['multiple_choice', 'multiple_select'].includes(newQuestionType)) {
        const optionsData = newOptions.map((opt) => ({
          question_id: questionData.id,
          option_text: opt.option_text,
          is_correct: opt.is_correct,
        }));

        const { error: optionsError } = await supabase.from('options').insert(optionsData);

        if (optionsError) throw optionsError;
      }

      // Refresh Questions List
      await fetchQuizData();

      // Reset New Question Form
      setNewQuestionText('');
      setNewQuestionType('multiple_choice');
      setNewMarks(1);
      setNewSolution('');
      setNewOptions([]);
      setNewExactAnswer('');
      setNewRangeMin('');
      setNewRangeMax('');
      setParentQuestionId(null);

      toast.success('Question added successfully!');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
        toast.error(`Error adding question: ${err.message}`);
      } else {
        setError('An unexpected error occurred while adding the question.');
        toast.error('An unexpected error occurred while adding the question.');
      }
    } finally {
      setSaving(false);
    }
  };

  // Delete Question
  const handleDeleteQuestion = async (questionId: number) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this question?');
    if (!confirmDelete) return;

    setSaving(true);
    setError(null);

    try {
      // Delete options associated with the question first to maintain referential integrity
      const { error: optionsError } = await supabase
        .from('options')
        .delete()
        .eq('question_id', questionId);

      if (optionsError) throw optionsError;

      // Delete numeric_answers if applicable
      const { error: numericError } = await supabase
        .from('numeric_answers')
        .delete()
        .eq('question_id', questionId);

      if (numericError) throw numericError;

      // Delete the question
      const { error: questionError } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId);

      if (questionError) throw questionError;

      // Refresh Questions List
      await fetchQuizData();

      toast.success('Question deleted successfully!');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
        toast.error(`Error deleting question: ${err.message}`);
      } else {
        setError('An unexpected error occurred while deleting the question.');
        toast.error('An unexpected error occurred while deleting the question.');
      }
    } finally {
      setSaving(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (question: Question) => {
    setEditQuestion(question);
    setEditQuestionText(question.question_text);
    setEditQuestionType(question.question_type as QuestionType);
    setEditMarks(question.marks);
    setEditSolution(question.solution || '');
    setEditParentQuestionId(question.parent_question_id);

    // Initialize options for editing
    const options = question.options.map((opt) => ({
      id: opt.id,
      option_text: opt.option_text,
      is_correct: opt.is_correct,
    }));
    setEditOptions(options);

    // Initialize numeric answers
    if (question.numeric_answer) {
      if (question.question_type === 'numeric_input') {
        setEditExactAnswer(question.numeric_answer.exact_answer || '');
      } else if (question.question_type === 'numeric_range') {
        setEditRangeMin(question.numeric_answer.range_min || '');
        setEditRangeMax(question.numeric_answer.range_max || '');
      }
    } else {
      setEditExactAnswer('');
      setEditRangeMin('');
      setEditRangeMax('');
    }

    setIsModalOpen(true);
  };

  // Close Edit Modal
  const closeEditModal = () => {
    setIsModalOpen(false);
    setEditQuestion(null);
    setEditQuestionText('');
    setEditQuestionType('multiple_choice');
    setEditMarks(1);
    setEditSolution('');
    setEditOptions([]);
    setEditExactAnswer('');
    setEditRangeMin('');
    setEditRangeMax('');
    setEditParentQuestionId(null);
  };

  // Handlers for Edit Question Form
  const handleEditAddOption = () => {
    setEditOptions([...editOptions, { option_text: '', is_correct: false }]);
  };

  const handleEditOptionChange = (
    index: number,
    field: 'option_text' | 'is_correct',
    value: string | boolean // Replaced `any` with specific types
  ) => {
    const updatedOptions = editOptions.map((opt, i) =>
      i === index ? { ...opt, [field]: value } : opt
    );
    setEditOptions(updatedOptions);
  };

  const handleEditRemoveOption = (index: number) => {
    const updatedOptions = editOptions.filter((_, i) => i !== index);
    setEditOptions(updatedOptions);
  };

  // Update Existing Question
  const handleUpdateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editQuestion) return;
    setSaving(true);
    setError(null);

    // Validation
    if (['multiple_choice', 'multiple_select'].includes(editQuestionType) && editOptions.length === 0) {
      setError('Please add at least one option for multiple choice questions.');
      setSaving(false);
      return;
    }

    if (editQuestionType === 'numeric_input' && editExactAnswer === '') {
      setError('Please provide an exact answer for numeric input questions.');
      setSaving(false);
      return;
    }

    if (editQuestionType === 'numeric_range') {
      if (editRangeMin === '' || editRangeMax === '') {
        setError('Please provide both minimum and maximum values for numeric range questions.');
        setSaving(false);
        return;
      }
      if (typeof editRangeMin === 'number' && typeof editRangeMax === 'number' && editRangeMin > editRangeMax) {
        setError('Minimum value cannot be greater than maximum value.');
        setSaving(false);
        return;
      }
    }

    // If a parent is assigned, ensure it's a comprehension question
    if (editQuestionType !== 'comprehension' && editParentQuestionId !== null) {
      const parentQ = comprehensionQuestions.find(q => q.id === editParentQuestionId);
      if (!parentQ) {
        setError('Selected parent question is invalid.');
        setSaving(false);
        return;
      }
    }

    try {
      // Update the question
      const { error: updateError } = await supabase
        .from('questions')
        .update({
          question_text: editQuestionText,
          question_type: editQuestionType,
          marks: editMarks,
          solution: editSolution || null,
          parent_question_id: (editQuestionType !== 'comprehension' && editParentQuestionId) ? editParentQuestionId : null,
        })
        .eq('id', editQuestion.id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Handle numeric_answers
      if (editQuestionType === 'numeric_input' || editQuestionType === 'numeric_range') {
        // Check if numeric_answer exists
        const { data: existingNumeric, error: fetchNumericError } = await supabase
          .from('numeric_answers')
          .select('*')
          .eq('question_id', editQuestion.id)
          .single();

        if (fetchNumericError && fetchNumericError.code !== 'PGRST116') { // PGRST116: No rows found
          throw fetchNumericError;
        }

        const numericPayload: Partial<NumericAnswer> = {
          exact_answer: editQuestionType === 'numeric_input' ? (typeof editExactAnswer === 'number' ? editExactAnswer : null) : null,
          range_min: editQuestionType === 'numeric_range' ? (typeof editRangeMin === 'number' ? editRangeMin : null) : null,
          range_max: editQuestionType === 'numeric_range' ? (typeof editRangeMax === 'number' ? editRangeMax : null) : null,
        };

        if (existingNumeric) {
          // Update existing numeric_answer
          const { error: updateNumericError } = await supabase
            .from('numeric_answers')
            .update(numericPayload)
            .eq('id', existingNumeric.id);

          if (updateNumericError) throw updateNumericError;
        } else {
          // Insert new numeric_answer
          const { error: insertNumericError } = await supabase
            .from('numeric_answers')
            .insert([
              {
                question_id: editQuestion.id,
                ...numericPayload,
              },
            ]);

          if (insertNumericError) throw insertNumericError;
        }
      } else {
        // If question type is not numeric, delete any existing numeric_answers
        const { error: deleteNumericError } = await supabase
          .from('numeric_answers')
          .delete()
          .eq('question_id', editQuestion.id);

        if (deleteNumericError && deleteNumericError.code !== 'PGRST116') { // PGRST116: No rows found
          throw deleteNumericError;
        }
      }

      // Handle options
      if (['multiple_choice', 'multiple_select'].includes(editQuestionType)) {
        // Fetch existing options for the question
        const { data: existingOptions, error: fetchOptionsError } = await supabase
          .from('options')
          .select('*')
          .eq('question_id', editQuestion.id);

        if (fetchOptionsError) throw fetchOptionsError;

        // Determine options to update, insert, or delete
        const updatedOptionIds = editOptions
          .filter(opt => opt.id)
          .map(opt => opt.id as number); // Ensure id is number

        // Options to delete
        const optionsToDelete = existingOptions.filter(
          (opt) => !updatedOptionIds.includes(opt.id)
        );

        // Delete removed options
        if (optionsToDelete.length > 0) {
          const { error: deleteError } = await supabase
            .from('options')
            .delete()
            .in('id', optionsToDelete.map(opt => opt.id));

          if (deleteError) throw deleteError;
        }

        // Options to update or insert
        for (const opt of editOptions) {
          if (opt.id) {
            // Update existing option
            const { error: updateOptError } = await supabase
              .from('options')
              .update({
                option_text: opt.option_text,
                is_correct: opt.is_correct,
              })
              .eq('id', opt.id);

            if (updateOptError) throw updateOptError;
          } else {
            // Insert new option
            const { error: insertOptError } = await supabase
              .from('options')
              .insert([
                {
                  question_id: editQuestion.id,
                  option_text: opt.option_text,
                  is_correct: opt.is_correct,
                },
              ]);

            if (insertOptError) throw insertOptError;
          }
        }
      } else {
        // If question type is not option-based, delete existing options
        const { error: deleteOptionsError } = await supabase
          .from('options')
          .delete()
          .eq('question_id', editQuestion.id);

        if (deleteOptionsError && deleteOptionsError.code !== 'PGRST116') { // PGRST116: No rows found
          throw deleteOptionsError;
        }
      }

      // Refresh Questions List
      await fetchQuizData();

      // Close Modal
      closeEditModal();

      toast.success('Question updated successfully!');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
        toast.error(`Error updating question: ${err.message}`);
      } else {
        setError('An unexpected error occurred while updating the question.');
        toast.error('An unexpected error occurred while updating the question.');
      }
    } finally {
      setSaving(false);
    }
  };

  // Handle Loading and Error States
  if (loading) return <p className="text-center text-white">Loading quiz data...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;
  if (!quiz) return <p className="text-center text-gray-400">Quiz not found.</p>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 space-y-12">
      {/* Header Section with Title and Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold">Edit Quiz</h1>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <Button variant="outline">Preview Quiz</Button>
          <Button onClick={handleUpdateQuiz} disabled={saving}>
            {saving ? 'Saving...' : 'Save All Changes'}
          </Button>
        </div>
      </div>

      {/* Toast Container for Notifications */}
      <ToastContainer />

      {/* Quiz Details Section */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl">Quiz Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateQuiz} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Quiz Category
              </label>
              <input
                type="text"
                value={quizCategory}
                onChange={(e) => setQuizCategory(e.target.value)}
                required
                className="w-full p-2.5 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="e.g., Mathematics"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Set Name
              </label>
              <input
                type="text"
                value={setName}
                onChange={(e) => setSetName(e.target.value)}
                required
                className="w-full p-2.5 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="e.g., Algebra Set 1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Quiz Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="w-full p-2.5 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="e.g., MATH-ALG-001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Subject
              </label>
              <select
                value={subjectId || ''}
                onChange={(e) => setSubjectId(Number(e.target.value))}
                required
                className="w-full p-2.5 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="" disabled>Select a subject</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" disabled={saving} className="w-full">
              {saving ? 'Saving...' : 'Update Quiz'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Existing Questions Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Existing Questions</h2>
        {questions.length === 0 ? (
          <p className="text-gray-400">No questions added yet.</p>
        ) : (
          <Accordion type="multiple" className="space-y-4">
            {questions.map((question, index) => (
              <AccordionItem
                key={question.id}
                value={`question-${question.id}`}
                className="border border-gray-700 rounded-lg overflow-hidden"
              >
                <AccordionTrigger className="px-4 py-2 bg-gray-800 hover:bg-gray-700 transition-colors flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="mr-4 text-gray-400">Q{index + 1}:</span>
                    <MarkdownRenderer content={question.question_text} />
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400 transition-transform duration-200" />
                </AccordionTrigger>
                <AccordionContent className="px-4 py-2 bg-gray-750">
                  <div className="space-y-2">
                    <p className="text-gray-400">Type: {question.question_type.replace('_', ' ')}</p>
                    <p className="text-gray-400">Marks: {question.marks}</p>
                    {question.solution && (
                      <p className="text-gray-400">Solution: {question.solution}</p>
                    )}
                    {/* Display Parent Question if Exists */}
                    {question.parent_question_id && (
                      <p className="text-gray-400">
                        Parent Question: {questions.find(q => q.id === question.parent_question_id)?.question_text || 'N/A'}
                      </p>
                    )}
                    {/* Display Numeric Answers */}
                    {['numeric_input', 'numeric_range'].includes(question.question_type) && question.numeric_answer && (
                      <div className="mt-2">
                        {question.question_type === 'numeric_input' && (
                          <p className="text-gray-400">Exact Answer: {question.numeric_answer.exact_answer}</p>
                        )}
                        {question.question_type === 'numeric_range' && (
                          <p className="text-gray-400">
                            Range: {question.numeric_answer.range_min} - {question.numeric_answer.range_max}
                          </p>
                        )}
                      </div>
                    )}
                    {/* Display Options if Applicable */}
                    {['multiple_choice', 'multiple_select'].includes(question.question_type) && (
                      <div className="mt-2">
                        <p className="text-gray-400">Options:</p>
                        <ul className="list-disc list-inside">
                          {question.options.map((option) => (
                            <li key={option.id} className="text-gray-300 flex items-center">
                              <MarkdownRenderer content={option.option_text} /> 
                              {option.is_correct && <span className="text-green-500 ml-2">(Correct)</span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {/* Action Buttons */}
                    <div className="flex space-x-2 mt-4">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => openEditModal(question)}
                      >
                        <Edit2 className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteQuestion(question.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </section>

      {/* Add New Question Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Add New Question</h2>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">New Question</CardTitle>
            <Button onClick={() => setIsAddingQuestion(!isAddingQuestion)}>
              {isAddingQuestion ? <Minus className="mr-2" /> : <Plus className="mr-2" />}
              {isAddingQuestion ? 'Cancel' : 'Add Question'}
            </Button>
          </CardHeader>
          <CardContent>
            {isAddingQuestion && (
              <form onSubmit={handleCreateQuestion} className="space-y-6">
                <div>
                  <label className="block text-gray-400 mb-2">Question Text</label>
                  <textarea
                    value={newQuestionText}
                    onChange={(e) => setNewQuestionText(e.target.value)}
                    required
                    className="w-full p-2 rounded bg-gray-700 text-white"
                    placeholder="Enter the question text..."
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">Question Type</label>
                  <select
                    value={newQuestionType}
                    onChange={(e) => setNewQuestionType(e.target.value as QuestionType)}
                    required
                    className="w-full p-2 rounded bg-gray-700 text-white"
                  >
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="numeric_input">Numeric Input</option>
                    <option value="multiple_select">Multiple Select</option>
                    <option value="numeric_range">Numeric Range</option>
                    <option value="comprehension">Comprehension</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">Marks</label>
                  <input
                    type="number"
                    value={newMarks}
                    onChange={(e) => setNewMarks(Number(e.target.value))}
                    required
                    min={0}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                    placeholder="e.g., 5"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">Solution</label>
                  <textarea
                    value={newSolution}
                    onChange={(e) => setNewSolution(e.target.value)}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                    placeholder="Enter the solution..."
                  />
                </div>
                {/* Parent Question Dropdown for Non-Comprehension Types */}
                {newQuestionType !== 'comprehension' && (
                  <div>
                    <label className="block text-gray-400 mb-2">Parent Question (Optional)</label>
                    <select
                      value={parentQuestionId || ''}
                      onChange={(e) => setParentQuestionId(Number(e.target.value))}
                      className="w-full p-2 rounded bg-gray-700 text-white"
                    >
                      <option value="">None</option>
                      {comprehensionQuestions.map((parentQ) => (
                        <option key={parentQ.id} value={parentQ.id}>
                          {parentQ.question_text}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {/* Options for Multiple Choice and Multiple Select */}
                {['multiple_choice', 'multiple_select'].includes(newQuestionType) && (
                  <div>
                    <label className="block text-gray-400 mb-2">Options</label>
                    {newOptions.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <textarea
                    value={option.option_text}
                    onChange={(e) => handleOptionChange(index, 'option_text', e.target.value)}
                    required
                    className="w-full p-2 rounded bg-gray-700 text-white"
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
                {/* Fields for Numeric Input and Numeric Range */}
                {['numeric_input', 'numeric_range'].includes(newQuestionType) && (
                  <div>
                    {newQuestionType === 'numeric_input' && (
                      <div>
                        <label className="block text-gray-400 mb-2">Exact Answer</label>
                        <input
                          type="number"
                          value={newExactAnswer}
                          onChange={(e) => setNewExactAnswer(e.target.value === '' ? '' : Number(e.target.value))}
                          required
                          className="w-full p-2 rounded bg-gray-700 text-white"
                          placeholder="Enter the exact answer..."
                        />
                      </div>
                    )}
                    {newQuestionType === 'numeric_range' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-gray-400 mb-2">Minimum Value</label>
                          <input
                            type="number"
                            value={newRangeMin}
                            onChange={(e) => setNewRangeMin(e.target.value === '' ? '' : Number(e.target.value))}
                            required
                            className="w-full p-2 rounded bg-gray-700 text-white"
                            placeholder="Enter the minimum value..."
                          />
                        </div>
                        <div>
                          <label className="block text-gray-400 mb-2">Maximum Value</label>
                          <input
                            type="number"
                            value={newRangeMax}
                            onChange={(e) => setNewRangeMax(e.target.value === '' ? '' : Number(e.target.value))}
                            required
                            className="w-full p-2 rounded bg-gray-700 text-white"
                            placeholder="Enter the maximum value..."
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <Button type="submit" disabled={saving} className="w-full">
                  {saving ? 'Saving...' : 'Add Question'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Edit Question Modal */}
      {editQuestion && (
        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeEditModal}
          contentLabel="Edit Question"
          className="max-w-3xl mx-auto my-20 bg-gray-800 p-6 rounded-lg shadow-lg outline-none"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
        >
          <h2 className="text-2xl font-bold mb-4">Edit Question</h2>
          <form onSubmit={handleUpdateQuestion} className="space-y-6">
            <div>
              <label className="block text-gray-400 mb-2">Question Text</label>
              <textarea
                value={editQuestionText}
                onChange={(e) => setEditQuestionText(e.target.value)}
                required
                className="w-full p-2 rounded bg-gray-700 text-white"
                placeholder="Enter the question text..."
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-2">Question Type</label>
              <select
                value={editQuestionType}
                onChange={(e) => setEditQuestionType(e.target.value as QuestionType)}
                required
                className="w-full p-2 rounded bg-gray-700 text-white"
              >
                <option value="multiple_choice">Multiple Choice</option>
                <option value="numeric_input">Numeric Input</option>
                <option value="multiple_select">Multiple Select</option>
                <option value="numeric_range">Numeric Range</option>
                <option value="comprehension">Comprehension</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-400 mb-2">Marks</label>
              <input
                type="number"
                value={editMarks}
                onChange={(e) => setEditMarks(Number(e.target.value))}
                required
                min={0}
                className="w-full p-2 rounded bg-gray-700 text-white"
                placeholder="e.g., 5"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-2">Solution</label>
              <textarea
                value={editSolution}
                onChange={(e) => setEditSolution(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-white"
                placeholder="Enter the solution..."
              />
            </div>
            {/* Parent Question Dropdown for Non-Comprehension Types */}
            {editQuestionType !== 'comprehension' && (
              <div>
                <label className="block text-gray-400 mb-2">Parent Question (Optional)</label>
                <select
                  value={editParentQuestionId || ''}
                  onChange={(e) => setEditParentQuestionId(Number(e.target.value))}
                  className="w-full p-2 rounded bg-gray-700 text-white"
                >
                  <option value="">None</option>
                  {comprehensionQuestions
                    .filter(q => q.id !== editQuestion.id) // Prevent selecting itself as parent
                    .map((parentQ) => (
                      <option key={parentQ.id} value={parentQ.id}>
                        {parentQ.question_text}
                      </option>
                    ))}
                </select>
              </div>
            )}
            {/* Options for Multiple Choice and Multiple Select */}
            {['multiple_choice', 'multiple_select'].includes(editQuestionType) && (
              <div>
                <label className="block text-gray-400 mb-2">Options</label>
                {editOptions.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={option.option_text}
                      onChange={(e) => handleEditOptionChange(index, 'option_text', e.target.value)}
                      required
                      className="flex-1 p-2 rounded bg-gray-700 text-white"
                      placeholder={`Option ${index + 1}`}
                    />
                    <label className="flex items-center space-x-1">
                      <input
                        type="checkbox"
                        checked={option.is_correct}
                        onChange={(e) => handleEditOptionChange(index, 'is_correct', e.target.checked)}
                        className="form-checkbox text-green-500 rounded border-gray-600 bg-gray-800"
                      />
                      <span className="text-gray-400">Correct</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleEditRemoveOption(index)}
                      className="text-red-500 hover:text-red-400"
                    >
                      &times;
                    </button>
                  </div>
                ))}
                <Button type="button" onClick={handleEditAddOption}>
                  Add Option
                </Button>
              </div>
            )}
            {/* Fields for Numeric Input and Numeric Range */}
            {['numeric_input', 'numeric_range'].includes(editQuestionType) && (
              <div>
                {editQuestionType === 'numeric_input' && (
                  <div>
                    <label className="block text-gray-400 mb-2">Exact Answer</label>
                    <input
                      type="number"
                      value={editExactAnswer}
                      onChange={(e) => setEditExactAnswer(e.target.value === '' ? '' : Number(e.target.value))}
                      required
                      className="w-full p-2 rounded bg-gray-700 text-white"
                      placeholder="Enter the exact answer..."
                    />
                  </div>
                )}
                {editQuestionType === 'numeric_range' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-400 mb-2">Minimum Value</label>
                      <input
                        type="number"
                        value={editRangeMin}
                        onChange={(e) => setEditRangeMin(e.target.value === '' ? '' : Number(e.target.value))}
                        required
                        className="w-full p-2 rounded bg-gray-700 text-white"
                        placeholder="Enter the minimum value..."
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 mb-2">Maximum Value</label>
                      <input
                        type="number"
                        value={editRangeMax}
                        onChange={(e) => setEditRangeMax(e.target.value === '' ? '' : Number(e.target.value))}
                        required
                        className="w-full p-2 rounded bg-gray-700 text-white"
                        placeholder="Enter the maximum value..."
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={closeEditModal}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Update Question'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default withAdmin(EditQuiz);
