
import React from 'react';

interface ToggleSwitchProps {
  label: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, enabled, onChange }) => {
  return (
    <label className="flex items-center cursor-pointer">
      <div className="relative">
        <input type="checkbox" className="sr-only" checked={enabled} onChange={() => onChange(!enabled)} />
        <div className={`block w-14 h-8 rounded-full transition-colors ${enabled ? 'bg-yellow-500' : 'bg-gray-600'}`}></div>
        <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${enabled ? 'transform translate-x-6' : ''}`}></div>
      </div>
      <div className="ml-3 text-gray-200 font-medium text-sm">{label}</div>
    </label>
  );
};