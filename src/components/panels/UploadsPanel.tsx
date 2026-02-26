import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, Trash2, Plus, X, Sliders, Move, Eye } from 'lucide-react';

interface UploadsPanelProps {
  onAddImage: (url: string) => void;
  selectedObject: any;
  onUpdateObject: (key: string, value: any) => void;
}

const UploadsPanel: React.FC<UploadsPanelProps> = ({ 
    onAddImage,
    selectedObject,
    onUpdateObject
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [recentUploads, setRecentUploads] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [activeView, setActiveView] = useState<'uploads' | 'settings'>('uploads');

  // Determine if we should show settings
  const isImageSelected = selectedObject && (selectedObject.type === 'image');

  // Automatically switch to settings if an image is selected
  useEffect(() => {
    if (isImageSelected) {
        setActiveView('settings');
    } else {
        setActiveView('uploads');
    }
  }, [isImageSelected]);

  const handleFileProcess = (file: File) => {
      // Validate file type
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (f) => {
        if (f.target?.result) {
          const result = f.target.result as string;
          // Add to canvas immediately
          onAddImage(result);
          // Add to recent list (avoid duplicates)
          setRecentUploads(prev => {
              if (prev.includes(result)) return prev;
              return [result, ...prev].slice(0, 20); // Keep last 20
          });
        }
      };
      reader.readAsDataURL(file);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
        handleFileProcess(e.target.files[0]);
    }
    // Reset input value to allow selecting same file again
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files?.[0]) {
          handleFileProcess(e.dataTransfer.files[0]);
      }
  };
  
  const removeUpload = (e: React.MouseEvent, index: number) => {
      e.stopPropagation();
      setRecentUploads(prev => prev.filter((_, i) => i !== index));
  }

  // Values for controls
  const scaleX = isImageSelected ? Math.round((selectedObject.scaleX || 1) * 100) : 100;
  const rotation = isImageSelected ? Math.round(selectedObject.angle || 0) : 0;
  const opacity = isImageSelected ? Math.round((selectedObject.opacity !== undefined ? selectedObject.opacity : 1) * 100) : 100;

  return (
    <div className="flex flex-col h-full animate-fade-in pb-10">
      
       {/* Header Tabs */}
       <div className="flex items-center gap-2 mb-6 bg-surface p-1 rounded-xl border border-white/5 shrink-0">
         <button 
            onClick={() => setActiveView('uploads')} 
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${activeView === 'uploads' ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-surface-hover'}`}
         >
           <UploadCloud size={14} /><span>آپلود</span>
         </button>
         <button 
            onClick={() => setActiveView('settings')} 
            disabled={!isImageSelected} 
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${activeView === 'settings' ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed'}`}
         >
           <Sliders size={14} /><span>تنظیمات</span>
         </button>
      </div>

      {activeView === 'uploads' && (
          <div className="space-y-6 animate-slide-up h-full flex flex-col">
            <div className="space-y-2">
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                        تصاویر خود را بکشید و رها کنید یا برای انتخاب کلیک کنید.
                        <br/>
                        <span className="opacity-50">(ذخیره موقت در حافظه مرورگر)</span>
                    </p>
            </div>

            {/* Drop Zone */}
            <div 
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                    relative overflow-hidden
                    border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 group
                    ${isDragging 
                        ? 'border-primary bg-primary/10 scale-[1.02] shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)]' 
                        : 'border-white/5 hover:border-primary/50 bg-surface hover:bg-surface-hover'
                    }
                `}
            >
                {/* Background Animation Element */}
                <div className={`absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent transition-opacity duration-500 ${isDragging ? 'opacity-100' : 'opacity-0'}`} />

                <div className={`
                    w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-300 relative z-10
                    ${isDragging ? 'bg-primary text-white scale-110 shadow-lg' : 'bg-surface-hover text-slate-500 group-hover:bg-primary/10 group-hover:text-primary'}
                `}>
                {isDragging ? <Plus size={32} /> : <UploadCloud size={32} />}
                </div>
                <h3 className="text-sm font-bold text-white mb-2 relative z-10">
                    {isDragging ? 'رها کنید' : 'انتخاب فایل'}
                </h3>
                <p className="text-[10px] text-slate-500 relative z-10">
                    JPG, PNG, SVG (حداکثر ۵ مگابایت)
                </p>
                <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange}
                />
            </div>

            {/* Recent Uploads List */}
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        آپلودهای اخیر <span className="text-slate-600 font-mono text-[9px] ml-1">({recentUploads.length})</span>
                    </label>
                    {recentUploads.length > 0 && (
                        <button 
                            onClick={() => setRecentUploads([])}
                            className="text-[10px] text-red-400 hover:text-red-300 transition-colors"
                        >
                            پاکسازی همه
                        </button>
                    )}
                </div>
                
                {recentUploads.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-600 border border-dashed border-white/5 rounded-xl bg-surface m-1">
                        <ImageIcon size={32} className="mb-2 opacity-20" />
                        <span className="text-[10px]">هیچ تصویری بارگذاری نشده است</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3 overflow-y-auto custom-scrollbar pr-1 pb-2 content-start">
                        {recentUploads.map((src, index) => (
                            <div 
                                key={index} 
                                onClick={() => onAddImage(src)}
                                className="group relative aspect-square bg-surface rounded-xl border border-white/5 overflow-hidden cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg animate-fade-in"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                {/* Checkerboard background for transparent images */}
                                <div className="absolute inset-0 opacity-10" style={{ 
                                    backgroundImage: 'linear-gradient(45deg, #888 25%, transparent 25%), linear-gradient(-45deg, #888 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #888 75%), linear-gradient(-45deg, transparent 75%, #888 75%)',
                                    backgroundSize: '10px 10px',
                                    backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0px' 
                                }} />
                                
                                <img src={src} alt={`upload-${index}`} className="relative z-10 w-full h-full object-contain p-2" />
                                
                                {/* Overlay Actions */}
                                <div className="absolute inset-0 z-20 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                                    <button 
                                        className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-lg hover:scale-110 transition-transform shadow-lg"
                                        title="افزودن به بوم"
                                    >
                                        <Plus size={16} />
                                    </button>
                                    <button 
                                        onClick={(e) => removeUpload(e, index)}
                                        className="w-8 h-8 flex items-center justify-center bg-surface-hover text-red-400 border border-white/5 rounded-lg hover:bg-red-500 hover:text-white hover:border-red-500 transition-all hover:scale-110"
                                        title="حذف"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
          </div>
      )}

      {activeView === 'settings' && isImageSelected && (
           <div className="animate-slide-up space-y-4 overflow-y-auto custom-scrollbar flex-1 pb-4">
              
              {/* 1. Dimensions (Same as GraphicsPanel) */}
              <div className="bg-surface rounded-xl border border-white/5 overflow-hidden">
                  <div className="p-3 bg-surface-hover flex items-center gap-2 text-xs font-bold text-slate-300 border-b border-white/5">
                    <Move size={14} className="text-orange-500" />موقعیت و ابعاد
                  </div>
                  <div className="p-3 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <input type="number" value={Math.round(selectedObject?.left || 0)} onChange={(e) => onUpdateObject('left', parseInt(e.target.value))} className="w-full bg-background border border-white/5 rounded-lg p-2 text-white text-xs text-center focus:border-primary/50" placeholder="X" />
                            <input type="number" value={Math.round(selectedObject?.top || 0)} onChange={(e) => onUpdateObject('top', parseInt(e.target.value))} className="w-full bg-background border border-white/5 rounded-lg p-2 text-white text-xs text-center focus:border-primary/50" placeholder="Y" />
                        </div>
                        <div>
                            <div className="flex justify-between text-[10px] text-slate-400 mb-1"><span>چرخش</span><span className="font-mono text-orange-400">{rotation}°</span></div>
                            <input type="range" min="0" max="360" value={rotation} onChange={(e) => onUpdateObject('angle', parseInt(e.target.value))} className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-orange-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md" />
                        </div>
                        <div>
                            <div className="flex justify-between text-[10px] text-slate-400 mb-1"><span>مقیاس</span><span className="font-mono text-emerald-400">{scaleX}%</span></div>
                            <input type="range" min="10" max="300" value={scaleX} onChange={(e) => { const val = parseInt(e.target.value) / 100; onUpdateObject('scaleX', val); onUpdateObject('scaleY', val); }} className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-emerald-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md" />
                        </div>
                  </div>
              </div>

              {/* 2. Appearance (Opacity) */}
              <div className="bg-surface rounded-xl border border-white/5 overflow-hidden">
                  <div className="p-3 bg-surface-hover flex items-center gap-2 text-xs font-bold text-slate-300 border-b border-white/5">
                    <Eye size={14} className="text-blue-500" />ظاهر
                  </div>
                  <div className="p-3 space-y-3">
                        <div>
                            <div className="flex justify-between text-[10px] text-slate-400 mb-1"><span>شفافیت (Opacity)</span><span className="font-mono text-blue-400">{opacity}%</span></div>
                            <input type="range" min="0" max="100" value={opacity} onChange={(e) => onUpdateObject('opacity', parseInt(e.target.value) / 100)} className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md" />
                        </div>
                  </div>
              </div>

           </div>
      )}
    </div>
  );
};

export default UploadsPanel;