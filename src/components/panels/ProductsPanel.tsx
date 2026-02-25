import React from 'react';
import { Product, ProductColor } from '../../types';
import { Check } from 'lucide-react';

interface ProductsPanelProps {
  products: Product[];
  currentProduct: Product;
  currentProductColor: ProductColor;
  onProductChange: (product: Product) => void;
  onColorChange: (color: ProductColor) => void;
}

const ProductsPanel: React.FC<ProductsPanelProps> = ({
  products,
  currentProduct,
  currentProductColor,
  onProductChange,
  onColorChange,
}) => {
  return (
    <div className="space-y-8 p-6 animate-fade-in">
      {/* Product Grid */}
      <div className="grid grid-cols-2 gap-4">
        {products.map((product, index) => (
          <div 
            key={product.id}
            onClick={() => onProductChange(product)}
            style={{ transitionDelay: `${index * 50}ms` }}
            className={`
              group relative cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 ease-out
              ${currentProduct.id === product.id 
                ? 'ring-1 ring-primary/50 shadow-[0_0_15px_rgba(59,130,246,0.1)] scale-[1.02] z-10 bg-surface-hover' 
                : 'border border-white/5 hover:border-white/10 hover:bg-surface-hover bg-surface'
              }
            `}
          >
            {/* Selected Badge */}
            <div className={`
              absolute top-2 right-2 z-30 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300
              ${currentProduct.id === product.id ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}
            `}>
              <Check size={12} strokeWidth={3} />
            </div>

            {/* Image Container */}
            <div className="aspect-[4/5] relative overflow-hidden flex items-center justify-center p-4">
              
              {/* Thumbnail Rendering */}
              {product.views[0].path ? (
                  <div className="w-full h-full relative z-0 transition-transform duration-500 ease-out group-hover:scale-105">
                      <svg viewBox={product.views[0].viewBox || "0 0 500 600"} className="w-full h-full drop-shadow-md">
                          <path 
                              d={product.views[0].path} 
                              fill={currentProduct.id === product.id ? currentProduct.colors[0].hex : '#18181b'} 
                              stroke="rgba(255,255,255,0.05)"
                              strokeWidth="1.5"
                          />
                      </svg>
                  </div>
              ) : (
                  <img 
                    src={product.views[0].imageUrl} 
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
              )}
              
              {/* Floating Price Tag */}
              <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-md border border-white/5 px-1.5 py-0.5 rounded text-[10px] font-mono text-zinc-300 z-20">
                ${product.price}
              </div>
            </div>

            {/* Product Info */}
            <div className="p-3 border-t border-white/5 bg-background/50">
              <h3 className={`text-xs font-semibold truncate mb-1.5 transition-colors ${currentProduct.id === product.id ? 'text-primary' : 'text-zinc-300 group-hover:text-white'}`}>
                  {product.name}
              </h3>
              
              <div className="flex items-center justify-between">
                 <div className="flex -space-x-1 space-x-reverse">
                    {product.colors.slice(0, 3).map(c => (
                      <div key={c.id} className="w-2.5 h-2.5 rounded-full border border-background" style={{ backgroundColor: c.hex }} />
                    ))}
                 </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Colors & Sizes Section */}
      <div className="space-y-6 pt-6 border-t border-white/5">
        
        {/* Colors */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10">{currentProductColor.name}</span>
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">پالت رنگ</label>
          </div>
          
          <div className="flex flex-wrap justify-end gap-3">
            {currentProduct.colors.map(color => (
              <button
                key={color.id}
                onClick={() => onColorChange(color)}
                className={`
                  group relative w-8 h-8 rounded-full transition-all duration-300 ease-out flex items-center justify-center
                  ${currentProductColor.id === color.id ? 'scale-110' : 'hover:scale-105 opacity-80 hover:opacity-100'}
                `}
              >
                <div className={`absolute inset-0 rounded-full border-2 transition-all duration-300 ${currentProductColor.id === color.id ? 'border-primary/50 opacity-100 scale-125' : 'border-white/5 opacity-0 scale-100 group-hover:opacity-100 group-hover:scale-110'}`} />
                <div 
                  className="w-full h-full rounded-full shadow-inner border border-white/5"
                  style={{ backgroundColor: color.hex }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Sizes */}
        {currentProduct.sizes && currentProduct.sizes.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-end">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">سایزهای موجود</label>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              {currentProduct.sizes.map(size => (
                <div key={size} className="px-3 py-1 bg-surface border border-white/5 rounded text-[10px] font-mono text-zinc-400">
                  {size}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProductsPanel;
