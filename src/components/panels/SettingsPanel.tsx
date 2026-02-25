import React from 'react';
import { Grid, Monitor, RotateCw, LayoutTemplate } from 'lucide-react';

interface SettingsPanelProps {
  settings: {
    showGrid: boolean;
    showSafeZone: boolean;
    snapRotation: boolean;
    darkMode: boolean;
  };
  onUpdateSettings: (key: string, value: any) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onUpdateSettings }) => {
  
  const ToggleSwitch = ({ checked, onChange }: { checked: boolean, onChange: (val: boolean) => void }) => (
      <button 
        onClick={() => onChange(!checked)}
        className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${checked ? 'bg-primary' : 'bg-surface-hover'}`}
      >
        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${checked ? 'left-[calc(100%-18px)]' : 'left-0.5'}`} />
      </button>
  );

  return (
    <div className="space-y-6 animate-fade-in pb-10">
       
       {/* 1. Workspace */}
       <div className="space-y-3">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2 block">فضای کار</label>
          
          {/* Grid Toggle */}
          <div className="flex items-center justify-between p-3 bg-surface rounded-xl border border-white/5 hover:border-white/10 transition-colors">
             <div className="flex items-center gap-3">
                 <Grid size={18} className="text-cyan-400" />
                 <div>
                    <span className="text-sm text-slate-200 font-medium block">نمایش گرید</span>
                    <span className="text-[10px] text-slate-500 block">خطوط راهنما در پس‌زمینه</span>
                 </div>
             </div>
             <ToggleSwitch checked={settings.showGrid} onChange={(v) => onUpdateSettings('showGrid', v)} />
          </div>

          {/* Safe Zone Toggle */}
          <div className="flex items-center justify-between p-3 bg-surface rounded-xl border border-white/5 hover:border-white/10 transition-colors">
             <div className="flex items-center gap-3">
                 <LayoutTemplate size={18} className="text-emerald-400" />
                 <div>
                    <span className="text-sm text-slate-200 font-medium block">محدوده چاپ</span>
                    <span className="text-[10px] text-slate-500 block">نمایش کادر ناحیه امن</span>
                 </div>
             </div>
             <ToggleSwitch checked={settings.showSafeZone} onChange={(v) => onUpdateSettings('showSafeZone', v)} />
          </div>
       </div>

       {/* 2. Editor Settings */}
       <div className="space-y-3">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2 block">ویرایشگر</label>
          
          {/* Snap Rotation */}
          <div className="flex items-center justify-between p-3 bg-surface rounded-xl border border-white/5 hover:border-white/10 transition-colors">
             <div className="flex items-center gap-3">
                 <RotateCw size={18} className="text-rose-400" />
                 <div>
                    <span className="text-sm text-slate-200 font-medium block">چرخش پله‌ای</span>
                    <span className="text-[10px] text-slate-500 block">قفل شدن زاویه روی ۴۵ درجه</span>
                 </div>
             </div>
             <ToggleSwitch checked={settings.snapRotation} onChange={(v) => onUpdateSettings('snapRotation', v)} />
          </div>
       </div>

       {/* Version Info */}
       <div className="p-4 bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 rounded-xl mt-8">
           <div className="flex items-start gap-3">
               <Monitor className="text-blue-400 shrink-0 mt-0.5" size={18} />
               <div>
                   <h4 className="text-xs font-bold text-blue-300 mb-1">نسخه آزمایشی v0.9.3</h4>
                   <p className="text-[10px] text-blue-200/60 leading-relaxed">
                       شما در حال استفاده از آخرین نسخه آزمایشی هستید. تنظیمات فوق به صورت محلی اعمال می‌شوند.
                   </p>
               </div>
           </div>
       </div>

    </div>
  );
};

export default SettingsPanel;