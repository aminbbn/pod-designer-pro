import React, { useEffect, useRef, useState } from 'react';
import { Product, ProductView } from '../types';
import { Maximize } from 'lucide-react';

// --- Sub-Component: Product Backdrop (The T-Shirt/Hoodie) ---
const ProductBackdrop: React.FC<{ view: ProductView; color: string }> = ({ view, color }) => {
  return (
    <div 
      className="absolute inset-0 z-0 pointer-events-none transition-all duration-500"
    >
      {view.path ? (
        <svg 
            viewBox={view.viewBox || "0 0 500 600"} 
            width="100%" 
            height="100%" 
            className="overflow-visible"
        >
            {/* 1. Base Shape: Filled with color, but with a CLEAR stroke */}
            <path 
                d={view.path} 
                fill={color}
                stroke="#52525b" // Zinc-600: subtle grey outline
                strokeWidth="1.5"
                strokeLinejoin="round" 
                vectorEffect="non-scaling-stroke"
                className="transition-colors duration-300"
            />

            {/* 2. Details (Collars, Folds): Clear technical lines */}
            {view.detailPaths?.map((d, i) => (
                <path 
                    key={i} 
                    d={d} 
                    fill="none" 
                    stroke="#52525b" // Same technical grey
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                />
            ))}
        </svg>
      ) : (
        <img 
            src={view.imageUrl} 
            alt="Product" 
            className="w-full h-full object-contain"
        />
      )}
    </div>
  );
};

// --- Sub-Component: Fabric Layer (The Interactive Canvas) ---
interface FabricLayerProps {
  canvasRef: React.MutableRefObject<any>;
  onObjectSelected: (obj: any) => void;
  onSelectionCleared: () => void;
  setLayers: (layers: any[]) => void;
  quality: number;
  printArea: { top: number; left: number; width: number; height: number };
}

const FabricLayer: React.FC<FabricLayerProps> = ({ 
  canvasRef, 
  onObjectSelected, 
  onSelectionCleared, 
  setLayers,
  quality,
  printArea
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  // 1. Initialize Canvas
  useEffect(() => {
    if (!window.fabric || !containerRef.current || initialized.current) return;
    
    // Create canvas with high resolution backing store
    // We set logical size (500x600) * quality (2) = 1000x1200 physical pixels
    const canvas = new window.fabric.Canvas('c', {
      width: 500 * quality,
      height: 600 * quality,
      backgroundColor: null, // Transparent
      preserveObjectStacking: true,
      selection: true,
      enableRetinaScaling: false, // We handle scaling manually via zoom
    });

    // Force the CSS size to match the base logical size (500x600)
    canvas.setDimensions({ width: '500px', height: '600px' }, { cssOnly: true });

    // Set zoom to match the quality multiplier
    canvas.setZoom(quality);

    canvasRef.current = canvas;
    initialized.current = true;

    // Event Listeners for Selection & Layers
    canvas.on('selection:created', (e: any) => {
      if(e.selected && e.selected.length > 0) onObjectSelected(e.selected[0]);
    });
    canvas.on('selection:updated', (e: any) => {
       if(e.selected && e.selected.length > 0) onObjectSelected(e.selected[0]);
    });
    canvas.on('selection:cleared', () => {
      onSelectionCleared();
    });
    
    const updateLayers = () => {
        setLayers(canvas.getObjects());
    }
    
    canvas.on('object:added', updateLayers);
    canvas.on('object:removed', updateLayers);
    canvas.on('object:modified', updateLayers);

    return () => {
      // Cleanup if necessary
    };
  }, [quality]);

  // 2. Apply Safe Zone Constraints (ClipPath + Movement Limits)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !printArea) return;

    // A. Apply Visual Clipping (The "Mask")
    // This ensures anything outside the box is not rendered
    const clipRect = new window.fabric.Rect({
        left: printArea.left,
        top: printArea.top,
        width: printArea.width,
        height: printArea.height,
        absolutePositioned: true,
        fill: 'transparent',
        selectable: false,
        evented: false,
        strokeWidth: 0
    });
    canvas.clipPath = clipRect;

    // B. Apply Movement Constraints (The "Wall")
    // This prevents dragging objects out of the box
    const constraintHandler = (e: any) => {
        const obj = e.target;
        if (!obj) return;
        
        // We assume origin is 'center' for our objects (set in App.tsx)
        // If not, logic needs adjustment.
        
        const objWidth = obj.getScaledWidth();
        const objHeight = obj.getScaledHeight();
        const halfW = objWidth / 2;
        const halfH = objHeight / 2;
        
        // Calculate boundaries for the CENTER of the object
        let minLeft = printArea.left + halfW;
        let maxLeft = printArea.left + printArea.width - halfW;
        let minTop = printArea.top + halfH;
        let maxTop = printArea.top + printArea.height - halfH;

        // If Object is wider/taller than the print area, lock it to the center
        if (minLeft > maxLeft) {
            minLeft = maxLeft = printArea.left + printArea.width / 2;
        }
        if (minTop > maxTop) {
            minTop = maxTop = printArea.top + printArea.height / 2;
        }

        // Apply Clamping
        if (obj.left < minLeft) obj.left = minLeft;
        if (obj.left > maxLeft) obj.left = maxLeft;
        if (obj.top < minTop) obj.top = minTop;
        if (obj.top > maxTop) obj.top = maxTop;
    };

    // Safely add and remove the specific listener
    canvas.on('object:moving', constraintHandler);

    canvas.requestRenderAll();

    return () => {
        // Only remove this specific handler, so we don't break App.tsx's listeners
        canvas.off('object:moving', constraintHandler);
    };

  }, [printArea]);

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center" ref={containerRef}>
      <canvas id="c" />
    </div>
  );
};

// --- Main Component: Canvas Area ---
interface CanvasAreaProps {
  canvasRef: React.MutableRefObject<any>; // fabric.Canvas
  currentProduct: Product;
  currentViewIndex: number;
  setCurrentViewIndex: (index: number) => void;
  currentProductColor: string;
  currentProductSize: string;
  onSelectionCleared: () => void;
  onObjectSelected: (obj: any) => void;
  setLayers: (layers: any[]) => void;
  settings: any;
}

const CanvasArea: React.FC<CanvasAreaProps> = ({ 
  canvasRef, 
  currentProduct,
  currentViewIndex,
  setCurrentViewIndex,
  currentProductColor,
  currentProductSize,
  onSelectionCleared,
  onObjectSelected,
  setLayers,
  settings
}) => {
  const currentView = currentProduct.views[currentViewIndex];
  const [zoom, setZoom] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleViewToggle = (index: number) => {
      if (index === currentViewIndex || isAnimating) return;
      setIsAnimating(true);
      
      setTimeout(() => {
          setCurrentViewIndex(index);
          setTimeout(() => {
              setIsAnimating(false);
          }, 50);
      }, 300);
  };

  // Quality Multiplier: 2x resolution for crisp text/edges
  const QUALITY = 2;
  const BASE_WIDTH = 500;
  const BASE_HEIGHT = 600;

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 4.0));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.4));
  };

  const handleFit = () => {
    if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        // Base content size
        const contentWidth = BASE_WIDTH;
        const contentHeight = BASE_HEIGHT;
        
        // Calculate scale to fit
        const scaleX = width / contentWidth;
        const scaleY = height / contentHeight;
        const fitRatio = 0.90; 

        const optimalZoom = Math.min(scaleX, scaleY) * fitRatio;
        setZoom(Math.min(Math.max(optimalZoom, 0.4), 4.0));
    }
  };

  return (
    <div ref={containerRef} className={`flex-1 bg-background relative flex items-center justify-center overflow-hidden ${settings.showGrid ? 'workspace-grid' : ''}`}>
       
       {/* Size Indicator */}
       <div className="absolute top-8 right-8 z-40 bg-surface/80 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl shadow-lg flex items-center gap-2" dir="rtl">
           <span className="text-xs text-zinc-400">سایز:</span>
           <span className="text-sm font-bold text-white font-mono bg-primary/20 px-2 py-0.5 rounded">{currentProductSize}</span>
       </div>

       {/* View Toggle (Front/Back) */}
       {currentProduct.views.length > 1 && (
           <div className="absolute top-8 left-0 right-0 flex justify-center z-40 pointer-events-none">
               <div className="bg-surface/80 backdrop-blur-md border border-white/10 p-1.5 rounded-xl flex gap-1 shadow-2xl pointer-events-auto" dir="rtl">
                   {currentProduct.views.map((view, index) => (
                       <button 
                           key={view.id}
                           onClick={() => handleViewToggle(index)}
                           className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                               currentViewIndex === index 
                               ? 'bg-primary text-white shadow-md' 
                               : 'text-zinc-400 hover:text-white hover:bg-white/5'
                           }`}
                       >
                           {view.name === 'front' ? 'جلو' : view.name === 'back' ? 'پشت' : view.name}
                       </button>
                   ))}
               </div>
           </div>
       )}

       {/* Product Display Container - Base Size (500x600) */}
       <div 
         className="relative z-10 origin-center shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
         style={{
             width: `${BASE_WIDTH}px`,
             height: `${BASE_HEIGHT}px`,
             transform: `scale(${zoom})`, 
         }}
       >
         <div className={`absolute inset-0 transition-all duration-300 ${isAnimating ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'}`}>
             {/* Layer 1: The Product SVG (Technical Outline) */}
             <ProductBackdrop view={currentView} color={currentProductColor} />
             
             {/* Layer 2: Printable Area Guides - Uses Base Coordinates */}
             <div 
                className={`absolute z-10 pointer-events-none transition-all duration-300 ${settings.showSafeZone ? 'opacity-100' : 'opacity-0'}`}
                style={{
                    top: currentView.printArea.top,
                    left: currentView.printArea.left,
                    width: currentView.printArea.width,
                    height: currentView.printArea.height,
                }}
             >
                 {/* Dashed Border */}
                 <div className="w-full h-full border-2 border-dashed border-white/5 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.2)]"></div>
                 
                 {/* Tech Corners (Viewfinder style) */}
                 <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-primary/80"></div>
                 <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-primary/80"></div>
                 <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-primary/80"></div>
                 <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-primary/80"></div>

                 {/* Label */}
                 <div className="absolute -top-6 left-0 right-0 flex justify-center pointer-events-none">
                     <div className="px-2 py-0.5 bg-primary/90 rounded border border-white/5 shadow-sm whitespace-nowrap">
                         <span className="text-[10px] font-bold text-white">محدوده چاپ</span>
                     </div>
                 </div>
             </div>

             {/* Layer 3: Fabric Canvas (Interactive) - Handles its own High DPI internally */}
             <FabricLayer 
                canvasRef={canvasRef} 
                onObjectSelected={onObjectSelected}
                onSelectionCleared={onSelectionCleared}
                setLayers={setLayers}
                quality={QUALITY}
                printArea={currentView.printArea}
             />
         </div>
       </div>

       {/* Floating Zoom Controls */}
       <div className="absolute bottom-8 left-8 flex flex-col gap-3 z-40">
          <button 
            onClick={handleFit}
            className="w-10 h-10 bg-surface border border-white/5 rounded-lg flex items-center justify-center hover:bg-surface-hover text-white transition-all shadow-lg hover:shadow-xl active:scale-95 group relative"
            title="Fit to screen"
          >
             <Maximize size={18} />
             <span className="absolute left-full ml-2 px-2 py-1 bg-black/80 text-[10px] text-white rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                جاگیری در صفحه
             </span>
          </button>
          <div className="w-full h-px bg-surface-hover my-1"></div>
          <button 
            onClick={handleZoomIn}
            className="w-10 h-10 bg-surface border border-white/5 rounded-lg flex items-center justify-center hover:bg-surface-hover text-white transition-all shadow-lg hover:shadow-xl active:scale-95"
          >
             <span className="text-xl font-light pb-1">+</span>
          </button>
          <button 
            onClick={handleZoomOut}
            className="w-10 h-10 bg-surface border border-white/5 rounded-lg flex items-center justify-center hover:bg-surface-hover text-white transition-all shadow-lg hover:shadow-xl active:scale-95"
          >
             <span className="text-xl font-light pb-1">-</span>
          </button>
       </div>
    </div>
  );
};

export default CanvasArea;