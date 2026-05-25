'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { WEAKNESS_MESSAGES } from '@/lib/scoring';
import { Download, MessageCircle, ExternalLink, RotateCcw, Clock, Eye } from 'lucide-react';

interface ResultData {
  attemptId: string;
  totalScore: number;
  weightedScore: number;
  level: string;
  cefrLevel: string;
  testConfidence: string;
  sectionPercentages: Record<string, number>;
  weaknesses: string[];
  personalizedMessage: string;
  recommendedCourse: string;
  roadmap: { days: string; title: string; description: string }[];
}

interface LeadInfo {
  name: string;
  whatsapp: string;
  goal: string;
  leadId: string;
}

const SECTION_LABELS: Record<string, string> = {
  grammar: 'Grammar in Use',
  vocabulary: 'Vocabulary in Context',
  sentenceMaking: 'Sentence Making',
  listening: 'Listening',
  speakingReadiness: 'Speaking Readiness',
  realLifeCommunication: 'Real-life Communication',
  learningBehavior: 'Learning Behavior',
};

const SECTION_ICONS: Record<string, string> = {
  grammar: '🧠',
  vocabulary: '📚',
  sentenceMaking: '✍️',
  listening: '🎧',
  speakingReadiness: '🗣️',
  realLifeCommunication: '💬',
  learningBehavior: '📋',
};

const LEVEL_COLORS: Record<string, string> = {
  Beginner: 'from-red-500 to-red-600',
  Basic: 'from-orange-500 to-orange-600',
  Intermediate: 'from-yellow-500 to-yellow-600',
  'Upper Intermediate': 'from-green-500 to-green-600',
  Advanced: 'from-blue-500 to-blue-600',
};

const BADGES: Record<string, string[]> = {
  Beginner: ['🌱 Foundation Builder'],
  Basic: ['📖 Vocabulary Explorer', '🌱 Sentence Starter'],
  Intermediate: ['✍️ Sentence Builder', '🎯 Fluency Seeker'],
  'Upper Intermediate': ['🗣️ Future Fluent Speaker', '⭐ Communication Ready'],
  Advanced: ['🏆 Advanced Communicator', '💎 Near-Native Ready'],
};

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

export default function ResultPage({ result, leadInfo }: { result: ResultData; leadInfo: LeadInfo }) {
  const router = useRouter();
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const testTimeSeconds = parseInt(sessionStorage.getItem('testTimeSeconds') || '0');

  const trackAction = async (actionType: string) => {
    try {
      await fetch('/api/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: leadInfo.leadId,
          attemptId: result.attemptId,
          actionType,
        }),
      });
    } catch {}
  };

  const whatsappMessage = encodeURIComponent(
    `Assalamu Alaikum, আমি Pro English BD English Level Test দিয়েছি।\n\nName: ${leadInfo.name}\nMy Level: ${result.level} / ${result.cefrLevel}\nScore: ${result.weightedScore}/100\nMain Weakness: ${result.weaknesses.slice(0, 3).map(w => WEAKNESS_MESSAGES[w]?.split('.')[0] || w).join(', ')}\nGoal: ${leadInfo.goal}\n\nআমি জানতে চাই আমার জন্য কোন course/roadmap best হবে।`
  );

  const handleWhatsAppClick = () => {
    trackAction('whatsapp_clicked');
    window.open(`https://wa.me/8801334556130?text=${whatsappMessage}`, '_blank');
  };

  const handleCourseClick = () => {
    trackAction('course_link_clicked');
    window.open('https://proenglishbd.com/courses', '_blank');
  };

  const handlePdfDownload = async () => {
    setPdfGenerating(true);
    trackAction('pdf_downloaded');

    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      // Use standard font that supports basic latin - Bangla will show transliterated
      doc.setFont('helvetica');

      // Header
      doc.setFontSize(22);
      doc.setTextColor(26, 35, 50);
      doc.text('Pro English BD', 105, 20, { align: 'center' });
      doc.setFontSize(11);
      doc.setTextColor(100, 100, 100);
      doc.text('English Level Test Report', 105, 28, { align: 'center' });

      // Line
      doc.setDrawColor(220, 38, 38);
      doc.setLineWidth(1.5);
      doc.line(20, 33, 190, 33);

      // Student Info
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      let y = 42;
      doc.text(`Name: ${leadInfo.name}`, 20, y); y += 6;
      doc.text(`WhatsApp: ${leadInfo.whatsapp}`, 20, y); y += 6;
      doc.text(`Goal: ${leadInfo.goal}`, 20, y); y += 6;
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, y); y += 6;
      doc.text(`Time Taken: ${formatTime(testTimeSeconds)}`, 20, y); y += 10;

      // Result Box
      doc.setFillColor(245, 245, 255);
      doc.roundedRect(20, y, 170, 25, 3, 3, 'F');
      doc.setFontSize(16);
      doc.setTextColor(220, 38, 38);
      doc.text(`Level: ${result.level} / ${result.cefrLevel}`, 105, y + 10, { align: 'center' });
      doc.setFontSize(12);
      doc.setTextColor(26, 35, 50);
      doc.text(`Score: ${result.weightedScore}/100  |  Confidence: ${result.testConfidence}`, 105, y + 19, { align: 'center' });
      y += 32;

      // Section Scores
      doc.setFontSize(13);
      doc.setTextColor(26, 35, 50);
      doc.text('Skill Breakdown:', 20, y); y += 8;
      doc.setFontSize(9);

      const sections = Object.entries(result.sectionPercentages);
      for (const [key, value] of sections) {
        const label = SECTION_LABELS[key] || key;
        doc.setTextColor(60, 60, 60);
        doc.text(`${label}:`, 25, y);
        doc.setTextColor(26, 35, 50);
        doc.text(`${value}%`, 100, y);
        // Draw bar
        doc.setFillColor(230, 230, 230);
        doc.roundedRect(110, y - 3, 60, 4, 1, 1, 'F');
        const barColor = (value as number) >= 70 ? [34, 197, 94] : (value as number) >= 50 ? [234, 179, 8] : [239, 68, 68];
        doc.setFillColor(barColor[0], barColor[1], barColor[2]);
        doc.roundedRect(110, y - 3, Math.max(((value as number) / 100) * 60, 2), 4, 1, 1, 'F');
        y += 7;
      }
      y += 6;

      // Weaknesses
      doc.setFontSize(13);
      doc.setTextColor(26, 35, 50);
      doc.text('Main Weaknesses:', 20, y); y += 7;
      doc.setFontSize(9);
      for (const w of result.weaknesses.slice(0, 5)) {
        const msg = WEAKNESS_MESSAGES[w] || w;
        // Keep only ASCII-safe text for PDF
        const safeLine = msg.replace(/[^\x00-\x7F]/g, '');
        if (safeLine.trim()) {
          const lines = doc.splitTextToSize(`- ${safeLine}`, 160);
          doc.text(lines, 25, y);
          y += lines.length * 5;
        } else {
          doc.text(`- ${w}`, 25, y); y += 5;
        }
      }
      y += 6;

      // Roadmap
      if (y > 240) { doc.addPage(); y = 20; }
      doc.setFontSize(13);
      doc.setTextColor(26, 35, 50);
      doc.text('75-Day Fluency Roadmap:', 20, y); y += 8;
      doc.setFontSize(9);
      for (const item of result.roadmap) {
        doc.setTextColor(220, 38, 38);
        doc.text(`${item.days}:`, 25, y);
        doc.setTextColor(26, 35, 50);
        doc.text(item.title, 55, y); y += 5;
        doc.setTextColor(100, 100, 100);
        doc.text(item.description, 30, y); y += 7;
      }
      y += 6;

      // Course Recommendation
      doc.setFontSize(11);
      doc.setTextColor(26, 35, 50);
      doc.text(`Recommended Course: ${result.recommendedCourse}`, 20, y); y += 8;

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('Pro English BD | proenglishbd.com | WhatsApp: +8801334556130', 105, 285, { align: 'center' });

      doc.save(`English-Level-Report-${leadInfo.name.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`);
    } catch (err) {
      console.error('PDF error:', err);
    } finally {
      setPdfGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Hero Result */}
      <section className={`bg-gradient-to-br ${LEVEL_COLORS[result.level] || 'from-gray-500 to-gray-600'} text-white py-12 px-4`}>
        <div className="max-w-3xl mx-auto text-center animate-fadeInUp">
          <p className="text-lg mb-2">🎉 আপনার English Level Test সম্পন্ন হয়েছে!</p>
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mt-4">
            <p className="text-sm opacity-90 mb-1">Your English Level</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">{result.level}</h1>
            <p className="text-xl opacity-90">CEFR: {result.cefrLevel}</p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <div className="bg-white/20 rounded-lg px-4 py-2">
                <span className="text-sm opacity-80">Score</span>
                <p className="text-2xl font-bold">{result.weightedScore}/100</p>
              </div>
              <div className="bg-white/20 rounded-lg px-4 py-2">
                <span className="text-sm opacity-80">Confidence</span>
                <p className="text-lg font-semibold capitalize">{result.testConfidence}</p>
              </div>
              <div className="bg-white/20 rounded-lg px-4 py-2">
                <span className="text-sm opacity-80">Time</span>
                <p className="text-lg font-semibold flex items-center gap-1"><Clock className="w-4 h-4" />{formatTime(testTimeSeconds)}</p>
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {(BADGES[result.level] || []).map((badge, i) => (
              <span key={i} className="bg-white/20 px-3 py-1 rounded-full text-sm">{badge}</span>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 -mt-6 space-y-6">
        {/* Low confidence warning */}
        {result.testConfidence === 'low' && (
          <div className="card bg-yellow-50 border-yellow-200">
            <p className="text-yellow-800 text-sm font-bangla">
              ⚠️ আপনার result fully reliable নাও হতে পারে, কারণ আপনি কিছু প্রশ্ন খুব দ্রুত/skip করেছেন। আরো accurate result পেতে আবার test দিন।
            </p>
          </div>
        )}

        {/* Skill Breakdown */}
        <div className="card">
          <h2 className="text-xl font-bold text-brand-navy mb-4">📊 Skill Breakdown</h2>
          <div className="space-y-3">
            {Object.entries(result.sectionPercentages).map(([key, value]) => (
              <div key={key}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">
                    {SECTION_ICONS[key] || '📌'} {SECTION_LABELS[key] || key}
                  </span>
                  <span className="font-semibold text-brand-navy">{value as number}%</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      (value as number) >= 70 ? 'bg-green-500' :
                      (value as number) >= 50 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weaknesses */}
        <div className="card">
          <h2 className="text-xl font-bold text-brand-navy mb-4">⚡ আপনার Main Problems</h2>
          <div className="space-y-3">
            {result.weaknesses.map((w: string, i: number) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-red-50 rounded-xl">
                <span className="text-red-500 font-bold text-lg">{i + 1}.</span>
                <p className="text-sm text-gray-700 font-bangla">
                  {WEAKNESS_MESSAGES[w] || w}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Personalized Message */}
        <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
          <h2 className="text-xl font-bold text-brand-navy mb-3">💡 আপনার জন্য Analysis</h2>
          <p className="text-gray-700 font-bangla leading-relaxed">{result.personalizedMessage}</p>
        </div>

        {/* Roadmap */}
        <div className="card">
          <h2 className="text-xl font-bold text-brand-navy mb-4">🗺️ আপনার 75-Day Fluency Roadmap</h2>
          <div className="space-y-4">
            {result.roadmap.map((item: any, i: number) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-brand-red text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </div>
                  {i < result.roadmap.length - 1 && (
                    <div className="w-0.5 h-full bg-gray-200 mt-1"></div>
                  )}
                </div>
                <div className="pb-4">
                  <p className="text-xs text-brand-red font-semibold">{item.days}</p>
                  <h4 className="font-bold text-brand-navy">{item.title}</h4>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Course Recommendation */}
        <div className="card border-2 border-brand-red">
          <h2 className="text-xl font-bold text-brand-navy mb-4">🎓 Recommended Course</h2>
          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-5 mb-4">
            <h3 className="font-bold text-lg text-brand-navy mb-2">{result.recommendedCourse}</h3>
            <p className="text-sm text-gray-600 font-bangla mb-3">
              আপনার weakness অনুযায়ী এই course আপনাকে fluent হতে সাহায্য করবে।
            </p>
            <button onClick={handleCourseClick} className="btn-primary text-sm flex items-center gap-2">
              <ExternalLink className="w-4 h-4" /> Course Details দেখুন
            </button>
          </div>
        </div>

        {/* CTAs */}
        <div className="space-y-3">
          {/* Review Answers */}
          <button
            onClick={() => router.push('/review')}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-3"
          >
            <Eye className="w-5 h-5" />
            উত্তর রিভিউ করুন (Correct Answers দেখুন)
          </button>

          {/* WhatsApp */}
          <button
            onClick={handleWhatsAppClick}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 text-lg"
          >
            <MessageCircle className="w-6 h-6" />
            আমার Result অনুযায়ী Course Suggest করুন
          </button>

          {/* PDF */}
          <button
            onClick={handlePdfDownload}
            disabled={pdfGenerating}
            className="w-full btn-secondary py-4 flex items-center justify-center gap-3"
          >
            <Download className="w-5 h-5" />
            {pdfGenerating ? 'Generating PDF...' : 'Download My PDF Report'}
          </button>

          {/* Retake */}
          <div className="text-center pt-4">
            <p className="text-sm text-gray-500 font-bangla mb-2">
              ৭ দিন পর আবার test দিয়ে progress check করুন।
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="text-brand-red text-sm font-medium hover:underline flex items-center justify-center gap-1 mx-auto"
            >
              <RotateCcw className="w-4 h-4" /> Retake Test
            </button>
          </div>
        </div>

        {/* Speaking CTA */}
        <div className="card bg-purple-50 border-purple-100 text-center">
          <p className="text-sm text-purple-700 font-bangla">
            🎙️ আপনার speaking sample teacher review করলে আরো accurate feedback পাওয়া যাবে।
          </p>
          <button
            onClick={handleWhatsAppClick}
            className="mt-3 text-purple-700 font-semibold text-sm hover:underline"
          >
            WhatsApp করুন →
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 text-center text-gray-400 text-xs px-4">
        <p>© 2024 Pro English BD | proenglishbd.com</p>
      </footer>
    </div>
  );
}
