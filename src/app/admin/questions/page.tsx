'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'grammar', label: 'Grammar' },
  { value: 'vocabulary', label: 'Vocabulary' },
  { value: 'sentence_making', label: 'Sentence Making' },
  { value: 'listening', label: 'Listening' },
  { value: 'speaking_readiness', label: 'Speaking Readiness' },
  { value: 'real_life_communication', label: 'Real-life Communication' },
  { value: 'learning_behavior', label: 'Learning Behavior' },
];

const CEFR_LEVELS = ['', 'A1', 'A2', 'B1', 'B2'];

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('');
  const [cefrLevel, setCefrLevel] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);

  useEffect(() => {
    fetchQuestions();
  }, [page, category, cefrLevel]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '20' });
      if (category) params.set('category', category);
      if (cefrLevel) params.set('cefrLevel', cefrLevel);
      
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`/api/admin/questions?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setQuestions(data.questions || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    const token = localStorage.getItem('admin_token');
    await fetch(`/api/admin/questions/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchQuestions();
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-brand-navy">Questions ({total})</h1>
        <button
          onClick={() => { setEditingQuestion(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-brand-red text-white rounded-lg text-sm hover:bg-brand-red-dark"
        >
          <Plus className="w-4 h-4" /> Add Question
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
        >
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <select
          value={cefrLevel}
          onChange={(e) => { setCefrLevel(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
        >
          <option value="">All Levels</option>
          {CEFR_LEVELS.filter(Boolean).map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading...</div>
        ) : questions.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No questions found</div>
        ) : (
          questions.map((q) => (
            <div key={q.id} className="bg-white rounded-xl p-4 shadow-sm flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{q.questionText}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">{q.category}</span>
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">{q.cefrLevel}</span>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{q.questionType}</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${q.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {q.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setEditingQuestion(q); setShowForm(true); }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <Edit className="w-4 h-4 text-gray-500" />
                </button>
                <button
                  onClick={() => handleDelete(q.id)}
                  className="p-2 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {total > 20 && (
        <div className="flex items-center justify-between mt-4">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1 text-sm border rounded disabled:opacity-50">Previous</button>
          <span className="text-sm text-gray-500">Page {page}</span>
          <button onClick={() => setPage(page + 1)} disabled={page >= Math.ceil(total / 20)} className="px-3 py-1 text-sm border rounded disabled:opacity-50">Next</button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <QuestionForm
          question={editingQuestion}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); fetchQuestions(); }}
        />
      )}
    </div>
  );
}

function QuestionForm({ question, onClose, onSaved }: { question: any; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    questionText: question?.questionText || '',
    instructionText: question?.instructionText || '',
    questionType: question?.questionType || 'mcq',
    category: question?.category || 'grammar',
    cefrLevel: question?.cefrLevel || 'A1',
    difficulty: question?.difficulty || 'medium',
    options: question ? JSON.parse(question.optionsJson) : ['', '', '', ''],
    correctAnswer: question?.correctAnswer || '',
    explanation: question?.explanation || '',
    banglaExplanation: question?.banglaExplanation || '',
    audioUrl: question?.audioUrl || '',
    marks: question?.marks || 1,
    mistakeTags: question?.mistakeTagsJson ? JSON.parse(question.mistakeTagsJson).join(', ') : '',
    isActive: question?.isActive !== false,
  });

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const token = localStorage.getItem('admin_token');
    const url = question
      ? `/api/admin/questions/${question.id}`
      : '/api/admin/questions';
    const method = question ? 'PUT' : 'POST';

    const payload = {
      ...form,
      options: form.options.filter(Boolean),
      mistakeTags: form.mistakeTags ? form.mistakeTags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
    };

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });

    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">{question ? 'Edit' : 'Add'} Question</h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Question Text *</label>
            <textarea
              value={form.questionText}
              onChange={(e) => setForm({ ...form, questionText: e.target.value })}
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
              rows={3}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700">Instruction Text</label>
            <input
              value={form.instructionText}
              onChange={(e) => setForm({ ...form, instructionText: e.target.value })}
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600">Type</label>
              <select value={form.questionType} onChange={(e) => setForm({ ...form, questionType: e.target.value })} className="w-full mt-1 px-2 py-1.5 border rounded text-sm">
                <option value="mcq">MCQ</option>
                <option value="fill_blank">Fill Blank</option>
                <option value="word_order">Word Order</option>
                <option value="error_spot">Error Spot</option>
                <option value="audio_mcq">Audio MCQ</option>
                <option value="scenario_mcq">Scenario MCQ</option>
                <option value="self_assessment">Self Assessment</option>
                <option value="habit">Habit</option>
                <option value="attention_check">Attention Check</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full mt-1 px-2 py-1.5 border rounded text-sm">
                <option value="grammar">Grammar</option>
                <option value="vocabulary">Vocabulary</option>
                <option value="sentence_making">Sentence Making</option>
                <option value="listening">Listening</option>
                <option value="speaking_readiness">Speaking Readiness</option>
                <option value="real_life_communication">Real-life Communication</option>
                <option value="learning_behavior">Learning Behavior</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">CEFR</label>
              <select value={form.cefrLevel} onChange={(e) => setForm({ ...form, cefrLevel: e.target.value })} className="w-full mt-1 px-2 py-1.5 border rounded text-sm">
                <option value="A1">A1</option>
                <option value="A2">A2</option>
                <option value="B1">B1</option>
                <option value="B2">B2</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Difficulty</label>
              <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className="w-full mt-1 px-2 py-1.5 border rounded text-sm">
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Options *</label>
            {form.options.map((opt: string, i: number) => (
              <input
                key={i}
                value={opt}
                onChange={(e) => {
                  const newOpts = [...form.options];
                  newOpts[i] = e.target.value;
                  setForm({ ...form, options: newOpts });
                }}
                className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                placeholder={`Option ${String.fromCharCode(65 + i)}`}
              />
            ))}
            <button onClick={() => setForm({ ...form, options: [...form.options, ''] })} className="text-xs text-brand-red mt-1">+ Add Option</button>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Correct Answer *</label>
            <input
              value={form.correctAnswer}
              onChange={(e) => setForm({ ...form, correctAnswer: e.target.value })}
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
              placeholder="Must match one of the options exactly"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Marks</label>
              <input type="number" value={form.marks} onChange={(e) => setForm({ ...form, marks: parseFloat(e.target.value) })} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Mistake Tags (comma separated)</label>
              <input value={form.mistakeTags} onChange={(e) => setForm({ ...form, mistakeTags: e.target.value })} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" placeholder="tense_error, verb_form_error" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Bangla Explanation</label>
            <textarea value={form.banglaExplanation} onChange={(e) => setForm({ ...form, banglaExplanation: e.target.value })} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" rows={2} />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            <label className="text-sm">Active</label>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm border rounded-lg">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm bg-brand-red text-white rounded-lg">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
