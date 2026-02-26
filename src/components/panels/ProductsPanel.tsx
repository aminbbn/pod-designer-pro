import React from 'react';
import { Product, ProductColor } from '../../types';
import ProductCard from './ProductCard';

interface ProductsPanelProps {
  products: Product[];
  currentProduct: Product;
  currentProductColor: ProductColor;
  currentProductSize: string;
  onProductChange: (product: Product) => void;
  onColorChange: (color: ProductColor) => void;
  onSizeChange: (size: string) => void;
}

const ProductsPanel: React.FC<ProductsPanelProps> = ({
  products,
  currentProduct,
  currentProductColor,
  currentProductSize,
  onProductChange,
  onColorChange,
  onSizeChange,
}) => {
  return (
    <div className="space-y-8 animate-fade-in pb-10" dir="rtl">
      {/* Product Grid */}
      <div className="grid grid-cols-2 gap-4">
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            isSelected={currentProduct.id === product.id}
            selectedColorHex={currentProduct.id === product.id ? currentProductColor.hex : undefined}
            onClick={() => onProductChange(product)}
            index={index}
          />
        ))}
      </div>

      {/* Colors & Sizes Section */}
      <div className="space-y-8 pt-6 border-t border-white/5">
        
        {/* Colors */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">پالت رنگ</label>
            <span className="text-[10px] font-mono text-primary bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20">{currentProductColor.name}</span>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {currentProduct.colors.map(color => (
              <button
                key={color.id}
                onClick={() => onColorChange(color)}
                className={`
                  group relative w-10 h-10 rounded-full transition-all duration-300 ease-out flex items-center justify-center
                  ${currentProductColor.id === color.id ? 'scale-110' : 'hover:scale-105 opacity-80 hover:opacity-100'}
                `}
              >
                <div className={`absolute inset-0 rounded-full border-2 transition-all duration-300 ${currentProductColor.id === color.id ? 'border-primary/50 opacity-100 scale-110' : 'border-white/10 opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100'}`} />
                <div 
                  className="w-full h-full rounded-full shadow-inner border border-white/10"
                  style={{ backgroundColor: color.hex }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Sizes */}
        {currentProduct.sizes && currentProduct.sizes.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-start">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">سایزهای موجود</label>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {currentProduct.sizes.map(size => (
                <button 
                  key={size} 
                  onClick={() => onSizeChange(size)}
                  className={`px-4 py-2 border transition-all rounded-lg text-xs font-mono shadow-sm ${
                    currentProductSize === size 
                    ? 'bg-primary/20 border-primary text-primary font-bold' 
                    : 'bg-surface border-white/5 hover:border-white/10 hover:bg-surface-hover text-zinc-300'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProductsPanel;
