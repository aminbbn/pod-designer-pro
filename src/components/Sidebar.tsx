import React from 'react';
import { Shirt, Type, Image as ImageIcon, Sparkles, Layers, Settings, Upload, User } from 'lucide-react';
import { TabType } from '../types';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: TabType.PRODUCTS, icon: Shirt, label: 'محصولات' },
    { id: TabType.TEXT, icon: Type, label: 'متن' },
    { id: TabType.GRAPHICS, icon: ImageIcon, label: 'گرافیک' },
    { id: TabType.UPLOADS, icon: Upload, label: 'آپلود' },
    { id: TabType.AI_STUDIO, icon: Sparkles, label: 'هوش مصنوعی', special: true },
    { id: TabType.LAYERS, icon: Layers, label: 'لایه‌ها' },
    { id: TabType.SETTINGS, icon: Settings, label: 'تنظیمات' },
  ];

  return (
    <aside className="w-24 h-full bg-[#050505] border-l border-white/5 flex flex-col items-center py-6 z-50 relative shadow-2xl">
      {/* Navigation Items - Logo Removed */}
      <nav className="flex-1 w-full px-3 flex flex-col gap-3 overflow-y-auto no-scrollbar pt-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          const isSpecial = tab.special;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                group relative w-full aspect-square flex flex-col items-center justify-center rounded-2xl transition-all duration-500 ease-out
                ${isActive ? 'translate-y-0' : 'hover:-translate-y-1'}
              `}
            >
              {/* Active Background Pill (Glassmorphic) */}
              <div 
                className={`
                  absolute inset-0 rounded-2xl transition-all duration-500
                  ${isActive 
                    ? isSpecial 
                        ? 'bg-gradient-to-b from-purple-500/10 to-indigo-600/5 border border-purple-500/20 shadow-[0_0_15px_-5px_rgba(168,85,247,0.2)] opacity-100'
                        : 'bg-gradient-to-b from-blue-500/10 to-cyan-500/5 border border-blue-500/20 shadow-[0_0_15px_-5px_rgba(59,130,246,0.2)] opacity-100' 
                    : 'bg-transparent border border-transparent opacity-0 group-hover:bg-surface-hover group-hover:border-white/10'
                  }
                `} 
              />
              
              {/* Icon Container */}
              <div className={`
                relative z-10 transition-all duration-500
                ${isActive 
                    ? isSpecial 
                        ? 'text-purple-300 drop-shadow-[0_0_10px_rgba(168,85,247,0.6)]' 
                        : 'text-blue-300 drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]'
                    : 'text-zinc-400 group-hover:text-zinc-200'
                }
              `}>
                <Icon 
                    size={isActive ? 28 : 24} 
                    strokeWidth={isActive ? 2 : 1.5}
                    className={`transition-transform duration-500 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}
                />
              </div>
              
              {/* Label - Improved Contrast */}
              <span className={`
                relative z-10 text-[11px] font-medium mt-2 transition-all duration-300
                ${isActive ? 'text-white font-bold tracking-wide' : 'text-zinc-400 group-hover:text-zinc-100'}
              `}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* User Profile Action */}
      <div className="mt-auto pt-4 pb-2 w-full px-4 border-t border-white/5">
         <button className="w-full aspect-square rounded-2xl bg-surface border border-white/5 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-surface-hover hover:border-white/10 transition-all duration-300 group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <User size={20} className="group-hover:scale-110 transition-transform relative z-10" />
         </button>
      </div>
    </aside>
  );
};

export default Sidebar;