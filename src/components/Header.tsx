import React from 'react';
import type { Profile } from '../types';
import { UserCircleIcon, Bars3Icon } from './Icons';
import { Logo } from './Logo';

interface HeaderProps {
  profile: Profile;
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ profile, onMenuClick }) => {
  return (
    <header className="bg-gray-800/50 backdrop-blur-sm border-b border-yellow-600/30 p-4 flex items-center justify-between shadow-lg sticky top-0 z-20">
      <div className="flex items-center">
         <button onClick={onMenuClick} className="lg:hidden text-yellow-400 mr-4">
            <Bars3Icon className="h-6 w-6" />
         </button>
         <Logo className="h-8 w-auto" textColorClass="text-yellow-400" />
      </div>
      <div className="flex items-center bg-gray-700/50 rounded-full border border-yellow-500/30 p-2 sm:px-3 transition-all">
        <UserCircleIcon className="h-6 w-6 text-yellow-400" />
        <span className="text-sm font-semibold text-white hidden sm:block sm:ml-2">{profile.name}</span>
      </div>
    </header>
  );
};