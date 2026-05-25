'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TestEngine from '@/components/test/TestEngine';

export default function TestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [testData, setTestData] = useState<any>(null);

  useEffect(() => {
    const leadId = sessionStorage.getItem('leadId');
    if (!leadId) {
      router.push('/');
      return;
    }

    startTest(leadId);
  }, []);

  const startTest = async (leadId: string) => {
    try {
      const res = await fetch('/api/test/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, testModeSlug: 'standard' }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setTestData(data);
      }
    } catch (err) {
      setError('Failed to start test. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-bangla">আপনার test প্রস্তুত হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="card text-center max-w-md">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={() => router.push('/')} className="btn-primary">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!testData) return null;

  return <TestEngine testData={testData} />;
}
