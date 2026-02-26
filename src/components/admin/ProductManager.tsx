import React, { useState } from 'react';
import { Product, ProductColor, ProductView } from '../../types';
import { Plus, Trash2, Edit2, Save, X, ChevronDown, ChevronUp, Image as ImageIcon, Check, Zap } from 'lucide-react';

interface ProductManagerProps {
  products: Product[];
  onUpdateProducts: (products: Product[]) => void;
}

const ProductManager: React.FC<ProductManagerProps> = ({ products, onUpdateProducts }) => {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleEdit = (product: Product) => {
    setEditingProduct({ ...product });
    setIsCreating(false);
  };

  const handleCreate = () => {
    const newProduct: Product = {
      id: `product-${Date.now()}`,
      name: 'محصول جدید',
      type: 'تی‌شرت',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: [{ id: 'white', name: 'سفید', hex: '#ffffff' }],
      views: [{
        id: 'front',
        name: 'نمای جلو',
        path: '',
        detailPaths: [],
        viewBox: '0 0 500 600',
        printArea: { top: 100, left: 100, width: 200, height: 300 }
      }]
    };
    setEditingProduct(newProduct);
    setIsCreating(true);
  };

  const handleDelete = (productId: string) => {
    if (window.confirm('آیا از حذف این محصول اطمینان دارید؟')) {
      onUpdateProducts(products.filter(p => p.id !== productId));
    }
  };

  const handleSave = () => {
    if (!editingProduct) return;

    if (isCreating) {
      onUpdateProducts([...products, editingProduct]);
    } else {
      onUpdateProducts(products.map(p => p.id === editingProduct.id ? editingProduct : p));
    }
    setEditingProduct(null);
    setIsCreating(false);
  };

  const handleCancel = () => {
    setEditingProduct(null);
    setIsCreating(false);
  };

  if (editingProduct) {
    return (
      <ProductEditor 
        product={editingProduct} 
        onChange={setEditingProduct} 
        onSave={handleSave} 
        onCancel={handleCancel} 
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">مدیریت محصولات</h2>
        <button 
          onClick={handleCreate}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl transition-colors shadow-lg shadow-primary/20"
        >
          <Plus size={18} />
          <span>افزودن محصول جدید</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => (
          <div key={product.id} className="bg-surface/50 backdrop-blur-sm border border-white/5 rounded-2xl p-5 hover:border-primary/30 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-24 h-24 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl flex items-center justify-center text-zinc-400 overflow-hidden relative border border-white/5 shadow-inner group-hover:scale-105 transition-transform duration-500">
                {product.views[0].path ? (
                  <svg viewBox={product.views[0].viewBox || "0 0 500 600"} className="w-full h-full p-2 drop-shadow-lg">
                    <path 
                      d={product.views[0].path} 
                      fill={product.colors[0]?.hex || '#18181b'} 
                      stroke="#52525b"
                      strokeWidth="2"
                    />
                    {product.views[0].detailPaths?.map((d, i) => (
                      <path 
                        key={i} 
                        d={d} 
                        fill="none" 
                        stroke="#52525b" 
                        strokeWidth="1" 
                      />
                    ))}
                  </svg>
                ) : product.views[0].imageUrl ? (
                  <img 
                    src={product.views[0].imageUrl} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon size={32} className="opacity-50" />
                )}
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleEdit(product)}
                  className="p-2 hover:bg-surface-hover rounded-lg text-zinc-400 hover:text-white transition-colors"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(product.id)}
                  className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-white mb-1">{product.name}</h3>
            
            <div className="flex gap-2 mb-4 mt-4">
              {product.colors.map(color => (
                <div 
                  key={color.id} 
                  className="w-4 h-4 rounded-full border border-white/5 shadow-sm"
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>

            <div className="text-xs text-zinc-600 bg-black/20 rounded-lg p-2">
              {product.views.length} نما • {product.colors.length} رنگ
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface ProductEditorProps {
  product: Product;
  onChange: (product: Product) => void;
  onSave: () => void;
  onCancel: () => void;
}

const ProductEditor: React.FC<ProductEditorProps> = ({ product, onChange, onSave, onCancel }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'sizes' | 'colors' | 'views'>('info');

  const updateField = (field: keyof Product, value: any) => {
    onChange({ ...product, [field]: value });
  };

  return (
    <div className="bg-surface/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 animate-slide-up">
      <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">
            {product.id.startsWith('product-') ? 'افزودن محصول جدید' : 'ویرایش محصول'}
          </h2>
          <p className="text-zinc-500 text-sm">اطلاعات محصول را وارد کنید</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onCancel}
            className="px-4 py-2 text-zinc-400 hover:text-white hover:bg-surface-hover rounded-xl transition-colors"
          >
            انصراف
          </button>
          <button 
            onClick={onSave}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-xl transition-colors shadow-lg shadow-primary/20"
          >
            <Save size={18} />
            <span>ذخیره تغییرات</span>
          </button>
        </div>
      </div>

      <div className="flex gap-1 mb-8 bg-black/20 p-1 rounded-xl w-fit">
        {['info', 'sizes', 'colors', 'views'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab 
                ? 'bg-surface text-white shadow-lg' 
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {tab === 'info' && 'اطلاعات پایه'}
            {tab === 'sizes' && 'سایزبندی'}
            {tab === 'colors' && 'رنگ‌بندی'}
            {tab === 'views' && 'نماها و نواحی چاپ'}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">نام محصول</label>
              <input 
                type="text" 
                value={product.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">شناسه محصول</label>
              <input 
                type="text" 
                value={product.id}
                disabled
                className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-zinc-500 cursor-not-allowed"
              />
            </div>
          </div>
        )}

        {activeTab === 'sizes' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
              <label className="text-sm text-zinc-400 mb-4 block">سایزهای موجود</label>
              <div className="flex flex-wrap gap-3 mb-6">
                {product.sizes.map((size, index) => (
                  <div key={index} className="flex items-center gap-2 bg-surface px-3 py-1.5 rounded-lg border border-white/5">
                    <span className="text-white font-mono">{size}</span>
                    <button 
                      onClick={() => {
                        const newSizes = product.sizes.filter((_, i) => i !== index);
                        updateField('sizes', newSizes);
                      }}
                      className="text-zinc-500 hover:text-red-400 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="افزودن سایز جدید (مثلاً XXL)"
                  className="flex-1 bg-surface border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = (e.target as HTMLInputElement).value.trim();
                      if (val && !product.sizes.includes(val)) {
                        updateField('sizes', [...product.sizes, val]);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                />
                <button 
                  className="bg-primary hover:bg-primary/90 text-white px-6 rounded-xl transition-colors"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    const val = input.value.trim();
                    if (val && !product.sizes.includes(val)) {
                      updateField('sizes', [...product.sizes, val]);
                      input.value = '';
                    }
                  }}
                >
                  <Plus size={20} />
                </button>
              </div>
              <p className="text-xs text-zinc-500 mt-2">برای افزودن دکمه Enter را بزنید.</p>
            </div>
          </div>
        )}

        {activeTab === 'colors' && (
          <div className="space-y-4 animate-fade-in">
            {product.colors.map((color, index) => (
              <div key={index} className="flex gap-4 items-end bg-black/20 p-4 rounded-xl border border-white/5">
                <div className="flex-1 space-y-2">
                  <label className="text-xs text-zinc-500">نام رنگ</label>
                  <input 
                    type="text" 
                    value={color.name}
                    onChange={(e) => {
                      const newColors = [...product.colors];
                      newColors[index].name = e.target.value;
                      updateField('colors', newColors);
                    }}
                    className="w-full bg-surface border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <label className="text-xs text-zinc-500">کد رنگ (Hex)</label>
                  <div className="flex gap-2">
                    <input 
                      type="color" 
                      value={color.hex}
                      onChange={(e) => {
                        const newColors = [...product.colors];
                        newColors[index].hex = e.target.value;
                        updateField('colors', newColors);
                      }}
                      className="h-10 w-10 rounded-lg cursor-pointer bg-transparent border-none"
                    />
                    <input 
                      type="text" 
                      value={color.hex}
                      onChange={(e) => {
                        const newColors = [...product.colors];
                        newColors[index].hex = e.target.value;
                        updateField('colors', newColors);
                      }}
                      className="flex-1 bg-surface border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                    />
                  </div>
                </div>
                <button 
                  onClick={() => {
                    const newColors = product.colors.filter((_, i) => i !== index);
                    updateField('colors', newColors);
                  }}
                  className="p-2.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors mb-[1px]"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            <button 
              onClick={() => updateField('colors', [...product.colors, { id: `color-${Date.now()}`, name: 'رنگ جدید', hex: '#000000' }])}
              className="w-full py-3 border border-dashed border-white/5 rounded-xl text-zinc-400 hover:text-white hover:border-white/5 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              <span>افزودن رنگ جدید</span>
            </button>
          </div>
        )}

        {activeTab === 'views' && (
          <div className="space-y-6 animate-fade-in">
            {product.views.map((view, index) => (
              <div key={index} className="bg-black/20 p-6 rounded-2xl border border-white/5">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-white">نمای {index + 1}</h4>
                  <button 
                    onClick={() => {
                      const newViews = product.views.filter((_, i) => i !== index);
                      updateField('views', newViews);
                    }}
                    className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
                  >
                    <Trash2 size={14} />
                    حذف نما
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-500">نام نما</label>
                    <input 
                      type="text" 
                      value={view.name}
                      onChange={(e) => {
                        const newViews = [...product.views];
                        newViews[index].name = e.target.value;
                        updateField('views', newViews);
                      }}
                      className="w-full bg-surface border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-500">ViewBox</label>
                    <input 
                      type="text" 
                      value={view.viewBox}
                      onChange={(e) => {
                        const newViews = [...product.views];
                        newViews[index].viewBox = e.target.value;
                        updateField('views', newViews);
                      }}
                      className="w-full bg-surface border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <label className="text-xs text-zinc-500">مسیر SVG (Path Data)</label>
                  <textarea 
                    value={view.path}
                    onChange={(e) => {
                      const newViews = [...product.views];
                      newViews[index].path = e.target.value;
                      updateField('views', newViews);
                    }}
                    className="w-full bg-surface border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50 font-mono h-24"
                    placeholder="M 0 0 L 100 100 ..."
                  />
                </div>

                <div className="space-y-2 mb-6">
                  <label className="text-xs text-zinc-500">مسیرهای جزئیات (Detail Paths - هر خط یک مسیر)</label>
                  <textarea 
                    value={view.detailPaths?.join('\n') || ''}
                    onChange={(e) => {
                      const newViews = [...product.views];
                      newViews[index].detailPaths = e.target.value.split('\n').filter(p => p.trim());
                      updateField('views', newViews);
                    }}
                    className="w-full bg-surface border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50 font-mono h-24"
                    placeholder="M ... (Collar)&#10;M ... (Pocket)"
                  />
                </div>

                <div className="bg-surface/50 p-4 rounded-xl border border-white/5">
                  <h5 className="text-sm font-bold text-zinc-300 mb-4 flex items-center gap-2">
                    <Zap size={14} className="text-yellow-400" />
                    ناحیه چاپ (Safe Zone)
                  </h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['top', 'left', 'width', 'height'].map((dim) => (
                      <div key={dim} className="space-y-1">
                        <label className="text-[10px] text-zinc-500 uppercase">{dim}</label>
                        <input 
                          type="number" 
                          value={view.printArea[dim as keyof typeof view.printArea]}
                          onChange={(e) => {
                            const newViews = [...product.views];
                            newViews[index].printArea = {
                              ...newViews[index].printArea,
                              [dim]: Number(e.target.value)
                            };
                            updateField('views', newViews);
                          }}
                          className="w-full bg-black/20 border border-white/5 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-primary/50 text-center"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            <button 
              onClick={() => updateField('views', [...product.views, { 
                id: `view-${Date.now()}`, 
                name: 'نمای جدید', 
                path: '', 
                detailPaths: [], 
                viewBox: '0 0 500 600', 
                printArea: { top: 100, left: 100, width: 200, height: 300 } 
              }])}
              className="w-full py-3 border border-dashed border-white/5 rounded-xl text-zinc-400 hover:text-white hover:border-white/5 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              <span>افزودن نمای جدید</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductManager;
