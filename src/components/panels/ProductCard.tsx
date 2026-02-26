import React from 'react';
import { Product, ProductColor } from '../../types';
import { Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  isSelected: boolean;
  selectedColorHex?: string;
  onClick: () => void;
  index: number;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isSelected,
  selectedColorHex,
  onClick,
  index
}) => {
  // Use the selected color if this product is selected, otherwise use its default first color
  const displayColor = isSelected && selectedColorHex ? selectedColorHex : (product.colors[0]?.hex || '#3f3f46');

  return (
    <div 
      onClick={onClick}
      style={{ transitionDelay: `${index * 50}ms` }}
      className={`
        group relative cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 ease-out
        ${isSelected 
          ? 'ring-1 ring-primary/50 shadow-[0_0_20px_rgba(59,130,246,0.15)] scale-[1.02] z-10 bg-surface-hover' 
          : 'border border-white/5 hover:border-white/10 hover:bg-surface-hover bg-surface hover:shadow-lg'
        }
      `}
    >
      {/* Selected Badge */}
      <div className={`
        absolute top-3 right-3 z-30 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300
        ${isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}
      `}>
        <Check size={14} strokeWidth={3} />
      </div>

      {/* Image Container with subtle glow background to make dark products visible */}
      <div className="aspect-[4/5] relative overflow-hidden flex items-center justify-center p-4 bg-gradient-to-b from-white/[0.03] to-transparent">
        
        {/* Subtle radial glow behind the product */}
        <div className="absolute inset-0 flex items-center justify-center opacity-70">
           <div className="w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors duration-500"></div>
        </div>

        {/* Thumbnail Rendering */}
        {product.views[0].path ? (
            <div className="w-full h-full relative z-10 transition-transform duration-500 ease-out group-hover:scale-105">
                <svg viewBox={product.views[0].viewBox || "0 0 500 600"} className="w-full h-full drop-shadow-2xl">
                    <path 
                        d={product.views[0].path} 
                        fill={displayColor} 
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="3"
                    />
                </svg>
            </div>
        ) : (
            <img 
              src={product.views[0].imageUrl} 
              alt={product.name}
              className="w-full h-full object-cover relative z-10 transition-transform duration-500 ease-out group-hover:scale-105 drop-shadow-xl"
            />
        )}
        
        {/* Floating Price Tag */}
        <div className="absolute top-3 left-3 bg-background/90 backdrop-blur-md border border-white/10 px-2 py-1 rounded-md text-[11px] font-mono text-zinc-200 z-20 shadow-sm">
          ${product.price}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 border-t border-white/5 bg-background/40 backdrop-blur-sm" dir="rtl">
        <h3 className={`text-sm font-semibold truncate mb-2 transition-colors text-right ${isSelected ? 'text-primary' : 'text-zinc-200 group-hover:text-white'}`}>
            {product.name}
        </h3>
        
        <div className="flex items-center justify-between">
           <div className="flex -space-x-1.5 space-x-reverse">
              {product.colors.slice(0, 4).map(c => (
                <div 
                  key={c.id} 
                  className="w-3.5 h-3.5 rounded-full border-2 border-surface shadow-sm" 
                  style={{ backgroundColor: c.hex }} 
                  title={c.name}
                />
              ))}
              {product.colors.length > 4 && (
                <div className="w-3.5 h-3.5 rounded-full border-2 border-surface bg-surface-hover flex items-center justify-center text-[8px] text-zinc-400 font-bold">
                  +
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
