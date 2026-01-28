
import React, { useState } from 'react';

interface Props {
  activeTab: string;
  onTabChange: (tab: any) => void;
  showDebug: boolean;
}

const RadialMenu: React.FC<Props> = ({ activeTab, onTabChange, showDebug }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Stats', icon: '📊', color: 'bg-emerald-500' },
    { id: 'pigs', label: 'Pigs', icon: '🐖', color: 'bg-emerald-600' },
    { id: 'feed', label: 'Feed', icon: '🌾', color: 'bg-emerald-700' },
    { id: 'sales', label: 'Sales', icon: '💰', color: 'bg-blue-600' },
    { id: 'misc', label: 'Misc', icon: '📦', color: 'bg-slate-600' },
    ...(showDebug ? [{ id: 'debug', label: 'System', icon: '⚙️', color: 'bg-slate-800' }] : []),
  ];

  const toggleMenu = () => setIsOpen(!isOpen);

  // Constants for vertical positioning
  const triggerSize = 64; // w-16 = 4rem = 64px
  const itemSize = 56;    // w-14 = 3.5rem = 56px
  const spacing = 72;    // Vertical distance between items
  const centerOffset = (triggerSize - itemSize) / 2;

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* Backdrop blur when open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity duration-300" 
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className="relative">
        {/* Vertical Fan-out Buttons */}
        {menuItems.map((item, index) => {
          // Calculate vertical position (moving upwards)
          // index 0 (Dashboard) should be the topmost item when expanded? 
          // Actually, let's keep them in order from trigger upwards.
          const y = isOpen ? -((index + 1) * spacing) : 0;

          return (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                setIsOpen(false);
              }}
              className={`absolute flex flex-col items-center justify-center w-14 h-14 rounded-full text-white shadow-xl transition-all duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] transform ${item.color} ${
                isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-0 pointer-events-none'
              } hover:scale-110 active:scale-95 border-2 border-white/20`}
              style={{
                left: `${centerOffset}px`,
                top: `${centerOffset + y}px`,
              }}
              title={item.label}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[9px] font-bold uppercase leading-none mt-0.5">{item.label}</span>
            </button>
          );
        })}

        {/* Main Toggle Button */}
        <button
          onClick={toggleMenu}
          className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 transform ${
            isOpen ? 'bg-slate-800 rotate-45' : 'bg-emerald-500 hover:bg-emerald-600'
          } border-4 border-white`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={isOpen ? "M6 18L18 6M6 6l12 12" : "M12 4v16m8-8H4"}
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default RadialMenu;
