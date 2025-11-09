
import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ChatView } from './components/views/ChatView';
import { PptMakerView } from './components/views/PptMakerView';
import { ConverterView } from './components/views/ConverterView';
import { AnalyzerView } from './components/views/AnalyzerView';
import { ProfileView } from './components/views/ProfileView';
import { OnboardingModal } from './components/OnboardingModal';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { Profile, View } from './types';

const App: React.FC = () => {
  const [profile, setProfile] = useLocalStorage<Profile | null>('airus-profile', null);
  const [activeView, setActiveView] = useState<View>('chat');
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const handleProfileSave = (newProfile: Profile) => {
    setProfile(newProfile);
  };
  
  const renderView = () => {
    if (!profile) return null;
    switch (activeView) {
      case 'chat':
        return <ChatView profile={profile} />;
      case 'ppt-maker':
        return <PptMakerView profile={profile} />;
      case 'converter':
        return <ConverterView />;
      case 'analyzer':
        return <AnalyzerView profile={profile} />;
      case 'profile':
        return <ProfileView profile={profile} onProfileUpdate={handleProfileSave} />;
      default:
        return <ChatView profile={profile} />;
    }
  };

  if (!profile) {
    return <OnboardingModal onSave={handleProfileSave} />;
  }

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      <Sidebar activeView={activeView} setActiveView={setActiveView} isOpen={isSidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header profile={profile} onMenuClick={() => setSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-gray-900">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default App;
