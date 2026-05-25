'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const GOALS = [
  'Spoken English',
  'IELTS Speaking',
  'IELTS Candidate',
  'Freelancing / Client Communication',
  'Job Interview',
  'Office English',
  'Abroad Communication',
  'Basic English',
  'Not sure',
];

export default function LeadForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    email: '',
    goal: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.whatsapp.trim()) newErrors.whatsapp = 'WhatsApp number is required';
    else if (!/^[\+]?[0-9]{10,15}$/.test(formData.whatsapp.replace(/[\s\-]/g, ''))) {
      newErrors.whatsapp = 'Valid phone number required';
    }
    if (!formData.goal) newErrors.goal = 'Please select your goal';
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.leadId) {
        // Store lead info in sessionStorage for the test
        sessionStorage.setItem('leadId', data.leadId);
        sessionStorage.setItem('leadName', formData.name);
        sessionStorage.setItem('leadGoal', formData.goal);
        sessionStorage.setItem('leadWhatsapp', formData.whatsapp);
        router.push('/test');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-brand-navy mb-2">
              Start Your English Level Test
            </h2>
            <p className="text-gray-500 text-sm font-bangla">
              আপনার result এবং roadmap personalize করার জন্য এই তথ্য নেওয়া হচ্ছে।
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-red focus:border-transparent outline-none transition"
                placeholder="আপনার নাম"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-red focus:border-transparent outline-none transition"
                placeholder="+8801XXXXXXXXX"
              />
              {errors.whatsapp && <p className="text-red-500 text-xs mt-1">{errors.whatsapp}</p>}
            </div>

            {/* Email (optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-red focus:border-transparent outline-none transition"
                placeholder="your@email.com"
              />
            </div>

            {/* Goal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                আপনার Goal কী? <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {GOALS.map((goal) => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => setFormData({ ...formData, goal })}
                    className={`px-3 py-2 text-xs md:text-sm rounded-lg border transition-all ${
                      formData.goal === goal
                        ? 'bg-brand-red text-white border-brand-red shadow-md'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-brand-red'
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
              {errors.goal && <p className="text-red-500 text-xs mt-1">{errors.goal}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-4 text-lg disabled:opacity-50"
            >
              {loading ? 'Loading...' : '🚀 Start Test'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
