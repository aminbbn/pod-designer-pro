import React, { useState, useEffect, useCallback } from 'react';
import { 
    Search, Image as ImageIcon, Loader2, AlertCircle, 
    Move, Palette, Droplets, Sliders, Info
} from 'lucide-react';
import { searchPixabayImages, PixabayImage } from '../../services/pixabayService';

interface GraphicsPanelProps {
  onAddImage: (url: string) => void;
  onAddGraphic?: (pathData: string) => void;
  selectedObject: any;
  onUpdateObject: (key: string, value: any) => void;
}

const CATEGORIES = [
  { id: 'vector', label: 'همه', query: '' },
  { id: 'shapes', label: 'اشکال', query: 'shapes' },
  { id: 'nature', label: 'طبیعت', query: 'nature' },
  { id: 'abstract', label: 'انتزاعی', query: 'abstract' },
  { id: 'urban', label: 'شهری', query: 'urban' },
  { id: 'emoji', label: 'ایموجی', query: 'emoji' },
  { id: 'typography', label: 'تایپوگرافی', query: 'typography' },
  { id: 'skull', label: 'جمجمه', query: 'skull' },
  { id: 'flower', label: 'گل', query: 'flower' },
  { id: 'animal', label: 'حیوانات', query: 'animal' },
];

const COLORS = [
    '#ffffff', '#000000', '#ef4444', '#f97316', '#f59e0b', '#84cc16', 
    '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', 
    '#f43f5e', '#881337', '#1e293b'
];

// Helper: Convert Hex + Opacity to RGBA
const hexToRgba = (hex: string, alpha: number) => {
    let c: any;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c= hex.substring(1).split('');
        if(c.length== 3){
            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c= '0x'+c.join('');
        return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+','+alpha+')';
    }
    return hex;
}

// Helper: Parse RGBA to Hex and Alpha
const rgbaToHexOpacity = (rgba: string) => {
    if (!rgba || !rgba.startsWith('rgba')) return { hex: rgba || '#000000', opacity: 1 };
    const parts = rgba.replace(/^rgba?\(|\s+|\)$/g, '').split(',');
    const r = parseInt(parts[0]);
    const g = parseInt(parts[1]);
    const b = parseInt(parts[2]);
    const a = parseFloat(parts[3] || '1');

    const hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    return { hex, opacity: a };
}

const GraphicsPanel: React.FC<GraphicsPanelProps> = ({ 
    onAddImage, 
    selectedObject,
    onUpdateObject 
}) => {
  const [activeView, setActiveView] = useState<'library' | 'settings'>('library');
  const [searchQuery, setSearchQuery] = useState('');
  const [images, setImages] = useState<PixabayImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('vector');
  const [error, setError] = useState('');

  // Determine selection type
  const isGraphicSelected = selectedObject && (selectedObject.type === 'image' || selectedObject.type === 'path' || selectedObject.type === 'group');
  const isImage = selectedObject && selectedObject.type === 'image';

  useEffect(() => {
    if (isGraphicSelected) {
        setActiveView('settings');
    } else {
        setActiveView('library');
    }
  }, [isGraphicSelected]);

  const performSearch = useCallback(async (query: string) => {
    setLoading(true);
    setError('');
    try {
      const results = await searchPixabayImages(query);
      setImages(results);
    } catch (err) {
      console.error(err);
      setError('خطا در دریافت تصاویر. لطفا اتصال اینترنت را بررسی کنید.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (images.length === 0) performSearch('');
  }, [performSearch, images.length]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
    setSelectedCategory('');
  };

  const handleCategoryClick = (cat: typeof CATEGORIES[0]) => {
    setSelectedCategory(cat.id);
    setSearchQuery(''); 
    performSearch(cat.query);
  };

  // --- Handlers ---

  const handleColorChange = (key: 'fill' | 'stroke', color: string) => {
      if (!isGraphicSelected) return;
      
      // We always send 'fill' for the main color. 
      // The App.tsx logic will handle whether to apply it as a Filter (for images) or Fill (for vectors)
      if (key === 'fill') {
        onUpdateObject('fill', color);
      } else {
         onUpdateObject(key, color);
      }
  };

  const updateShadow = (params: { dist?: number; angle?: number; blur?: number; color?: string; opacity?: number }) => {
      if (!isGraphicSelected) return;

      const currentShadow = selectedObject?.shadow || { color: 'rgba(0,0,0,1)', blur: 0, offsetX: 0, offsetY: 0 };
      const { hex: shadowHex, opacity: shadowOpacity } = rgbaToHexOpacity(typeof currentShadow.color === 'string' ? currentShadow.color : '#000000');
      
      const currentDist = Math.round(Math.sqrt(Math.pow(currentShadow.offsetX || 0, 2) + Math.pow(currentShadow.offsetY || 0, 2)));
      const currentAngle = Math.round(Math.atan2(currentShadow.offsetY || 0, currentShadow.offsetX || 0) * (180 / Math.PI));

      const newDist = params.dist !== undefined ? params.dist : currentDist;
      const newAngle = params.angle !== undefined ? params.angle : currentAngle;
      const newBlur = params.blur !== undefined ? params.blur : (currentShadow.blur || 0);
      const newHex = params.color !== undefined ? params.color : shadowHex;
      const newOpacity = params.opacity !== undefined ? params.opacity : shadowOpacity;

      const angleRad = newAngle * (Math.PI / 180);
      const offsetX = Math.round(newDist * Math.cos(angleRad));
      const offsetY = Math.round(newDist * Math.sin(angleRad));
      const newColor = hexToRgba(newHex, newOpacity);

      onUpdateObject('shadow', { color: newColor, blur: newBlur, offsetX, offsetY });
  };

  const toggleShadow = (checked: boolean) => {
      if (!isGraphicSelected) return;
      if (checked) {
          updateShadow({ dist: 10, angle: 45, blur: 15, opacity: 0.5 });
      } else {
          onUpdateObject('shadow', null);
      }
  };

  const toggleStroke = (checked: boolean) => {
      if (!isGraphicSelected) return;
      if (checked) {
          onUpdateObject('strokeWidth', 2);
          if(!selectedObject.stroke) onUpdateObject('stroke', '#000000');
      } else {
          onUpdateObject('strokeWidth', 0);
          onUpdateObject('stroke', null);
      }
  };

  // State Derivation
  const scaleX = isGraphicSelected ? Math.round((selectedObject.scaleX || 1) * 100) : 100;
  const rotation = isGraphicSelected ? Math.round(selectedObject.angle || 0) : 0;
  
  // Determines current color. We default to #000000 if not found.
  const currentColor = isGraphicSelected ? (selectedObject.fill || '#000000') : '#000000';
  
  const hasStroke = isGraphicSelected && selectedObject.strokeWidth > 0;
  const hasShadow = isGraphicSelected && !!selectedObject.shadow;

  const currentShadow = selectedObject?.shadow || { color: 'rgba(0,0,0,1)', blur: 0, offsetX: 0, offsetY: 0 };
  const { hex: shadowHex, opacity: shadowOpacity } = rgbaToHexOpacity(typeof currentShadow.color === 'string' ? currentShadow.color : '#000000');
  const currentDist = Math.round(Math.sqrt(Math.pow(currentShadow.offsetX || 0, 2) + Math.pow(currentShadow.offsetY || 0, 2)));
  const currentAngle = Math.round(Math.atan2(currentShadow.offsetY || 0, currentShadow.offsetX || 0) * (180 / Math.PI));

  return (
    <div className="flex flex-col h-full animate-fade-in pb-10">
      
      {/* 1. Header */}
      <div className="flex items-center gap-2 mb-6 bg-surface p-1 rounded-xl border border-white/5">
         <button onClick={() => setActiveView('library')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${activeView === 'library' ? 'bg-primary text-background shadow-lg' : 'text-slate-400 hover:text-white hover:bg-surface-hover'}`}>
           <Search size={14} /><span>کتابخانه</span>
         </button>
         <button onClick={() => setActiveView('settings')} disabled={!isGraphicSelected} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${activeView === 'settings' ? 'bg-primary text-background shadow-lg' : 'text-slate-400 hover:text-white hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed'}`}>
           <Sliders size={14} /><span>تنظیمات</span>
         </button>
      </div>

      {/* VIEW: LIBRARY */}
      {activeView === 'library' && (
        <div className="flex flex-col h-full animate-slide-up">
            <div className="space-y-4 shrink-0 mb-4">
                <form onSubmit={handleSearch} className="relative group z-20">
                    <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-primary transition-colors"><Search size={16} /></button>
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="جستجوی گرافیک (مثال: Lion)..." className="w-full bg-background border border-white/5 rounded-xl pr-10 pl-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors" />
                </form>
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mask-gradient-right">
                    {CATEGORIES.map(cat => (
                        <button key={cat.id} onClick={() => handleCategoryClick(cat)} className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[11px] font-bold transition-all duration-300 border ${selectedCategory === cat.id ? 'bg-primary text-background border-primary' : 'bg-surface text-slate-400 border-white/5 hover:bg-surface-hover'}`}>{cat.label}</button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 relative bg-surface rounded-xl border border-white/5">
                {loading && (<div className="absolute inset-0 z-10 bg-background/80 backdrop-blur-sm flex items-center justify-center"><Loader2 size={30} className="animate-spin text-primary" /></div>)}
                {!loading && error ? (<div className="flex flex-col items-center justify-center h-full gap-2 text-rose-400 p-4 text-center"><AlertCircle size={24} /><span className="text-xs">{error}</span></div>) : 
                 !loading && images.length === 0 ? (<div className="flex flex-col items-center justify-center h-full gap-3 text-slate-600"><ImageIcon size={32} /><p className="text-xs">نتیجه‌ای یافت نشد</p></div>) : 
                 (<div className="grid grid-cols-3 gap-2 p-2">{images.map((img) => (<button key={img.id} className="aspect-square bg-surface rounded-lg overflow-hidden border border-white/5 hover:border-primary/50 p-2 transition-colors" onClick={() => onAddImage(img.largeImageURL || img.previewURL)}><img src={img.previewURL} alt={img.tags} className="w-full h-full object-contain" loading="lazy" /></button>))}</div>)}
            </div>
        </div>
      )}

      {/* VIEW: SETTINGS */}
      {activeView === 'settings' && isGraphicSelected && (
          <div className="animate-slide-up space-y-4 overflow-y-auto custom-scrollbar flex-1 pb-4">
              
              {/* 1. Dimensions */}
              <div className="bg-surface rounded-xl border border-white/5 overflow-hidden">
                  <div className="p-3 bg-surface-hover flex items-center gap-2 text-xs font-bold text-slate-300 border-b border-white/5"><Move size={14} className="text-primary" />موقعیت و ابعاد</div>
                  <div className="p-4 space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <input type="number" value={Math.round(selectedObject?.left || 0)} onChange={(e) => onUpdateObject('left', parseInt(e.target.value))} className="w-full bg-background border border-white/5 rounded-lg p-2 text-white text-xs text-center focus:border-primary/50 transition-colors" placeholder="X" />
                            <input type="number" value={Math.round(selectedObject?.top || 0)} onChange={(e) => onUpdateObject('top', parseInt(e.target.value))} className="w-full bg-background border border-white/5 rounded-lg p-2 text-white text-xs text-center focus:border-primary/50 transition-colors" placeholder="Y" />
                        </div>
                        <div>
                            <div className="flex justify-between text-[10px] text-slate-400 mb-1"><span>چرخش</span><span className="font-mono text-primary">{rotation}°</span></div>
                            <input type="range" min="0" max="360" value={rotation} onChange={(e) => onUpdateObject('angle', parseInt(e.target.value))} className="w-full h-1 bg-background rounded appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full" />
                        </div>
                        <div>
                            <div className="flex justify-between text-[10px] text-slate-400 mb-1"><span>مقیاس</span><span className="font-mono text-primary">{scaleX}%</span></div>
                            <input type="range" min="10" max="300" value={scaleX} onChange={(e) => { const val = parseInt(e.target.value) / 100; onUpdateObject('scaleX', val); onUpdateObject('scaleY', val); }} className="w-full h-1 bg-background rounded appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full" />
                        </div>
                  </div>
              </div>

              {/* 2. Color/Fill (Unified) */}
              <div className="bg-surface rounded-xl border border-white/5 overflow-hidden">
                  <div className="p-3 bg-surface-hover flex items-center gap-2 text-xs font-bold text-slate-300 border-b border-white/5">
                      <Palette size={14} className="text-primary" />
                      {isImage ? 'رنگ آمیزی (Tint Filter)' : 'رنگ (Fill)'}
                  </div>
                  <div className="p-4">
                        <div className="flex flex-wrap gap-2">
                            <button onClick={() => handleColorChange('fill', '')} className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center bg-surface hover:bg-surface-hover text-slate-500 text-[10px] transition-all hover:scale-110" title="حذف رنگ">X</button>
                            {COLORS.slice(0, 11).map(c => (
                                <button key={c} onClick={() => handleColorChange('fill', c)} className={`w-8 h-8 rounded-full border border-white/5 shadow-sm transition-transform hover:scale-110 ${currentColor === c ? 'ring-2 ring-primary scale-110' : ''}`} style={{ backgroundColor: c }} />
                            ))}
                            <label className="w-8 h-8 rounded-full border border-white/5 shadow-sm bg-gradient-to-tr from-white to-black cursor-pointer hover:scale-110 transition-transform relative overflow-hidden">
                                <input type="color" className="opacity-0 absolute inset-0 w-full h-full cursor-pointer" value={typeof currentColor === 'string' && currentColor ? currentColor : '#000000'} onChange={(e) => handleColorChange('fill', e.target.value)} />
                            </label>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-3 leading-relaxed">
                            {isImage 
                              ? 'برای تصاویر، ما از فیلتر پیشرفته رنگ استفاده می‌کنیم تا طرح شما را کاملا رنگ‌آمیزی کنیم.' 
                              : 'رنگ انتخاب شده روی تمام اجزای برداری طرح اعمال می‌شود.'}
                        </p>
                  </div>
              </div>

               {/* 3. Effects */}
               <div className="bg-surface rounded-xl border border-white/5 overflow-hidden">
                  <div className="p-3 bg-surface-hover flex items-center gap-2 text-xs font-bold text-slate-300 border-b border-white/5"><Droplets size={14} className="text-primary" />افکت‌ها</div>
                  <div className="p-4 space-y-5">
                        
                        {/* Stroke Control */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="checkbox" 
                                        checked={hasStroke}
                                        onChange={(e) => toggleStroke(e.target.checked)}
                                        className="w-4 h-4 rounded border-white/5 bg-background text-primary focus:ring-offset-0 focus:ring-1 focus:ring-primary/30"
                                    />
                                    <span className="text-[11px] text-slate-300 font-bold">حاشیه (Stroke)</span>
                                </div>
                                {hasStroke && (
                                    <input 
                                      type="color" 
                                      value={selectedObject?.stroke || '#000000'} 
                                      onChange={(e) => handleColorChange('stroke', e.target.value)} 
                                      className="w-5 h-5 bg-transparent border-none cursor-pointer rounded" 
                                    />
                                )}
                            </div>
                            {hasStroke && (
                                <div className="animate-fade-in pl-6 space-y-3">
                                    {isImage && (
                                        <div className="flex gap-2 p-2 bg-primary/10 border border-primary/20 rounded-lg">
                                            <Info size={14} className="text-primary shrink-0 mt-0.5" />
                                            <p className="text-[10px] text-primary/80 leading-tight">
                                                برای تصاویر (PNG/JPG)، حاشیه به دور کادر مستطیلی اعمال می‌شود.
                                            </p>
                                        </div>
                                    )}

                                    {/* Stroke Width */}
                                    <div>
                                        <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                                            <span>ضخامت</span>
                                            <span>{selectedObject.strokeWidth}px</span>
                                        </div>
                                        <input type="range" min="0.5" max="10" step="0.5" value={selectedObject?.strokeWidth || 0} onChange={(e) => onUpdateObject('strokeWidth', parseFloat(e.target.value))} className="w-full h-1 bg-background rounded appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full" />
                                    </div>
                                    
                                    {/* Paint First Toggle */}
                                    <div className="flex bg-background rounded-lg p-1 border border-white/5">
                                        <button 
                                            onClick={() => onUpdateObject('paintFirst', 'fill')}
                                            className={`flex-1 py-1.5 text-[10px] rounded-md transition-all ${selectedObject?.paintFirst !== 'stroke' ? 'bg-primary text-background shadow-sm' : 'text-slate-500 hover:bg-surface-hover'}`}
                                        >
                                            داخلی (Inside)
                                        </button>
                                        <button 
                                            onClick={() => onUpdateObject('paintFirst', 'stroke')}
                                            className={`flex-1 py-1.5 text-[10px] rounded-md transition-all ${selectedObject?.paintFirst === 'stroke' ? 'bg-primary text-background shadow-sm' : 'text-slate-500 hover:bg-surface-hover'}`}
                                        >
                                            خارجي (Outside)
                                        </button>
                                    </div>
                                </div>
                            )}
                            <div className="w-full h-px bg-border"></div>
                        </div>

                        {/* Shadow Control */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" checked={hasShadow} onChange={(e) => toggleShadow(e.target.checked)} className="w-4 h-4 rounded border-white/5 bg-background text-primary focus:ring-offset-0 focus:ring-1 focus:ring-primary/30" />
                                    <span className="text-[11px] text-slate-300 font-bold">سایه (Shadow)</span>
                                </div>
                                {hasShadow && (<input type="color" value={shadowHex} onChange={(e) => updateShadow({ color: e.target.value })} className="w-5 h-5 bg-transparent border-none cursor-pointer rounded" />)}
                            </div>
                            {hasShadow && (
                                 <div className="space-y-4 animate-fade-in pl-6">
                                     <div>
                                         <div className="flex justify-between text-[10px] text-slate-400 mb-1"><span>شفافیت</span><span>{Math.round(shadowOpacity * 100)}%</span></div>
                                         <input type="range" min="0" max="1" step="0.05" value={shadowOpacity} onChange={(e) => updateShadow({ opacity: parseFloat(e.target.value) })} className="w-full h-1 bg-background rounded appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full" />
                                     </div>
                                     <div>
                                         <div className="flex justify-between text-[10px] text-slate-400 mb-1"><span>محو شدگی</span><span>{currentShadow.blur}px</span></div>
                                         <input type="range" min="0" max="50" value={currentShadow.blur || 0} onChange={(e) => updateShadow({ blur: parseInt(e.target.value) })} className="w-full h-1 bg-background rounded appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full" />
                                     </div>
                                     <div>
                                         <div className="flex justify-between text-[10px] text-slate-400 mb-1"><span>زاویه</span><span>{currentAngle}°</span></div>
                                         <input type="range" min="-180" max="180" value={currentAngle} onChange={(e) => updateShadow({ angle: parseInt(e.target.value) })} className="w-full h-1 bg-background rounded appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full" />
                                     </div>
                                     <div>
                                         <div className="flex justify-between text-[10px] text-slate-400 mb-1"><span>فاصله</span><span>{currentDist}px</span></div>
                                         <input type="range" min="0" max="100" value={currentDist} onChange={(e) => updateShadow({ dist: parseInt(e.target.value) })} className="w-full h-1 bg-background rounded appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full" />
                                     </div>
                                 </div>
                            )}
                        </div>
                  </div>
               </div>
          </div>
      )}
    </div>
  );
};

export default GraphicsPanel;