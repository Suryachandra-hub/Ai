import React, { useState } from 'react';
import type { Profile, WritingTone } from '../types';
import { Button } from './common/Button';
import { Card } from './common/Card';
import { Logo } from './Logo';

interface OnboardingModalProps {
  onSave: (profile: Profile) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onSave }) => {
  const [name, setName] = useState('');
  const [preferredTone, setPreferredTone] = useState<WritingTone>('student');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave({ name: name.trim(), preferredTone });
    }
  };

  const ToneSelector: React.FC<{ value: WritingTone, onChange: (value: WritingTone) => void }> = ({ value, onChange }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div 
        onClick={() => onChange('student')}
        className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 ${value === 'student' ? 'border-yellow-400 bg-yellow-400/10 gold-glow' : 'border-gray-600 hover:border-yellow-500/50'}`}
      >
        <h4 className="font-bold text-yellow-300">Student Tone</h4>
        <p className="text-sm text-gray-300 mt-1">Simple, human-like, and natural phrasing. Perfect for drafting and understanding concepts.</p>
      </div>
      <div 
        onClick={() => onChange('ai')}
        className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 ${value === 'ai' ? 'border-yellow-400 bg-yellow-400/10 gold-glow' : 'border-gray-600 hover:border-yellow-500/50'}`}
      >
        <h4 className="font-bold text-yellow-300">AI Tone</h4>
        <p className="text-sm text-gray-300 mt-1">Formal, concise, and polished. Ideal for final submissions and professional summaries.</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl" isGlowing>
        <form onSubmit={handleSubmit} className="p-6 md:p-8">
          <Logo textColorClass="text-gray-100" className="h-12 w-auto mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-yellow-400 mb-2 font-montserrat gold-text-glow text-center">Welcome!</h2>
          <p className="text-gray-300 mb-6 text-center">Let's set up your profile to personalize your experience.</p>
          
          <div className="mb-6">
            <label htmlFor="name" className="block text-sm font-medium text-yellow-300 mb-2">What should we call you?</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-800 border-2 border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all"
              placeholder="e.g., Alex"
              required
            />
          </div>
          
          <div className="mb-8">
            <label className="block text-sm font-medium text-yellow-300 mb-3">Choose your preferred writing tone:</label>
            <ToneSelector value={preferredTone} onChange={setPreferredTone} />
            <p className="text-xs text-gray-400 mt-3 text-center">*You can change this preference later in the Profile section.</p>
          </div>
          
          <Button type="submit" className="w-full" disabled={!name.trim()}>
            Get Started
          </Button>
        </form>
      </Card>
    </div>
  );
};