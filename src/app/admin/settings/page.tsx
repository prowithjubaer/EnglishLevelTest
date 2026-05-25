'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [message, setMessage] = useState('');

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy mb-6">Settings</h1>

      <div className="space-y-6">
        {/* Test Configuration */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-brand-navy mb-4">Test Configuration</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Default Test Mode</label>
              <select className="w-full mt-1 px-3 py-2 border rounded-lg text-sm">
                <option>Standard Test</option>
                <option>Quick Test</option>
                <option>Complete Placement Test</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Retake Cooldown (days)</label>
              <input type="number" defaultValue={7} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" />
            </div>
          </div>
        </div>

        {/* Scoring Weights */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-brand-navy mb-4">Scoring Weights (must sum to 1.0)</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { key: 'grammar', label: 'Grammar', default: 0.14 },
              { key: 'vocabulary', label: 'Vocabulary', default: 0.16 },
              { key: 'sentenceMaking', label: 'Sentence Making', default: 0.22 },
              { key: 'listening', label: 'Listening', default: 0.16 },
              { key: 'speakingReadiness', label: 'Speaking Readiness', default: 0.14 },
              { key: 'realLifeCommunication', label: 'Real-life Communication', default: 0.10 },
              { key: 'learningBehavior', label: 'Learning Behavior', default: 0.08 },
            ].map((item) => (
              <div key={item.key}>
                <label className="text-xs font-medium text-gray-600">{item.label}</label>
                <input type="number" step="0.01" defaultValue={item.default} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" />
              </div>
            ))}
          </div>
        </div>

        {/* Level Ranges */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-brand-navy mb-4">Level Score Ranges</h3>
          <div className="space-y-3">
            {[
              { level: 'Beginner (A1)', min: 0, max: 25 },
              { level: 'Basic (A2)', min: 26, max: 45 },
              { level: 'Intermediate (B1)', min: 46, max: 65 },
              { level: 'Upper Intermediate (B2)', min: 66, max: 80 },
              { level: 'Advanced (B2+)', min: 81, max: 100 },
            ].map((item) => (
              <div key={item.level} className="flex items-center gap-3">
                <span className="text-sm w-48">{item.level}</span>
                <input type="number" defaultValue={item.min} className="w-20 px-2 py-1 border rounded text-sm" />
                <span className="text-gray-400">–</span>
                <input type="number" defaultValue={item.max} className="w-20 px-2 py-1 border rounded text-sm" />
              </div>
            ))}
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-brand-navy mb-4">Contact & Links</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">WhatsApp Number</label>
              <input type="text" defaultValue="+8801334556130" className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Course Link</label>
              <input type="text" defaultValue="proenglishbd.com/courses" className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" />
            </div>
          </div>
        </div>

        <button
          onClick={() => setMessage('Settings saved!')}
          className="btn-primary"
        >
          Save Settings
        </button>
        {message && <p className="text-green-600 text-sm">{message}</p>}
      </div>
    </div>
  );
}
