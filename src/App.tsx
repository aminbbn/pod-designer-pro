import React, { useState, useRef, useEffect } from 'react';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import ToolsPanel from './components/ToolsPanel';
import CanvasArea from './components/CanvasArea';
import LoginPage from './components/admin/LoginPage';
import AdminDashboard from './components/admin/AdminDashboard';
import { TabType, Product, ProductColor, DesignConcept } from './types';
import { PRODUCTS } from './constants';

type ViewMode = 'editor' | 'login' | 'admin';

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [activeTab, setActiveTab] = useState<TabType>(TabType.PRODUCTS);
  const [viewMode, setViewMode] = useState<ViewMode>('editor');
  const [activeFont, setActiveFont] = useState('Vazirmatn');
  const [currentProduct, setCurrentProduct] = useState<Product>(products[0]);
  const [currentViewIndex, setCurrentViewIndex] = useState(0);
  const [currentProductColor, setCurrentProductColor] = useState<ProductColor>(products[0].colors[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [designConcepts, setDesignConcepts] = useState<DesignConcept[]>([]);
  const [layers, setLayers] = useState<any[]>([]);
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const viewStatesRef = useRef<Record<string, any>>({});

  const handleViewChange = (newIndex: number) => {
    if (newIndex === currentViewIndex) return;
    
    if (canvasRef.current) {
      // Save current state
      const stateKey = `${currentProduct.id}-${currentViewIndex}`;
      viewStatesRef.current[stateKey] = canvasRef.current.toJSON(['id', 'name', 'selectable', 'snapAngle']);
      
      // Load new state
      const newStateKey = `${currentProduct.id}-${newIndex}`;
      const newState = viewStatesRef.current[newStateKey];
      
      canvasRef.current.clear();
      if (newState) {
        canvasRef.current.loadFromJSON(newState, () => {
          const printArea = currentProduct.views[newIndex].printArea;
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
          canvasRef.current.clipPath = clipRect;
          canvasRef.current.requestRenderAll();
          // Trigger layer update
          canvasRef.current.fire('object:modified');
        });
      } else {
        canvasRef.current.fire('object:modified');
      }
    }
    
    setCurrentViewIndex(newIndex);
    setSelectedObject(null);
  };

  const handleProductChange = (product: Product) => {
    if (canvasRef.current) {
      // Save current
      const stateKey = `${currentProduct.id}-${currentViewIndex}`;
      viewStatesRef.current[stateKey] = canvasRef.current.toJSON(['id', 'name', 'selectable', 'snapAngle']);
      
      // Load new
      const newStateKey = `${product.id}-0`;
      const newState = viewStatesRef.current[newStateKey];
      
      canvasRef.current.clear();
      if (newState) {
        canvasRef.current.loadFromJSON(newState, () => {
          const printArea = product.views[0].printArea;
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
          canvasRef.current.clipPath = clipRect;
          canvasRef.current.requestRenderAll();
          canvasRef.current.fire('object:modified');
        });
      } else {
        canvasRef.current.fire('object:modified');
      }
    }
    
    setCurrentProduct(product);
    setCurrentProductColor(product.colors[0]);
    setCurrentViewIndex(0);
    setSelectedObject(null);
  };

  // --- AI Actions ---
  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const { generateDesignConcepts } = await import('./services/geminiService');
      const concepts = await generateDesignConcepts(aiPrompt);
      setDesignConcepts(concepts);
    } catch (error) {
      console.error('AI Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyDesign = async (concept: DesignConcept) => {
    if (!canvasRef.current) return;
    
    // Clear existing objects if needed or just add new ones
    // For now, we add them to the existing canvas
    
    for (const el of concept.elements) {
      if (el.type === 'text') {
        handleAddText(el.content || '', el.fontFamily || 'Vazirmatn', {
          top: currentProduct.views[currentViewIndex].printArea.top + (currentProduct.views[currentViewIndex].printArea.height / 2) + (el.yOffset || 0),
          fill: el.fill || '#ffffff',
          fontSize: el.fontSize || 40,
          fontWeight: el.fontWeight || 'normal'
        });
      } else if (el.type === 'image' && el.query) {
        const { searchPixabayImages } = await import('./services/pixabayService');
        const images = await searchPixabayImages(el.query);
        if (images.length > 0) {
          handleAddImage(images[0].largeImageURL, {
            top: currentProduct.views[currentViewIndex].printArea.top + (currentProduct.views[currentViewIndex].printArea.height / 2) + (el.yOffset || 0)
          });
        }
      }
    }
  };
  
  // --- New Settings State ---
  const [canvasSettings, setCanvasSettings] = useState({
    showGrid: true,
    showSafeZone: true,
    snapRotation: false,
    darkMode: true
  });

  const canvasRef = useRef<any>(null); // Fabric canvas reference

  // Update Settings Handler
  const handleUpdateSettings = (key: string, value: any) => {
    setCanvasSettings(prev => ({ ...prev, [key]: value }));
  };

  // React to Snap Rotation Change
  useEffect(() => {
    if (!canvasRef.current) return;
    const snapAngle = canvasSettings.snapRotation ? 45 : undefined;
    
    // Update existing objects
    canvasRef.current.getObjects().forEach((obj: any) => {
        obj.snapAngle = snapAngle;
    });
    canvasRef.current.requestRenderAll();
  }, [canvasSettings.snapRotation]);

  // --- Canvas Actions ---

  const getSafeZoneConfig = (objWidth: number, objHeight: number) => {
      const printArea = currentProduct.views[currentViewIndex].printArea;
      
      // Target size: 60% of the print area dimensions for a nice initial fit
      const targetWidth = printArea.width * 0.6;
      const targetHeight = printArea.height * 0.6;

      // Calculate scale to fit within target box
      const scaleX = targetWidth / objWidth;
      const scaleY = targetHeight / objHeight;
      const scale = Math.min(scaleX, scaleY);

      return {
          left: printArea.left + (printArea.width / 2),
          top: printArea.top + (printArea.height / 2),
          scale: scale
      };
  };

  const handleAddText = (text: string, fontFamily: string, options: any = {}) => {
    if (!canvasRef.current || !window.fabric) return;
    
    const printArea = currentProduct.views[currentViewIndex].printArea;
    const centerX = printArea.left + (printArea.width / 2);
    const centerY = printArea.top + (printArea.height / 2);
    
    const textBox = new window.fabric.IText(text, {
      left: centerX, 
      top: centerY,
      fontFamily: fontFamily,
      fill: options.fill || '#ffffff',
      fontSize: options.fontSize || 40,
      fontWeight: options.fontWeight || 'normal',
      shadow: options.shadow || null,
      stroke: options.stroke || null,
      strokeWidth: options.strokeWidth || 0,
      originX: 'center',
      originY: 'center',
      cornerColor: '#3B82F6',
      cornerStyle: 'circle',
      transparentCorners: false,
      cornerSize: 10,
      textAlign: 'right',
      direction: 'rtl',
      strokeUniform: true,
      padding: 20,
      objectCaching: false, // Important for immediate render
      name: 'Text Layer', // Default name
      snapAngle: canvasSettings.snapRotation ? 45 : undefined, // Apply snap setting
      ...options
    });

    canvasRef.current.add(textBox);
    canvasRef.current.setActiveObject(textBox);
  };

  const handleAddImage = (url: string, options: any = {}) => {
     if (!canvasRef.current || !window.fabric) return;

     // Check if it's an SVG (either by extension or Data URL mimetype)
     const isSvg = url.endsWith('.svg') || url.includes('image/svg+xml');

     if (isSvg) {
        window.fabric.loadSVGFromURL(url, (objects: any[], svgOptions: any) => {
            if (!objects || objects.length === 0) return;
            
            // Group the SVG objects
            const svgGroup = window.fabric.util.groupSVGElements(objects, svgOptions);
            
            const { left, top, scale } = getSafeZoneConfig(svgGroup.width || 100, svgGroup.height || 100);
            
            // Use provided position or default safe zone position
            const finalLeft = options.left !== undefined ? options.left : left;
            const finalTop = options.top !== undefined ? options.top : top;

            svgGroup.set({
                left: finalLeft,
                top: finalTop,
                scaleX: scale,
                scaleY: scale,
                originX: 'center',
                originY: 'center',
                cornerColor: '#3B82F6',
                cornerStyle: 'circle',
                transparentCorners: false,
                cornerSize: 10,
                padding: 10,
                objectCaching: false,
                name: 'Graphic Layer',
                snapAngle: canvasSettings.snapRotation ? 45 : undefined,
                ...options
            });

            // Initial cleanup of SVG colors to ensure they are consistent if needed
            // But we leave them as is until user changes color
            
            canvasRef.current.add(svgGroup);
            canvasRef.current.setActiveObject(svgGroup);
            canvasRef.current.requestRenderAll();
        });
     } else {
        // Handle Raster Images (PNG, JPG)
        window.fabric.Image.fromURL(url, (img: any) => {
            const { left, top, scale } = getSafeZoneConfig(img.width, img.height);
            
            const finalLeft = options.left !== undefined ? options.left : left;
            const finalTop = options.top !== undefined ? options.top : top;

            img.set({
                left: finalLeft,
                top: finalTop,
                scaleX: scale,
                scaleY: scale,
                originX: 'center',
                originY: 'center',
                cornerColor: '#3B82F6',
                cornerStyle: 'circle',
                transparentCorners: false,
                cornerSize: 10,
                padding: 10,
                objectCaching: false,
                name: 'Image Layer',
                snapAngle: canvasSettings.snapRotation ? 45 : undefined,
                ...options
            });
            canvasRef.current.add(img);
            canvasRef.current.setActiveObject(img);
            canvasRef.current.requestRenderAll();
        }, { crossOrigin: 'anonymous' });
     }
  };

  const handleAddGraphic = (pathData: string) => {
    if (!canvasRef.current || !window.fabric) return;

    const path = new window.fabric.Path(pathData, {
      fill: '#ffffff',
      originX: 'center',
      originY: 'center',
      cornerColor: '#3B82F6',
      cornerStyle: 'circle',
      transparentCorners: false,
      cornerSize: 10,
      padding: 10,
      objectCaching: false,
      name: 'Shape Layer',
      snapAngle: canvasSettings.snapRotation ? 45 : undefined
    });

    const { left, top, scale } = getSafeZoneConfig(path.width || 100, path.height || 100);

    path.set({
        left: left,
        top: top,
        scaleX: scale,
        scaleY: scale
    });

    canvasRef.current.add(path);
    canvasRef.current.setActiveObject(path);
  };

  // --- Advanced Color Application Logic ---
  const applyColorToLayer = (obj: any, color: string) => {
      if (!obj) return;
      
      // 1. Recursively Handle Groups (SVGs)
      // This ensures that every single path inside a complex SVG gets the color
      if (obj.type === 'group' && obj._objects) {
          obj._objects.forEach((child: any) => applyColorToLayer(child, color));
          // We also set the group's own fill to keep state consistent, 
          // though visual change happens in children
          obj.set('fill', color);
          return;
      }

      // 2. Handle Raster Images (PNGs/JPGs)
      // Instead of using simple 'tint', we use a BlendColor Filter.
      // This is more powerful and works better for "Filling" graphics.
      if (obj.type === 'image') {
          // Remove any existing BlendColor filters to avoid stacking
          obj.filters = (obj.filters || []).filter((f: any) => f.type !== 'BlendColor');
          
          if (color) {
              const blendFilter = new window.fabric.Image.filters.BlendColor({
                  color: color,
                  mode: 'tint', // 'tint' acts as multiply/overlay depending on alpha
                  alpha: 1
              });
              obj.filters.push(blendFilter);
              obj.applyFilters();
          } else {
              obj.applyFilters();
          }
          
          // Also set the 'tint' property to null to ensure no conflict, 
          // or set it if we want a fallback. We rely on filters here.
          obj.set('tint', null);
          return;
      }

      // 3. Handle Standard Vector Paths/Shapes
      // Apply color to Fill. 
      // If the object has a stroke that isn't transparent, we color that too 
      // to ensure a "Complete Fill" effect if it's a line-art icon.
      obj.set('fill', color);
      
      // Intelligent Stroke Coloring: Only if stroke exists and has width
      if (obj.stroke && obj.stroke !== 'transparent' && obj.strokeWidth > 0) {
          obj.set('stroke', color);
      }
  };

  const handleUpdateObject = (key: string, value: any) => {
    if (!canvasRef.current || !selectedObject) return;
    
    // Special handling for COLOR updates (Fill/Tint)
    if (key === 'fill' || key === 'tint') {
        // Use our robust recursive color applicator
        applyColorToLayer(selectedObject, value);
    } 
    // Special handling for SHADOW
    else if (key === 'shadow') {
        if (value === null) {
            selectedObject.set('shadow', null);
        } else if (typeof value === 'object') {
            selectedObject.set('shadow', new window.fabric.Shadow(value));
        }
    } 
    // Standard Update
    else {
        selectedObject.set(key, value);
    }
    
    // CRITICAL: Force refresh and disable caching to see changes immediately
    selectedObject.set({
        objectCaching: false,
        dirty: true
    });

    selectedObject.setCoords(); 
    canvasRef.current.requestRenderAll();
    
    setLayers([...canvasRef.current.getObjects()]); 
    setSelectedObject(canvasRef.current.getActiveObject());
  };

  const handleDeleteLayer = (index: number) => {
      if(!canvasRef.current) return;
      const objects = canvasRef.current.getObjects();
      if(objects[index]) {
          canvasRef.current.remove(objects[index]);
          canvasRef.current.discardActiveObject();
          canvasRef.current.requestRenderAll();
      }
  };

  const handleToggleLock = (index: number) => {
      if(!canvasRef.current) return;
      const objects = canvasRef.current.getObjects();
      const obj = objects[index];
      if(obj) {
          const isLocked = !obj.lockMovementX;
          obj.set({
              lockMovementX: isLocked,
              lockMovementY: isLocked,
              lockRotation: isLocked,
              lockScalingX: isLocked,
              lockScalingY: isLocked,
              selectable: !isLocked 
          });
          canvasRef.current.requestRenderAll();
          setLayers([...objects]);
      }
  }

  const handleToggleVisibility = (index: number) => {
      if(!canvasRef.current) return;
      const objects = canvasRef.current.getObjects();
      const obj = objects[index];
      if(obj) {
          obj.visible = !obj.visible;
          if(!obj.visible) canvasRef.current.discardActiveObject();
          canvasRef.current.requestRenderAll();
          setLayers([...objects]);
      }
  }

  const handleReorderLayer = (fromIndex: number, toIndex: number) => {
      if (!canvasRef.current) return;
      const objects = canvasRef.current.getObjects();
      const objectToMove = objects[fromIndex];
      
      if (objectToMove) {
          // Use moveTo() for Fabric.js v5 instead of moveObjectTo()
          canvasRef.current.moveTo(objectToMove, toIndex);
          canvasRef.current.requestRenderAll();
          setLayers([...canvasRef.current.getObjects()]);
      }
  };

  const handleRenameLayer = (index: number, newName: string) => {
      if (!canvasRef.current) return;
      const objects = canvasRef.current.getObjects();
      const obj = objects[index];
      if (obj) {
          obj.set('name', newName);
          // Force update to reflect name change in state
          setLayers([...objects]);
      }
  };

  const handleExport = () => {
    if(!canvasRef.current) return;
    canvasRef.current.discardActiveObject();
    canvasRef.current.requestRenderAll();
    
    const dataURL = canvasRef.current.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 2
    });
    
    const link = document.createElement('a');
    link.download = `smart-design-${Date.now()}.png`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    
    const handleObjectAdded = (e: any) => {
        if (e.target) {
            e.target.set('objectCaching', false);
            // Apply current snap setting to new objects
            e.target.snapAngle = canvasSettings.snapRotation ? 45 : undefined;
            
            // Ensure object has a name if not set
            if(!e.target.name) {
                const type = e.target.type;
                e.target.name = type === 'i-text' ? 'Text Layer' : (type === 'image' ? 'Image Layer' : 'Layer');
            }
        }
        setLayers(canvas.getObjects());
    };

    const updateLayers = () => {
        setLayers(canvas.getObjects());
        if (canvas.getActiveObject()) {
            setSelectedObject(canvas.getActiveObject());
        }
    };

    const handleSelectionCleared = () => {
        setSelectedObject(null);
    }

    canvas.on('object:added', handleObjectAdded);
    canvas.on('object:removed', updateLayers);
    canvas.on('object:modified', updateLayers);
    canvas.on('object:scaling', updateLayers);
    canvas.on('object:moving', updateLayers);
    canvas.on('object:rotating', updateLayers);
    canvas.on('selection:created', updateLayers);
    canvas.on('selection:updated', updateLayers);
    canvas.on('selection:cleared', handleSelectionCleared);

    return () => {
        canvas.off('object:added', handleObjectAdded);
        canvas.off('object:removed', updateLayers);
        canvas.off('object:modified', updateLayers);
        canvas.off('object:scaling', updateLayers);
        canvas.off('object:moving', updateLayers);
        canvas.off('object:rotating', updateLayers);
        canvas.off('selection:created', updateLayers);
        canvas.off('selection:updated', updateLayers);
        canvas.off('selection:cleared', handleSelectionCleared);
    };
  }, [canvasSettings.snapRotation]); // Re-bind if snap settings change logic requires it (though we handle updates in separate useEffect)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA'].includes(target.tagName) || target.isContentEditable) {
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (!canvasRef.current) return;
        const activeObjects = canvasRef.current.getActiveObjects();
        if (activeObjects && activeObjects.length > 0) {
          canvasRef.current.discardActiveObject();
          activeObjects.forEach((obj: any) => {
            canvasRef.current.remove(obj);
          });
          canvasRef.current.requestRenderAll();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={`flex flex-col h-screen bg-background text-white font-sans selection:bg-primary/30`}>
      
      {/* Admin Views */}
      {viewMode === 'login' && (
        <LoginPage 
          onLoginSuccess={() => setViewMode('admin')} 
          onClose={() => setViewMode('editor')} 
        />
      )}

      {viewMode === 'admin' ? (
        <AdminDashboard 
          onLogout={() => setViewMode('login')} 
          onBackToEditor={() => setViewMode('editor')} 
          products={products}
          setProducts={setProducts}
        />
      ) : (
        /* Editor View */
        <>
          <TopBar 
            onUndo={() => {}} 
            onRedo={() => {}} 
            onExport={handleExport}
          />
          
          <div className="flex flex-1 overflow-hidden">
            <Sidebar 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
              onUserClick={() => setViewMode('login')}
            />
            
            <ToolsPanel 
              activeTab={activeTab}
              products={products}
              currentProduct={currentProduct}
              currentProductColor={currentProductColor}
              onProductChange={handleProductChange}
              onColorChange={setCurrentProductColor}
              onAddText={handleAddText}
              onAddImage={handleAddImage}
              onAddGraphic={handleAddGraphic}
              activeFont={activeFont}
              setActiveFont={setActiveFont}
              isGenerating={isGenerating}
              setIsGenerating={setIsGenerating}
              aiPrompt={aiPrompt}
              setAiPrompt={setAiPrompt}
              handleGenerateAI={handleGenerateAI}
              designConcepts={designConcepts}
              onApplyDesign={handleApplyDesign}
              layers={layers}
              onDeleteLayer={handleDeleteLayer}
              onToggleLock={handleToggleLock}
              onToggleVisibility={handleToggleVisibility}
              onReorderLayer={handleReorderLayer}
              onRenameLayer={handleRenameLayer}
              selectedObject={selectedObject}
              onUpdateObject={handleUpdateObject}
              settings={canvasSettings}
              onUpdateSettings={handleUpdateSettings}
            />
            
            <CanvasArea 
              canvasRef={canvasRef}
              currentProduct={currentProduct}
              currentViewIndex={currentViewIndex}
              setCurrentViewIndex={handleViewChange}
              currentProductColor={currentProductColor.hex}
              onSelectionCleared={() => setSelectedObject(null)}
              onObjectSelected={setSelectedObject}
              setLayers={setLayers}
              settings={canvasSettings}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default App;