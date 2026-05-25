'use client';

import { useState } from 'react';
import LandingPage from '@/components/landing/LandingPage';
import LeadForm from '@/components/landing/LeadForm';

export default function Home() {
  const [showForm, setShowForm] = useState(false);

  if (showForm) {
    return <LeadForm />;
  }

  return <LandingPage onStartTest={() => setShowForm(true)} />;
}
