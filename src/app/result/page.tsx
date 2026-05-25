'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ResultPage from '@/components/result/ResultPage';

export default function Result() {
  const router = useRouter();
  const [result, setResult] = useState<any>(null);
  const [leadInfo, setLeadInfo] = useState<any>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('testResult');
    if (!stored) {
      router.push('/');
      return;
    }
    setResult(JSON.parse(stored));
    setLeadInfo({
      name: sessionStorage.getItem('leadName'),
      whatsapp: sessionStorage.getItem('leadWhatsapp'),
      goal: sessionStorage.getItem('leadGoal'),
      leadId: sessionStorage.getItem('leadId'),
    });
  }, []);

  if (!result || !leadInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-red border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return <ResultPage result={result} leadInfo={leadInfo} />;
}
