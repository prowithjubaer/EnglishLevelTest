'use client';

import { CheckCircle, BookOpen, BarChart3, Target, FileText, MessageCircle } from 'lucide-react';

interface Props {
  onStartTest: () => void;
}

export default function LandingPage({ onStartTest }: Props) {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-hero text-white py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-4 inline-block bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm">
            ✨ No payment required • Instant result
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
            Free English Level Test
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-3 font-bangla">
            মাত্র ৭–১০ মিনিটে জানুন আপনার English Level, Weakness এবং Fluency Roadmap
          </p>
          <p className="text-base md:text-lg text-gray-300 mb-8 max-w-2xl mx-auto font-bangla">
            আপনি Beginner, Basic, Intermediate নাকি Advanced—শুধু level না, কেন fluent হতে পারছেন না সেটাও জানুন।
          </p>
          <button
            onClick={onStartTest}
            className="btn-primary text-lg md:text-xl px-10 py-4 animate-pulse-glow"
          >
            🚀 আমার English Level জানুন
          </button>
          <p className="mt-4 text-sm text-gray-400">No payment required. Instant result.</p>
        </div>
      </section>

      {/* What You Will Get */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="section-title text-center mb-4">What You Will Get</h2>
          <p className="text-center text-gray-600 mb-12 font-bangla">Test দিলে আপনি পাবেন:</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<BarChart3 className="w-8 h-8 text-brand-red" />}
              title="Your English Level"
              description="CEFR-based scientific level assessment"
            />
            <FeatureCard 
              icon={<Target className="w-8 h-8 text-brand-red" />}
              title="Skill Breakdown"
              description="Grammar, Vocabulary, Sentence Making, Listening, Speaking সব skill আলাদাভাবে"
            />
            <FeatureCard 
              icon={<CheckCircle className="w-8 h-8 text-brand-red" />}
              title="Main Weakness"
              description="কেন fluent হতে পারছেন না—exact কারণ জানুন"
            />
            <FeatureCard 
              icon={<BookOpen className="w-8 h-8 text-brand-red" />}
              title="75-Day Fluency Roadmap"
              description="আপনার level অনুযায়ী personalized roadmap"
            />
            <FeatureCard 
              icon={<MessageCircle className="w-8 h-8 text-brand-red" />}
              title="Recommended Course"
              description="আপনার weakness অনুযায়ী best course suggestion"
            />
            <FeatureCard 
              icon={<FileText className="w-8 h-8 text-brand-red" />}
              title="PDF Report"
              description="Download করুন আপনার complete result report"
            />
          </div>
        </div>
      </section>

      {/* Who This Test Is For */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="section-title text-center mb-12">এই Test কাদের জন্য?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              'যারা English বুঝেন কিন্তু বলতে পারেন না',
              'যারা vocabulary মনে করতে পারেন না',
              'যারা sentence বানাতে পারেন না',
              'IELTS Speaking students',
              'Freelancers who need client communication',
              'Job seekers preparing for interviews',
              'Office professionals',
              'Bangladeshi expatriates',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700 font-bangla">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Course Connection */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <div className="card bg-gradient-to-br from-red-50 to-blue-50 border-none">
            <h3 className="text-xl md:text-2xl font-bold text-brand-navy mb-4 font-bangla">
              আপনার Result অনুযায়ী Course Recommendation
            </h3>
            <p className="text-gray-600 font-bangla mb-6">
              আপনার result অনুযায়ী Pro English BD-এর <strong>75-Day English Fluency System</strong> বা <strong>Client Communication English</strong> course recommend করা হবে।
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <span className="px-3 py-1 bg-brand-navy text-white rounded-full text-sm">75-Day Fluency</span>
              <span className="px-3 py-1 bg-brand-red text-white rounded-full text-sm">Client Communication</span>
              <span className="px-3 py-1 bg-gray-700 text-white rounded-full text-sm">IELTS Speaking</span>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4 gradient-hero text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to know your English Level?
          </h2>
          <p className="text-gray-300 mb-8 font-bangla text-lg">
            মাত্র ৭–১০ মিনিট সময় দিন। সম্পূর্ণ Free।
          </p>
          <button
            onClick={onStartTest}
            className="btn-primary text-lg px-10 py-4 animate-pulse-glow"
          >
            Start My Free Test
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-navy-dark text-gray-400 py-8 px-4 text-center">
        <p className="text-sm">© 2024 Pro English BD. All rights reserved.</p>
        <p className="text-xs mt-2">proenglishbd.com | +8801334556130</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="card-hover text-center">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="font-bold text-lg text-brand-navy mb-2">{title}</h3>
      <p className="text-gray-600 text-sm font-bangla">{description}</p>
    </div>
  );
}
