import React, { useState, useRef } from 'react';
import { Type as TypeIcon, Image as ImageIcon, Trash2, Lock, Eye, EyeOff, Layers, GripVertical, Edit2, Check } from 'lucide-react';

interface LayersPanelProps {
  layers: any[];
  onDeleteLayer: (index: number) => void;
  onToggleLock: (index: number) => void;
  onToggleVisibility: (index: number) => void;
  onReorderLayer: (fromIndex: number, toIndex: number) => void;
  onRenameLayer: (index: number, newName: string) => void;
}

const LayersPanel: React.FC<LayersPanelProps> = ({
  layers,
  onDeleteLayer,
  onToggleLock,
  onToggleVisibility,
  onReorderLayer,
  onRenameLayer
}) => {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  
  // Ref to track if we are dragging
  const dragItem = useRef<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
      dragItem.current = index;
      e.dataTransfer.effectAllowed = "move";
      // Transparent drag image or default
  };

  const handleDragEnter = (e: React.DragEvent, index: number) => {
      if (dragItem.current !== index) {
          setDragOverIndex(index);
      }
  };
  
  const handleDragLeave = () => {
      // Optional: Logic to clear dragOver if leaving the container
  };

  const handleDragEnd = () => {
      setDragOverIndex(null);
      dragItem.current = null;
  };

  const handleDrop = (e: React.DragEvent, targetUiIndex: number) => {
      e.preventDefault();
      const sourceUiIndex = dragItem.current;
      
      setDragOverIndex(null);
      dragItem.current = null;

      if (sourceUiIndex === null || sourceUiIndex === targetUiIndex) return;

      // Convert UI Index (Top = 0) to Data Index (Bottom = 0)
      const N = layers.length;
      const sourceDataIndex = N - 1 - sourceUiIndex;
      const targetDataIndex = N - 1 - targetUiIndex;

      onReorderLayer(sourceDataIndex, targetDataIndex);
  };

  const startEditing = (index: number, currentName: string) => {
      setEditingIndex(index);
      setEditName(currentName);
  };

  const saveName = (index: number) => {
      if (editName.trim()) {
          // Convert UI index to Data index
          const N = layers.length;
          const dataIndex = N - 1 - index;
          onRenameLayer(dataIndex, editName.trim());
      }
      setEditingIndex(null);
  };

  return (
    <div className="space-y-3 animate-fade-in pb-10">
       <div className="text-[10px] text-slate-500 mb-2 flex items-center gap-1">
           <Layers size={12} />
           <span>برای تغییر ترتیب، لایه‌ها را بکشید و رها کنید.</span>
       </div>

       {layers.length === 0 ? (
         <div className="flex flex-col items-center justify-center py-16 text-slate-600 border-2 border-dashed border-white/5 rounded-2xl bg-surface">
           <Layers size={40} className="mb-3 opacity-20" />
           <p className="text-sm font-medium">هنوز لایه‌ای وجود ندارد</p>
         </div>
       ) : (
         <div onDragLeave={() => setDragOverIndex(null)}>
            {layers.slice().reverse().map((layer, index) => {
                const actualIndex = layers.length - 1 - index;
                const layerName = layer.name || (layer.type === 'i-text' ? (layer.text ? layer.text.substring(0, 15) : 'متن') : (layer.type === 'image' ? 'تصویر' : 'لایه'));
                const isEditing = editingIndex === index;

                return (
                    <div 
                        key={actualIndex} // Use unique ID if available, but actualIndex (data index) is stable enough for re-rendering
                        draggable={!isEditing}
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragEnter={(e) => handleDragEnter(e, index)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragEnd={handleDragEnd}
                        className={`
                            relative flex items-center justify-between p-2 rounded-xl border transition-all duration-200 mb-2
                            ${dragOverIndex === index ? 'border-primary bg-primary/10 translate-y-1' : 'border-white/5 bg-surface hover:bg-surface-hover hover:border-white/10'}
                            ${isEditing ? 'ring-1 ring-primary border-primary/50' : ''}
                        `}
                    >
                        <div className="flex items-center gap-3 overflow-hidden flex-1">
                            {/* Drag Handle */}
                            <div className="cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-400 p-1">
                                <GripVertical size={14} />
                            </div>

                            {/* Icon */}
                            <div className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center ${layer.type === 'i-text' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>
                                {layer.type === 'i-text' ? <TypeIcon size={14} /> : <ImageIcon size={14} />}
                            </div>

                            {/* Name / Input */}
                            {isEditing ? (
                                <div className="flex items-center gap-1 flex-1 min-w-0">
                                    <input 
                                        autoFocus
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        onBlur={() => saveName(index)}
                                        onKeyDown={(e) => e.key === 'Enter' && saveName(index)}
                                        className="w-full bg-background border border-primary/50 rounded px-2 py-1 text-xs text-white focus:outline-none"
                                    />
                                    <button onClick={() => saveName(index)} className="text-emerald-400 hover:bg-emerald-500/10 p-1 rounded">
                                        <Check size={14} />
                                    </button>
                                </div>
                            ) : (
                                <span 
                                    onDoubleClick={() => startEditing(index, layerName)}
                                    className="text-xs font-medium text-slate-300 truncate text-right group-hover:text-white transition-colors cursor-text flex-1" 
                                    dir="auto"
                                    title="دوبار کلیک برای تغییر نام"
                                >
                                    {layerName}
                                </span>
                            )}
                        </div>

                        {/* Actions */}
                        {!isEditing && (
                            <div className="flex items-center gap-0.5 ml-2">
                                <button onClick={() => startEditing(index, layerName)} className="p-1.5 text-slate-500 hover:text-white hover:bg-surface-hover rounded-md transition-colors opacity-0 group-hover:opacity-100">
                                    <Edit2 size={12} />
                                </button>
                                <div className="w-px h-3 bg-border mx-1"></div>
                                <button onClick={() => onToggleVisibility(actualIndex)} className={`p-1.5 rounded-md transition-colors ${layer.visible !== false ? 'text-slate-400 hover:text-white hover:bg-surface-hover' : 'text-slate-600'}`}>
                                    {layer.visible !== false ? <Eye size={14} /> : <EyeOff size={14} />}
                                </button>
                                <button onClick={() => onToggleLock(actualIndex)} className={`p-1.5 rounded-md transition-colors ${layer.lockMovementX ? 'text-orange-400 bg-orange-400/10' : 'text-slate-400 hover:text-white hover:bg-surface-hover'}`}>
                                    <Lock size={14} />
                                </button>
                                <button onClick={() => onDeleteLayer(actualIndex)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        )}
                    </div>
                );
            })}
         </div>
       )}
    </div>
  );
};

export default LayersPanel;