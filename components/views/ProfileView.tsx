import React, { useState } from 'react';
import type { Profile, WritingTone } from '../../types';
import { Button } from '../common/Button';
import { Card } from '../common/Card';

interface ProfileViewProps {
  profile: Profile;
  onProfileUpdate: (newProfile: Profile) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ profile, onProfileUpdate }) => {
  const [name, setName] = useState(profile.name);
  const [preferredTone, setPreferredTone] = useState<WritingTone>(profile.preferredTone);
  const [isSaved, setIsSaved] = useState(false);
  
  const handleSave = () => {
    onProfileUpdate({ name, preferredTone });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };
  
  return (
    <div className="max-w-4xl mx-auto">
        <Card className="p-6 md:p-8" isGlowing>
            <h2 className="text-2xl font-bold text-yellow-300 mb-6 font-montserrat">Profile & Settings</h2>
            
            <div className="space-y-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-yellow-300 mb-2">Your Name</label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full max-w-sm bg-gray-800 border-2 border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-yellow-300 mb-3">Default Writing Tone</label>
                    <div className="flex gap-4">
                      <Button variant={preferredTone === 'student' ? 'primary' : 'secondary'} onClick={() => setPreferredTone('student')}>Student</Button>
                      <Button variant={preferredTone === 'ai' ? 'primary' : 'secondary'} onClick={() => setPreferredTone('ai')}>AI</Button>
                    </div>
                </div>
                
                <div className="pt-4">
                  <Button onClick={handleSave} disabled={isSaved}>
                    {isSaved ? 'Saved!' : 'Save Changes'}
                  </Button>
                </div>
            </div>
        </Card>
        
        <Card className="mt-8 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-yellow-300 mb-4 font-montserrat">History</h2>
            <div className="bg-yellow-400/10 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                <h4 className="font-bold text-yellow-300">Feature Coming Soon</h4>
                <p className="text-sm text-yellow-200/80">
                  Your chat history is automatically saved per session. A future update will allow you to browse all past chats, generated presentations, and analysis reports right here.
                </p>
            </div>
        </Card>
    </div>
  );
};