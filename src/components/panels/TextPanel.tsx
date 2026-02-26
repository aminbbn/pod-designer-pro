import React, { useState, useEffect } from 'react';
import { 
    Plus, Check, Type, AlignLeft, AlignCenter, AlignRight, 
    Bold, Italic, Underline, Palette, Droplets,
    Maximize, RefreshCcw, Move, RotateCw, PaintBucket
} from 'lucide-react';
import { FARSI_FONTS, ENGLISH_FONTS } from '../../constants';

interface TextPanelProps {
  onAddText: (text: string, font: string, options?: any) => void;
  activeFont: string;
  setActiveFont: (font: string) => void;
  selectedObject: any;
  onUpdateObject: (key: string, value: any) => void;
}

const COLORS = [
    '#ffffff', '#000000', '#ef4444', '#f97316', '#f59e0b', '#84cc16', 
    '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', 
    '#f43f5e', '#881337', '#1e293b'
];

const GRADIENT_PRESETS = [
    { name: 'Sunset', start: '#f59e0b', end: '#db2777' },
    { name: 'Ocean', start: '#06b6d4', end: '#3b82f6' },
    { name: 'Gold', start: '#fcd34d', end: '#b45309' },
    { name: 'Cyber', start: '#d946ef', end: '#4f46e5' },
];

const TextPanel: React.FC<TextPanelProps> = ({ 
    onAddText, 
    activeFont, 
    setActiveFont, 
    selectedObject,
    onUpdateObject 
}) => {
  const [fontTab, setFontTab] = useState<'fa' | 'en'>('fa');
  const [fillType, setFillType] = useState<'solid' | 'gradient'>('solid');
  const [gradientState, setGradientState] = useState({
      start: '#ffffff',
      end: '#000000',
      angle: 90
  });

  // Check if selected object is text
  const isTextSelected = selectedObject && selectedObject.type === 'i-text';
  
  // Use selected object's font if available, otherwise global active font
  const currentFont = isTextSelected ? selectedObject.fontFamily : activeFont;

  // Scale Values (Percentage)
  const scaleX = isTextSelected ? Math.round((selectedObject.scaleX || 1) * 100) : 100;
  const scaleY = isTextSelected ? Math.round((selectedObject.scaleY || 1) * 100) : 100;

  // Sync state with selected object
  useEffect(() => {
    if (isTextSelected && selectedObject) {
        const fill = selectedObject.fill;
        if (typeof fill === 'string') {
            setFillType('solid');
        } else if (fill && typeof fill === 'object' && fill.type === 'linear') {
            setFillType('gradient');
            // Try to extract colors if possible, otherwise keep current state
            if (fill.colorStops && fill.colorStops.length >= 2) {
                setGradientState(prev => ({
                    ...prev,
                    start: fill.colorStops[0].color,
                    end: fill.colorStops[fill.colorStops.length - 1].color
                }));
            }
        }
    }
  }, [selectedObject, isTextSelected]);

  // --- Handlers ---
  const handleColorChange = (key: 'fill' | 'stroke', color: string) => {
      if (!isTextSelected) return;
      if (key === 'fill') {
          setFillType('solid');
          onUpdateObject('fill', color);
      } else {
          onUpdateObject(key, color);
      }
  };

  const applyGradient = (start: string, end: string, angle: number) => {
      // Safety check for window.fabric and selectedObject
      if (!isTextSelected || !window.fabric || !selectedObject) return;

      try {
          // Convert angle to coordinates
          const angleRad = (angle * Math.PI) / 180;
          const x1 = 0.5 - 0.5 * Math.cos(angleRad);
          const y1 = 0.5 - 0.5 * Math.sin(angleRad);
          const x2 = 0.5 + 0.5 * Math.cos(angleRad);
          const y2 = 0.5 + 0.5 * Math.sin(angleRad);

          const simpleGradient = new window.fabric.Gradient({
              type: 'linear',
              gradientUnits: 'percentage', 
              coords: { x1, y1, x2, y2 },
              colorStops: [
                  { offset: 0, color: start },
                  { offset: 1, color: end }
              ]
          });

          onUpdateObject('fill', simpleGradient);
      } catch (e) {
          console.error("Gradient Error:", e);
      }
  };

  const updateGradientState = (key: keyof typeof gradientState, value: any) => {
      const newState = { ...gradientState, [key]: value };
      setGradientState(newState);
      if (fillType === 'gradient') {
          applyGradient(newState.start, newState.end, newState.angle);
      }
  };

  const handleFontSelect = (font: string) => {
      setActiveFont(font);
      if (isTextSelected) {
          onUpdateObject('fontFamily', font);
      }
  };

  const handleShadowChange = (key: string, val: any) => {
      if (!isTextSelected) return;

      const currentShadow = selectedObject.shadow || { color: '#000000', blur: 0, offsetX: 0, offsetY: 0 };
      const shadowConfig = {
          color: currentShadow.color || '#000000',
          blur: currentShadow.blur || 0,
          offsetX: currentShadow.offsetX || 0,
          offsetY: currentShadow.offsetY || 0,
          [key]: val
      };
      // If we are just toggling shadow on/off, we handle it in the checkbox
      onUpdateObject('shadow', shadowConfig);
  };

  const toggleShadow = (checked: boolean) => {
      if (!isTextSelected) return;
      if (checked) {
          onUpdateObject('shadow', { color: '#000000', blur: 10, offsetX: 5, offsetY: 5 });
      } else {
          onUpdateObject('shadow', null);
      }
  };

  const toggleStroke = (checked: boolean) => {
      if (!isTextSelected) return;
      if (checked) {
          onUpdateObject('strokeWidth', 1);
          if(!selectedObject.stroke) onUpdateObject('stroke', '#000000');
      } else {
          onUpdateObject('strokeWidth', 0);
          onUpdateObject('stroke', null);
      }
  };

  const updateScale = (axis: 'X' | 'Y', val: number) => {
    if (!isTextSelected) return;
    onUpdateObject(`scale${axis}`, val / 100);
  };

  const displayedFonts = fontTab === 'fa' ? FARSI_FONTS : ENGLISH_FONTS;

  return (
    <div className="space-y-6 animate-fade-in pb-20" dir="rtl">
      
      {/* 1. QUICK ADD (Always Visible) */}
      <div className="space-y-2">
         <div className="flex gap-2">
            <button 
                onClick={() => onAddText('عنوان', activeFont, { fontSize: 50, fontWeight: 'bold' })}
                className="flex-1 h-12 bg-surface hover:bg-surface-hover border border-white/5 hover:border-white/10 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 group"
            >
                <Plus size={18} className="text-zinc-500 group-hover:text-primary" />
                <span className="text-sm font-bold text-zinc-300 group-hover:text-white">عنوان</span>
            </button>
            <button 
                onClick={() => onAddText('متن ساده', activeFont, { fontSize: 32 })}
                className="flex-1 h-12 bg-surface hover:bg-surface-hover border border-white/5 hover:border-white/10 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 group"
            >
                <Plus size={16} className="text-zinc-500 group-hover:text-zinc-300" />
                <span className="text-sm font-medium text-zinc-400 group-hover:text-zinc-200">متن ساده</span>
            </button>
         </div>
      </div>

      {/* 2. TEXT CONTENT EDIT (Only if selected) */}
      {isTextSelected && (
          <div className="bg-surface p-3 rounded-xl border border-white/5 animate-slide-up">
              <textarea 
                  value={selectedObject.text}
                  onChange={(e) => onUpdateObject('text', e.target.value)}
                  placeholder="متن خود را بنویسید..."
                  className="w-full bg-background border border-white/5 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-primary transition-colors resize-y min-h-[80px]"
              />
          </div>
      )}

      {/* 3. FONT SELECTION (Always Visible) */}
      <div className="border border-white/5 rounded-xl overflow-hidden bg-surface">
        <div className="p-3 border-b border-white/5 flex gap-2">
            <button 
                onClick={() => setFontTab('fa')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${fontTab === 'fa' ? 'bg-primary/10 text-primary border border-primary/20' : 'text-zinc-500 hover:bg-surface-hover'}`}
            >
                فارسی
            </button>
            <button 
                onClick={() => setFontTab('en')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${fontTab === 'en' ? 'bg-primary/10 text-primary border border-primary/20' : 'text-zinc-500 hover:bg-surface-hover'}`}
            >
                English
            </button>
        </div>
        
        <div className="max-h-[220px] overflow-y-auto p-2 custom-scrollbar">
            <div className="space-y-1">
              {displayedFonts.map(font => (
                <button
                  key={font}
                  onClick={() => handleFontSelect(font)}
                  className={`
                    w-full relative px-3 py-2 text-right rounded-lg text-sm transition-all duration-200 flex items-center justify-between group
                    ${currentFont === font 
                      ? 'bg-primary/10 text-primary border border-primary/20' 
                      : 'text-zinc-400 hover:bg-surface-hover hover:text-zinc-200 border border-transparent'
                    }
                  `}
                >
                  <span style={{ fontFamily: font, fontSize: fontTab === 'fa' ? '16px' : '14px' }} className="relative z-10">
                    {fontTab === 'fa' ? 'متن آزمایشی' : 'Sample Text'} ({font})
                  </span>
                  {currentFont === font && <Check size={14} className="text-primary" />}
                </button>
              ))}
            </div>
        </div>
      </div>

      {/* 4. SETTINGS GROUPS (Disabled if not selected) */}
      <div className={`space-y-4 transition-opacity duration-300 ${!isTextSelected ? 'opacity-40 pointer-events-none grayscale' : 'opacity-100'}`}>
          
          {/* Typography */}
          <div className="border border-white/5 rounded-xl overflow-hidden bg-surface">
              <div className="p-3 bg-surface-hover flex items-center gap-2 text-xs font-bold text-zinc-300 border-b border-white/5">
                  <Type size={14} className="text-primary" />
                  تنظیمات متن
              </div>
              <div className="p-3 space-y-3">
                  <div className="flex bg-background rounded-lg p-1 border border-white/5 justify-center gap-2">
                      <button onClick={() => onUpdateObject('fontWeight', selectedObject?.fontWeight === 'bold' ? 'normal' : 'bold')} className={`p-2 rounded hover:bg-surface-hover transition-colors ${selectedObject?.fontWeight === 'bold' ? 'text-primary bg-surface-hover' : 'text-zinc-500'}`}><Bold size={16} /></button>
                      <button onClick={() => onUpdateObject('fontStyle', selectedObject?.fontStyle === 'italic' ? 'normal' : 'italic')} className={`p-2 rounded hover:bg-surface-hover transition-colors ${selectedObject?.fontStyle === 'italic' ? 'text-primary bg-surface-hover' : 'text-zinc-500'}`}><Italic size={16} /></button>
                      <button onClick={() => onUpdateObject('underline', !selectedObject?.underline)} className={`p-2 rounded hover:bg-surface-hover transition-colors ${selectedObject?.underline ? 'text-primary bg-surface-hover' : 'text-zinc-500'}`}><Underline size={16} /></button>
                      <div className="w-px bg-white/10 my-1 mx-1"></div>
                      <button onClick={() => onUpdateObject('textAlign', 'right')} className={`p-2 rounded hover:bg-surface-hover transition-colors ${selectedObject?.textAlign === 'right' ? 'text-primary bg-surface-hover' : 'text-zinc-500'}`}><AlignRight size={16} /></button>
                      <button onClick={() => onUpdateObject('textAlign', 'center')} className={`p-2 rounded hover:bg-surface-hover transition-colors ${selectedObject?.textAlign === 'center' ? 'text-primary bg-surface-hover' : 'text-zinc-500'}`}><AlignCenter size={16} /></button>
                      <button onClick={() => onUpdateObject('textAlign', 'left')} className={`p-2 rounded hover:bg-surface-hover transition-colors ${selectedObject?.textAlign === 'left' ? 'text-primary bg-surface-hover' : 'text-zinc-500'}`}><AlignLeft size={16} /></button>
                  </div>
                  
                  <div className="space-y-3">
                      <div>
                          <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                              <span>سایز فونت</span>
                              <span>{isTextSelected ? Math.round(selectedObject.fontSize) : 0}</span>
                          </div>
                          <input type="range" min="10" max="200" value={isTextSelected ? selectedObject.fontSize : 40} onChange={(e) => onUpdateObject('fontSize', parseInt(e.target.value))} className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md" />
                      </div>
                  </div>
              </div>
          </div>

          {/* Position & Rotation */}
          <div className="border border-white/5 rounded-xl overflow-hidden bg-surface">
              <div className="p-3 bg-surface-hover flex items-center gap-2 text-xs font-bold text-zinc-300 border-b border-white/5">
                  <Move size={14} className="text-orange-500" />
                  موقعیت و چرخش
              </div>
              <div className="p-3 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                      <div>
                          <label className="text-[10px] text-zinc-500 mb-1 block">X (چپ/راست)</label>
                          <input 
                              type="number" 
                              value={isTextSelected ? Math.round(selectedObject?.left || 0) : 0} 
                              onChange={(e) => onUpdateObject('left', parseInt(e.target.value))}
                              className="w-full bg-background border border-white/5 rounded-lg p-2 text-white text-xs text-center focus:outline-none focus:border-primary"
                          />
                      </div>
                      <div>
                          <label className="text-[10px] text-zinc-500 mb-1 block">Y (بالا/پایین)</label>
                          <input 
                              type="number" 
                              value={isTextSelected ? Math.round(selectedObject?.top || 0) : 0} 
                              onChange={(e) => onUpdateObject('top', parseInt(e.target.value))}
                              className="w-full bg-background border border-white/5 rounded-lg p-2 text-white text-xs text-center focus:outline-none focus:border-primary"
                          />
                      </div>
                  </div>

                  {/* Rotation Control */}
                  <div>
                      <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                          <span className="flex items-center gap-1"><RotateCw size={10}/> زاویه چرخش</span>
                          <span className="font-mono text-orange-400">{Math.round(selectedObject?.angle || 0)}°</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input 
                            type="range" 
                            min="0" 
                            max="360" 
                            value={Math.round(selectedObject?.angle || 0)} 
                            onChange={(e) => onUpdateObject('angle', parseInt(e.target.value))} 
                            className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-orange-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md" 
                        />
                         {Math.round(selectedObject?.angle || 0) !== 0 && (
                            <button 
                                onClick={() => onUpdateObject('angle', 0)}
                                className="text-[10px] bg-surface-hover hover:bg-border px-2 py-0.5 rounded text-zinc-400 hover:text-white transition-colors"
                            >
                                بازنشانی
                            </button>
                         )}
                      </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2 border-t border-white/5">
                       <button onClick={() => { onUpdateObject('left', 250); }} className="flex-1 bg-surface-hover hover:bg-border py-2 rounded-lg text-[10px] text-zinc-300 transition-colors">
                           وسط‌چین افقی
                       </button>
                        <button onClick={() => { onUpdateObject('top', 300); }} className="flex-1 bg-surface-hover hover:bg-border py-2 rounded-lg text-[10px] text-zinc-300 transition-colors">
                           وسط‌چین عمودی
                       </button>
                  </div>
              </div>
          </div>

          {/* Dimensions & Scale */}
          <div className="border border-white/5 rounded-xl overflow-hidden bg-surface">
              <div className="p-3 bg-surface-hover flex items-center justify-between border-b border-white/5">
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
                      <Maximize size={14} className="text-emerald-500" />
                      ابعاد و مقیاس
                  </div>
                  {(scaleX !== 100 || scaleY !== 100) && (
                      <button 
                        onClick={() => { onUpdateObject('scaleX', 1); onUpdateObject('scaleY', 1); }}
                        className="text-[10px] flex items-center gap-1 text-zinc-400 hover:text-white bg-surface-hover hover:bg-border px-2 py-0.5 rounded transition-colors"
                      >
                          <RefreshCcw size={10} />
                          <span>بازنشانی</span>
                      </button>
                  )}
              </div>
              <div className="p-3 space-y-3">
                   {/* Width */}
                   <div>
                      <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                          <span>عرض (Width)</span>
                          <span className="font-mono text-emerald-400">{scaleX}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="10" 
                        max="300" 
                        value={scaleX} 
                        onChange={(e) => updateScale('X', parseInt(e.target.value))} 
                        className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-emerald-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md" 
                      />
                   </div>

                   {/* Height */}
                   <div>
                      <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                          <span>ارتفاع (Height)</span>
                          <span className="font-mono text-emerald-400">{scaleY}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="10" 
                        max="300" 
                        value={scaleY} 
                        onChange={(e) => updateScale('Y', parseInt(e.target.value))} 
                        className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-emerald-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md" 
                      />
                   </div>
              </div>
          </div>

          {/* Color & Stroke */}
          <div className="border border-white/5 rounded-xl overflow-hidden bg-surface">
              <div className="p-3 bg-surface-hover flex items-center gap-2 text-xs font-bold text-zinc-300 border-b border-white/5">
                  <Palette size={14} className="text-rose-500" />
                  رنگ و حاشیه
              </div>
              <div className="p-3 space-y-3">
                  {/* Fill Type Tabs */}
                  <div className="flex bg-background rounded-lg p-1 border border-white/5 mb-4">
                      <button 
                          onClick={() => { setFillType('solid'); if(selectedObject && typeof selectedObject.fill !== 'string') onUpdateObject('fill', '#000000'); }}
                          className={`flex-1 py-1.5 text-[10px] rounded-md transition-all flex items-center justify-center gap-2 ${fillType === 'solid' ? 'bg-surface-hover text-white shadow-sm border border-white/5' : 'text-zinc-500 hover:bg-surface-hover'}`}
                      >
                          <div className="w-3 h-3 rounded-full bg-current" />
                          رنگ ساده
                      </button>
                      <button 
                          onClick={() => { setFillType('gradient'); applyGradient(gradientState.start, gradientState.end, gradientState.angle); }}
                          className={`flex-1 py-1.5 text-[10px] rounded-md transition-all flex items-center justify-center gap-2 ${fillType === 'gradient' ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-sm' : 'text-zinc-500 hover:bg-surface-hover'}`}
                      >
                          <PaintBucket size={12} />
                          گرادینت
                      </button>
                  </div>

                  {fillType === 'solid' ? (
                      <div className="space-y-2 animate-fade-in">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase">انتخاب رنگ</label>
                            <div className="flex flex-wrap gap-2">
                                {COLORS.slice(0, 10).map(c => (
                                    <button 
                                    key={c} 
                                    onClick={() => handleColorChange('fill', c)}
                                    className={`w-6 h-6 rounded-full border border-white/5 shadow-sm transition-transform hover:scale-110 ${selectedObject?.fill === c ? 'ring-2 ring-white scale-110' : ''}`}
                                    style={{ backgroundColor: c }}
                                    />
                                ))}
                                <label className="w-6 h-6 rounded-full border border-white/5 shadow-sm bg-gradient-to-tr from-white to-black cursor-pointer hover:scale-110 transition-transform relative overflow-hidden">
                                    <input type="color" className="opacity-0 absolute inset-0 w-full h-full cursor-pointer" value={typeof selectedObject?.fill === 'string' ? selectedObject.fill : '#000000'} onChange={(e) => handleColorChange('fill', e.target.value)} />
                                </label>
                            </div>
                      </div>
                  ) : (
                      <div className="space-y-4 animate-fade-in">
                          {/* Gradient Colors */}
                          <div className="grid grid-cols-2 gap-3">
                              <div>
                                  <label className="text-[10px] text-zinc-500 mb-1 block">شروع</label>
                                  <div className="flex items-center gap-2 bg-background p-2 rounded-lg border border-white/5">
                                      <input 
                                          type="color" 
                                          value={gradientState.start} 
                                          onChange={(e) => updateGradientState('start', e.target.value)}
                                          className="w-6 h-6 rounded cursor-pointer bg-transparent border-none p-0"
                                      />
                                      <span className="text-[10px] font-mono text-zinc-300">{gradientState.start}</span>
                                  </div>
                              </div>
                              <div>
                                  <label className="text-[10px] text-zinc-500 mb-1 block">پایان</label>
                                  <div className="flex items-center gap-2 bg-background p-2 rounded-lg border border-white/5">
                                      <input 
                                          type="color" 
                                          value={gradientState.end} 
                                          onChange={(e) => updateGradientState('end', e.target.value)}
                                          className="w-6 h-6 rounded cursor-pointer bg-transparent border-none p-0"
                                      />
                                      <span className="text-[10px] font-mono text-zinc-300">{gradientState.end}</span>
                                  </div>
                              </div>
                          </div>

                          {/* Angle */}
                          <div>
                              <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                                  <span>زاویه گرادینت</span>
                                  <span>{gradientState.angle}°</span>
                              </div>
                              <input 
                                  type="range" 
                                  min="0" 
                                  max="360" 
                                  value={gradientState.angle} 
                                  onChange={(e) => updateGradientState('angle', parseInt(e.target.value))} 
                                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md" 
                              />
                          </div>

                          {/* Presets */}
                          <div>
                              <label className="text-[10px] text-zinc-500 mb-2 block">نمونه‌های آماده</label>
                              <div className="flex gap-2">
                                  {GRADIENT_PRESETS.map(preset => (
                                      <button
                                          key={preset.name}
                                          onClick={() => {
                                              setGradientState(prev => ({ ...prev, start: preset.start, end: preset.end }));
                                              applyGradient(preset.start, preset.end, gradientState.angle);
                                          }}
                                          className="w-8 h-8 rounded-full border border-white/5 hover:scale-110 transition-transform shadow-sm"
                                          style={{ background: `linear-gradient(135deg, ${preset.start}, ${preset.end})` }}
                                          title={preset.name}
                                      />
                                  ))}
                              </div>
                          </div>
                      </div>
                  )}

                  <div className="space-y-3 pt-4 border-t border-white/5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <input 
                                    type="checkbox" 
                                    checked={!!(selectedObject?.strokeWidth > 0)}
                                    onChange={(e) => toggleStroke(e.target.checked)}
                                    className="w-4 h-4 rounded border-white/5 bg-background text-primary focus:ring-offset-0 focus:ring-1 focus:ring-primary/30"
                                />
                                <label className="text-[10px] font-bold text-zinc-500 uppercase">حاشیه (STROKE)</label>
                            </div>
                            {selectedObject?.strokeWidth > 0 && (
                                <input type="color" value={selectedObject?.stroke || '#000000'} onChange={(e) => handleColorChange('stroke', e.target.value)} className="w-5 h-5 bg-transparent border-none cursor-pointer rounded" />
                            )}
                        </div>
                        
                        {selectedObject?.strokeWidth > 0 && (
                            <div className="space-y-3 animate-slide-up">
                                <input type="range" min="0" max="10" step="0.1" value={selectedObject?.strokeWidth || 0} onChange={(e) => onUpdateObject('strokeWidth', parseFloat(e.target.value))} className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-rose-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md" />
                                
                                {/* Stroke Position Toggle */}
                                <div className="flex bg-background rounded-lg p-1 border border-white/5">
                                    <button 
                                        onClick={() => onUpdateObject('paintFirst', 'fill')}
                                        className={`flex-1 py-1.5 text-[10px] rounded-md transition-all ${selectedObject?.paintFirst !== 'stroke' ? 'bg-rose-500/20 text-rose-300 shadow-sm border border-rose-500/20' : 'text-zinc-500 hover:bg-surface-hover'}`}
                                    >
                                        داخلی (Inside)
                                    </button>
                                    <button 
                                        onClick={() => onUpdateObject('paintFirst', 'stroke')}
                                        className={`flex-1 py-1.5 text-[10px] rounded-md transition-all ${selectedObject?.paintFirst === 'stroke' ? 'bg-rose-500/20 text-rose-300 shadow-sm border border-rose-500/20' : 'text-zinc-500 hover:bg-surface-hover'}`}
                                    >
                                        خارجي (Outside)
                                    </button>
                                </div>
                            </div>
                        )}
                  </div>
              </div>
          </div>

          {/* Shadows */}
          <div className="border border-white/5 rounded-xl overflow-hidden bg-surface">
              <div className="p-3 bg-surface-hover flex items-center gap-2 text-xs font-bold text-zinc-300 border-b border-white/5">
                  <Droplets size={14} className="text-cyan-500" />
                  سایه و افکت
              </div>
              <div className="p-3 space-y-3">
                   <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <input 
                                type="checkbox" 
                                checked={!!selectedObject?.shadow}
                                onChange={(e) => toggleShadow(e.target.checked)}
                                className="w-4 h-4 rounded border-white/5 bg-background text-primary focus:ring-offset-0 focus:ring-1 focus:ring-primary/30"
                            />
                            <label className="text-[10px] font-bold text-zinc-500 uppercase">سایه (Drop Shadow)</label>
                        </div>
                        {selectedObject?.shadow && (
                            <input 
                            type="color" 
                            value={selectedObject?.shadow?.color || '#000000'} 
                            onChange={(e) => handleShadowChange('color', e.target.value)} 
                            className="w-5 h-5 rounded cursor-pointer"
                            />
                        )}
                   </div>

                   {selectedObject?.shadow && (
                       <div className="space-y-4 animate-fade-in">
                           <div>
                              <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                                  <span>محو شدگی (Blur)</span>
                                  <span>{selectedObject?.shadow?.blur || 0}</span>
                              </div>
                              <input type="range" min="0" max="100" value={selectedObject?.shadow?.blur || 0} onChange={(e) => handleShadowChange('blur', parseInt(e.target.value))} className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-cyan-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md" />
                           </div>

                           <div className="grid grid-cols-2 gap-3">
                               <div>
                                  <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                                      <span>X Offset</span>
                                  </div>
                                  <input type="range" min="-50" max="50" value={selectedObject?.shadow?.offsetX || 0} onChange={(e) => handleShadowChange('offsetX', parseInt(e.target.value))} className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-cyan-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md" />
                               </div>
                               <div>
                                  <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                                      <span>Y Offset</span>
                                  </div>
                                  <input type="range" min="-50" max="50" value={selectedObject?.shadow?.offsetY || 0} onChange={(e) => handleShadowChange('offsetY', parseInt(e.target.value))} className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-cyan-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md" />
                               </div>
                           </div>
                       </div>
                   )}
              </div>
          </div>

      </div>

      {!isTextSelected && (
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-center">
              <p className="text-xs text-primary">یک متن را برای ویرایش تنظیمات انتخاب کنید</p>
          </div>
      )}
      
    </div>
  );
};

export default TextPanel;