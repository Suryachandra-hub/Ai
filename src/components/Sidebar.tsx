import React from 'react';
import type { View } from '../types';
import { ChatBubbleLeftRightIcon, PresentationChartBarIcon, DocumentMagnifyingGlassIcon, ArrowsRightLeftIcon, UserIcon, XMarkIcon } from './Icons';
import { Logo } from './Logo';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
}

const NavItem: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => {
  const baseClasses = "flex items-center w-full px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 transform";
  const activeClasses = "bg-yellow-400/20 text-yellow-300 gold-glow scale-105";
  const inactiveClasses = "text-gray-300 hover:bg-gray-700/50 hover:text-white";

  return (
    <li>
      <button
        onClick={onClick}
        className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
      >
        {icon}
        <span className="ml-4">{label}</span>
      </button>
    </li>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isOpen, setOpen }) => {
  const navItems: { id: View; label: string; icon: React.ReactNode }[] = [
    { id: 'chat', label: 'AI Chat', icon: <ChatBubbleLeftRightIcon className="h-5 w-5" /> },
    { id: 'ppt-maker', label: 'PPT Maker', icon: <PresentationChartBarIcon className="h-5 w-5" /> },
    { id: 'converter', label: 'Converter Suite', icon: <ArrowsRightLeftIcon className="h-5 w-5" /> },
    { id: 'analyzer', label: 'Analyzer', icon: <DocumentMagnifyingGlassIcon className="h-5 w-5" /> },
    { id: 'profile', label: 'Profile & History', icon: <UserIcon className="h-5 w-5" /> },
  ];

  const handleItemClick = (view: View) => {
    setActiveView(view);
    setOpen(false); // Close sidebar on mobile after selection
  };
  
  const sidebarClasses = `
    absolute lg:relative z-30 lg:z-auto
    h-full w-64 bg-gray-800 border-r border-yellow-600/20
    flex-shrink-0 flex flex-col p-4 transition-transform duration-300 ease-in-out
    ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
  `;

  return (
    <>
      <div className={sidebarClasses}>
        <div className="flex items-center justify-between mb-8">
            <Logo className="h-9 w-auto" textColorClass="text-yellow-400" />
            <button onClick={() => setOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
                <XMarkIcon className="h-6 w-6"/>
            </button>
        </div>
        <nav>
          <ul className="space-y-3">
            {navItems.map((item) => (
              <NavItem
                key={item.id}
                label={item.label}
                icon={item.icon}
                isActive={activeView === item.id}
                onClick={() => handleItemClick(item.id)}
              />
            ))}
          </ul>
        </nav>
        <div className="mt-auto p-4 bg-gray-900/50 rounded-lg border border-yellow-500/20">
          <p className="text-xs text-gray-400">
            <strong>Disclaimer:</strong> This tool is for educational assistance. Always verify information and adhere to your institution's academic integrity policies.
          </p>
        </div>
      </div>
      {isOpen && <div onClick={() => setOpen(false)} className="fixed inset-0 bg-black/60 z-20 lg:hidden"></div>}
    </>
  );
};