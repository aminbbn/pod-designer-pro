import React, { useState, useEffect } from 'react';
import { TabType, Product, ProductColor, DesignConcept } from '../types';
import { FONTS } from '../constants';
import { generateDesignConcepts } from '../services/geminiService';
import { searchPixabayImages } from '../services/pixabayService';

// Import New Sub-Panels
import ProductsPanel from './panels/ProductsPanel';
import TextPanel from './panels/TextPanel';
import GraphicsPanel from './panels/GraphicsPanel';
import UploadsPanel from './panels/UploadsPanel';
import AIStudioPanel from './panels/AIStudioPanel';
import LayersPanel from './panels/LayersPanel';
import SettingsPanel from './panels/SettingsPanel';

interface ToolsPanelProps {
  activeTab: TabType;
  products: Product[];
  currentProduct: Product;
  currentProductColor: ProductColor;
  onProductChange: (product: Product) => void;
  onColorChange: (color: ProductColor) => void;
  onAddText: (text: string, font: string, options?: any) => void;
  onAddImage: (url: string, options?: any) => void;
  onAddGraphic: (pathData: string) => void;
  isGenerating: boolean;
  setIsGenerating: (val: boolean) => void;
  layers: any[];
  onDeleteLayer: (index: number) => void;
  onToggleLock: (index: number) => void;
  onToggleVisibility: (index: number) => void;
  onReorderLayer: (fromIndex: number, toIndex: number) => void;
  onRenameLayer: (index: number, newName: string) => void;
  selectedObject: any;
  onUpdateObject: (key: string, value: any) => void;
  settings: any;
  onUpdateSettings: (key: string, value: any) => void;
}

const ToolsPanel: React.FC<ToolsPanelProps> = ({
  activeTab,
  products,
  currentProduct,
  currentProductColor,
  onProductChange,
  onColorChange,
  onAddText,
  onAddImage,
  onAddGraphic,
  isGenerating,
  setIsGenerating,
  layers,
  onDeleteLayer,
  onToggleLock,
  onToggleVisibility,
  onReorderLayer,
  onRenameLayer,
  selectedObject,
  onUpdateObject,
  settings,
  onUpdateSettings
}) => {
  const [aiPrompt, setAiPrompt] = useState('');
  const [designConcepts, setDesignConcepts] = useState<DesignConcept[]>([]);
  const [activeFont, setActiveFont] = useState(FONTS[0]);
  const [isVisible, setIsVisible] = useState(false);

  // Trigger entrance animations when tab changes
  useEffect(() => {
    setIsVisible(false);
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const handleGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    setDesignConcepts([]); // Clear previous
    try {
      const concepts = await generateDesignConcepts(aiPrompt, currentProduct.name);
      setDesignConcepts(concepts);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyDesign = async (concept: DesignConcept) => {
      const printArea = currentProduct.views[0].printArea;
      const centerY = printArea.top + (printArea.height / 2);

      for (const el of concept.elements) {
          const topPosition = centerY + el.yOffset;

          if (el.type === 'text' && el.content) {
              onAddText(el.content, el.fontFamily || activeFont, {
                  fill: el.fill,
                  fontSize: el.fontSize,
                  fontWeight: el.fontWeight,
                  top: topPosition
              });
          } else if (el.type === 'image' && el.query) {
              // Search for the image on Pixabay
              try {
                  let images = await searchPixabayImages(el.query);
                  
                  // Fallback 1: If no exact match, try just the last word (usually the noun)
                  if (images.length === 0 && el.query.includes(' ')) {
                      const simplified = el.query.split(' ').pop();
                      if (simplified) {
                          images = await searchPixabayImages(simplified);
                      }
                  }

                  // Fallback 2: If still nothing, try a generic relevant term or shapes
                  if (images.length === 0) {
                      images = await searchPixabayImages('abstract shapes');
                  }

                  if (images.length > 0) {
                      // Pick a random image from the top 10 to vary designs slightly
                      const randomIndex = Math.floor(Math.random() * Math.min(10, images.length));
                      const image = images[randomIndex];
                      const imageUrl = image.largeImageURL || image.previewURL;

                      onAddImage(imageUrl, {
                          top: topPosition,
                          fill: el.fill // Pass fill intention (handled by app for SVGs or filters)
                      });
                  }
              } catch (error) {
                  console.error("Failed to load AI image element:", error);
              }
          }
      }
  };

  return (
    // Increased width to 340px to fit search + settings but not be too large
    <div className="w-[300px] bg-surface/95 backdrop-blur-xl border-l border-white/5 h-full overflow-y-auto flex flex-col shadow-2xl relative z-10 text-right transition-[width] duration-300">
      {/* Header Section */}
      <div className="p-6 pb-4 border-b border-white/5 bg-gradient-to-b from-surface-hover to-transparent" dir="rtl">
        <h2 className="text-xl font-display font-black text-white tracking-tight flex items-center justify-start gap-2">
          {activeTab === TabType.PRODUCTS && 'انتخاب محصول'}
          {activeTab === TabType.TEXT && 'افزودن متن'}
          {activeTab === TabType.GRAPHICS && 'کتابخانه گرافیک'}
          {activeTab === TabType.UPLOADS && 'آپلود فایل'}
          {activeTab === TabType.AI_STUDIO && 'استودیو هوش مصنوعی'}
          {activeTab === TabType.LAYERS && 'لایه‌ها'}
          {activeTab === TabType.SETTINGS && 'تنظیمات'}
        </h2>
        <p className="text-[11px] font-medium text-slate-400 mt-1 opacity-80 leading-relaxed text-right">
          {activeTab === TabType.PRODUCTS && 'از کاتالوگ ممتاز ما انتخاب کنید'}
          {activeTab === TabType.TEXT && 'تایپوگرافی و شعارهای خلاقانه'}
          {activeTab === TabType.AI_STUDIO && 'طراحی هوشمند با Gemini 2.0'}
          {activeTab === TabType.GRAPHICS && 'مجموعه اشکال و آیکون‌های برداری'}
          {activeTab === TabType.UPLOADS && 'تصاویر خود را بارگذاری کنید'}
          {activeTab === TabType.LAYERS && 'مدیریت لایه‌ها و چیدمان'}
          {activeTab === TabType.SETTINGS && 'پیکربندی و تنظیمات سیستم'}
        </p>
      </div>

      <div className={`flex-1 overflow-y-auto p-4 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        
        {activeTab === TabType.PRODUCTS && (
          <ProductsPanel 
            products={products}
            currentProduct={currentProduct}
            currentProductColor={currentProductColor}
            onProductChange={onProductChange}
            onColorChange={onColorChange}
          />
        )}

        {activeTab === TabType.TEXT && (
          <TextPanel 
            onAddText={onAddText}
            activeFont={activeFont}
            setActiveFont={setActiveFont}
            selectedObject={selectedObject}
            onUpdateObject={onUpdateObject}
          />
        )}

        {activeTab === TabType.GRAPHICS && (
          <GraphicsPanel 
            onAddImage={onAddImage}
            onAddGraphic={onAddGraphic}
            selectedObject={selectedObject}
            onUpdateObject={onUpdateObject}
          />
        )}

        {activeTab === TabType.UPLOADS && (
          <UploadsPanel 
            onAddImage={onAddImage}
            selectedObject={selectedObject}
            onUpdateObject={onUpdateObject}
          />
        )}

        {activeTab === TabType.AI_STUDIO && (
          <AIStudioPanel 
            aiPrompt={aiPrompt}
            setAiPrompt={setAiPrompt}
            isGenerating={isGenerating}
            handleGenerate={handleGenerate}
            designConcepts={designConcepts}
            onApplyDesign={handleApplyDesign}
          />
        )}

        {activeTab === TabType.LAYERS && (
          <LayersPanel 
            layers={layers}
            onDeleteLayer={onDeleteLayer}
            onToggleLock={onToggleLock}
            onToggleVisibility={onToggleVisibility}
            onReorderLayer={onReorderLayer}
            onRenameLayer={onRenameLayer}
          />
        )}

        {activeTab === TabType.SETTINGS && (
          <SettingsPanel 
            settings={settings}
            onUpdateSettings={onUpdateSettings}
          />
        )}

      </div>
    </div>
  );
};

export default ToolsPanel;