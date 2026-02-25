import React from 'react';
import { Download, Undo2, Redo2, Share2, ShoppingCart, Menu } from 'lucide-react';

interface TopBarProps {
  onUndo: () => void;
  onRedo: () => void;
  onExport: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onUndo, onRedo, onExport }) => {
  return (
    <div className="h-16 bg-surface border-b border-white/5 flex items-center justify-between px-6 z-30 shadow-sm relative">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
           <span className="font-display font-bold text-xl tracking-tight text-white">
            طراح هوشمند
           </span>
           <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full border border-primary/20">آزمایشی</span>
        </div>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1 bg-surface p-1 rounded-lg border border-white/5 backdrop-blur-sm">
        {/* Buttons are physically ordered LTR in code, but RTL dir handles flow. 
            However, undo/redo icons usually point specific ways. 
            Undo points left (back), Redo points right (forward). 
            In RTL context, Undo (Back) might conceptually mean "Next step back in time", 
            but the arrow direction usually stays "Left" for Undo. 
        */}
        <button onClick={onRedo} className="p-2 text-slate-400 hover:text-white hover:bg-surface-hover rounded-md transition-colors" title="بازسازی">
          <Redo2 size={18} />
        </button>
        <div className="w-px h-4 bg-border" />
        <button onClick={onUndo} className="p-2 text-slate-400 hover:text-white hover:bg-surface-hover rounded-md transition-colors" title="بازگشت">
          <Undo2 size={18} />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
          <Share2 size={16} />
          <span>اشتراک</span>
        </button>
        
        <button 
          onClick={onExport}
          className="flex items-center gap-2 px-5 py-2 bg-white text-slate-900 hover:bg-slate-200 rounded-lg text-sm font-bold transition-all transform active:scale-95 shadow-lg shadow-white/5"
        >
          <Download size={16} />
          <span>خروجی</span>
        </button>

        <button className="flex items-center justify-center w-10 h-10 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg border border-primary/20 transition-colors">
          <ShoppingCart size={18} />
        </button>
      </div>
    </div>
  );
};

export default TopBar;