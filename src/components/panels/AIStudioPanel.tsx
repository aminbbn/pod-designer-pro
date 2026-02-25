import React from 'react';
import { Sparkles, Loader2, Wand2, Layers, Image as ImageIcon, Type } from 'lucide-react';
import { DesignConcept } from '../../types';

interface AIStudioPanelProps {
  aiPrompt: string;
  setAiPrompt: (val: string) => void;
  isGenerating: boolean;
  handleGenerate: () => void;
  designConcepts: DesignConcept[];
  onApplyDesign: (concept: DesignConcept) => void;
}

const AIStudioPanel: React.FC<AIStudioPanelProps> = ({
  aiPrompt,
  setAiPrompt,
  isGenerating,
  handleGenerate,
  designConcepts,
  onApplyDesign
}) => {
  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Input Section */}
      <div className="relative overflow-hidden p-1 rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent border border-white/5">
        <div className="absolute inset-0 bg-noise opacity-20" />
        <div className="bg-surface backdrop-blur-sm p-5 rounded-xl relative z-10">
          <h3 className="flex items-center justify-end gap-2 text-primary font-bold mb-3 text-lg">
            طراح هوشمند
            <Sparkles size={18} className="text-primary animate-pulse" />
          </h3>
          <p className="text-xs text-slate-300 mb-5 leading-relaxed opacity-80">
            ایده خود را بنویسید (مثلاً: "تایپوگرافی مدرن با تصویر شیر و افکت‌های انتزاعی") تا هوش مصنوعی طرح‌های ترکیبی شامل متن و تصویر برای شما بسازد.
          </p>
          
          <textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="مثال: طرح گرانج، تصویر جمجمه، متن آزادی، رنگ‌های نئونی..."
            className="w-full bg-background border border-white/5 focus:border-primary/30 rounded-xl p-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-primary/10 resize-none h-28 mb-4 transition-all"
          />
          
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !aiPrompt}
            className="w-full py-3 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-sm font-bold text-background transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group"
          >
            {isGenerating ? <Loader2 className="animate-spin" size={18} /> : (
              <>
                <span>طراحی کن</span>
                <Wand2 size={18} className="group-hover:rotate-12 transition-transform" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Section */}
      {designConcepts.length > 0 && (
        <div className="space-y-4 animate-slide-up">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2 block">
             مفاهیم پیشنهادی
          </label>
          
          <div className="grid gap-4">
             {designConcepts.map((concept, idx) => (
                <div 
                   key={idx} 
                   className="group relative bg-surface border border-white/5 hover:border-primary/20 rounded-xl p-4 transition-all duration-300 hover:bg-surface-hover hover:shadow-xl hover:-translate-y-1"
                >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-2">
                         <div className="text-[10px] bg-primary/5 text-primary px-2 py-0.5 rounded border border-primary/5 font-bold">
                            کانسپت {idx + 1}
                         </div>
                         <h4 className="text-sm font-bold text-white text-right">{concept.title}</h4>
                    </div>
                    
                    {/* Description */}
                    <p className="text-[11px] text-slate-400 mb-4 text-right leading-relaxed border-b border-white/5 pb-3">
                        {concept.description}
                    </p>
                    
                    {/* Layers Preview */}
                    <div className="space-y-2 mb-4">
                        {concept.elements.map((el, i) => (
                            <div key={i} className="flex items-center justify-end gap-2 text-[10px] text-slate-500">
                                {el.type === 'image' ? (
                                    <>
                                        <span className="text-slate-300 truncate max-w-[150px] opacity-70 italic">{el.query}</span>
                                        <ImageIcon size={12} className="text-indigo-400" />
                                    </>
                                ) : (
                                    <>
                                        <span className="font-mono text-slate-600">({el.fontFamily})</span>
                                        <span className="text-slate-300 truncate max-w-[150px]">{el.content}</span>
                                        <Type size={12} className="text-emerald-400" />
                                    </>
                                )}
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: el.fill }}></div>
                            </div>
                        ))}
                    </div>

                    {/* Apply Button */}
                    <button 
                        onClick={() => onApplyDesign(concept)}
                        className="w-full py-2 bg-background hover:bg-primary hover:text-background border border-white/5 hover:border-primary/50 rounded-lg text-xs font-bold text-slate-300 transition-all flex items-center justify-center gap-2"
                    >
                        <span>اجرای طرح روی لباس</span>
                        <Layers size={14} />
                    </button>
                </div>
             ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIStudioPanel;