import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Settings, 
  LogOut, 
  TrendingUp, 
  Activity,
  ArrowRight,
  Plus,
  Edit2,
  Trash2,
  Download,
  Clock,
  Image as ImageIcon,
  BarChart3,
  Globe,
  Shield,
  Bell,
  Palette,
  Layers,
  FileImage,
  Save,
  CheckCircle2
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Product, ProductColor } from '../../types';
import { GARMENT_TYPES } from '../../constants';

interface AdminDashboardProps {
  onLogout: () => void;
  onBackToEditor: () => void;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

const chartData = [
  { name: 'شنبه', views: 120, designs: 40 },
  { name: 'یکشنبه', views: 150, designs: 30 },
  { name: 'دوشنبه', views: 200, designs: 20 },
  { name: 'سه‌شنبه', views: 180, designs: 27 },
  { name: 'چهارشنبه', views: 250, designs: 18 },
  { name: 'پنجشنبه', views: 300, designs: 23 },
  { name: 'جمعه', views: 350, designs: 34 },
];

const pieData = [
  { name: 'تی‌شرت', value: 400 },
  { name: 'هودی', value: 300 },
  { name: 'ماگ', value: 300 },
  { name: 'قاب گوشی', value: 200 },
];
const COLORS = ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, onBackToEditor, products, setProducts }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'reports' | 'settings'>('dashboard');
  const [showSaveToast, setShowSaveToast] = useState(false);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: GARMENT_TYPES[0].id,
    sizes: ['M', 'L', 'XL'],
    colors: [] as ProductColor[]
  });

  const AVAILABLE_COLORS: ProductColor[] = [
    { id: 'black', name: 'مشکی', hex: '#18181b' },
    { id: 'white', name: 'سفید', hex: '#ffffff' },
    { id: 'navy', name: 'سرمه‌ای', hex: '#172554' },
    { id: 'heather', name: 'طوسی', hex: '#52525b' },
    { id: 'red', name: 'قرمز', hex: '#b91c1c' },
    { id: 'yellow', name: 'زرد', hex: '#a16207' },
    { id: 'maroon', name: 'زرشکی', hex: '#450a0a' },
    { id: 'forest', name: 'سبز جنگلی', hex: '#022c22' },
    { id: 'blue', name: 'آبی', hex: '#3B82F6' },
    { id: 'green', name: 'سبز', hex: '#10b981' },
  ];

  const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      // Find the corresponding garment type ID
      const garmentType = GARMENT_TYPES.find(g => g.name === product.type)?.id || GARMENT_TYPES[0].id;
      setFormData({
        name: product.name,
        type: garmentType,
        sizes: [...product.sizes],
        colors: [...product.colors]
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        type: GARMENT_TYPES[0].id,
        sizes: ['M', 'L', 'XL'],
        colors: [AVAILABLE_COLORS[0], AVAILABLE_COLORS[1]]
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSaveProduct = () => {
    if (!formData.name.trim() || formData.colors.length === 0 || formData.sizes.length === 0) {
      alert('لطفاً نام، حداقل یک سایز و حداقل یک رنگ را انتخاب کنید.');
      return;
    }

    const selectedGarment = GARMENT_TYPES.find(g => g.id === formData.type);
    if (!selectedGarment) return;

    const newProduct: Product = {
      id: editingProduct ? editingProduct.id : `product-${Date.now()}`,
      name: formData.name,
      type: selectedGarment.name,
      sizes: formData.sizes,
      colors: formData.colors,
      views: [
        {
          id: 'front',
          name: 'نمای جلو',
          path: selectedGarment.path,
          detailPaths: selectedGarment.details,
          viewBox: "0 0 500 600",
          printArea: { top: 150, left: 145, width: 210, height: 280 } // Default print area, could be customized per garment
        },
        {
          id: 'back',
          name: 'نمای پشت',
          path: selectedGarment.path,
          detailPaths: selectedGarment.details,
          viewBox: "0 0 500 600",
          printArea: { top: 150, left: 145, width: 210, height: 280 }
        }
      ]
    };

    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? newProduct : p));
    } else {
      setProducts([...products, newProduct]);
    }
    
    handleCloseModal();
    handleSaveSettings(); // Show success toast
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm('آیا از حذف این محصول اطمینان دارید؟')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const toggleSize = (size: string) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size) 
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }));
  };

  const toggleColor = (color: ProductColor) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.find(c => c.id === color.id)
        ? prev.colors.filter(c => c.id !== color.id)
        : [...prev.colors, color]
    }));
  };

  const handleSaveSettings = () => {
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 3000);
  };

  return (
    <div className="flex h-screen bg-background text-white font-sans overflow-hidden" dir="rtl">
      
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-l border-white/5 flex flex-col z-20">
        <div className="p-6 border-b border-white/5">
          <h1 className="text-2xl font-bold font-display bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            پنل ادمین
          </h1>
          <p className="text-xs text-zinc-500 mt-1">مدیریت پلتفرم طراحی</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavItem icon={LayoutDashboard} label="داشبورد" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavItem icon={ShoppingBag} label="محصولات پایه" active={activeTab === 'products'} onClick={() => setActiveTab('products')} />
          <NavItem icon={BarChart3} label="گزارش‌ها" active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />
          <NavItem icon={Settings} label="تنظیمات" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2">
          <button 
            onClick={onBackToEditor}
            className="w-full flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-white hover:bg-surface-hover rounded-xl transition-all"
          >
            <ArrowRight size={20} />
            <span>بازگشت به ویرایشگر</span>
          </button>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
          >
            <LogOut size={20} />
            <span>خروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 relative">
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

        <header className="flex justify-between items-center mb-8 relative z-10 animate-fade-in">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">خوش آمدید، ادمین 👋</h2>
            <p className="text-zinc-400">گزارش عملکرد امروز پلتفرم طراحی شما</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20 border border-white/5">
              A
            </div>
          </div>
        </header>

        <div className="relative z-10">
          {activeTab === 'dashboard' && (
            <div className="animate-slide-up space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard 
                  title="بازدید کل" 
                  value="۱,۵۵۰" 
                  trend="+۲۴٪" 
                  icon={Activity} 
                />
                <StatCard 
                  title="کاربران فعال (طراحان)" 
                  value="۳۴۲" 
                  trend="+۱۲٪" 
                  icon={Globe} 
                />
                <StatCard 
                  title="طرح‌های ایجاد شده" 
                  value="۱,۲۸۴" 
                  trend="+۱۸٪" 
                  icon={ImageIcon} 
                />
                <StatCard 
                  title="میانگین زمان طراحی" 
                  value="۱۴ دقیقه" 
                  trend="+۲٪" 
                  icon={Clock} 
                />
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-surface border border-white/5 rounded-3xl p-6 shadow-xl animate-fade-in" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
                  <h3 className="text-lg font-bold text-white mb-6">روند ایجاد طرح‌ها</h3>
                  <div className="h-72 w-full" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorDesigns" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis dataKey="name" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#18181b', borderColor: '#ffffff10', borderRadius: '12px', color: '#fff' }}
                          itemStyle={{ color: '#fff' }}
                        />
                        <Area type="monotone" dataKey="designs" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorDesigns)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-surface border border-white/5 rounded-3xl p-6 shadow-xl animate-fade-in" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
                  <h3 className="text-lg font-bold text-white mb-6">بازدید روزانه</h3>
                  <div className="h-72 w-full" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis dataKey="name" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#18181b', borderColor: '#ffffff10', borderRadius: '12px', color: '#fff' }}
                          cursor={{ fill: '#ffffff05' }}
                        />
                        <Bar dataKey="views" fill="#60A5FA" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Recent Activity Placeholder */}
              <div className="bg-surface border border-white/5 rounded-3xl p-6 shadow-xl animate-fade-in" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Activity size={20} className="text-primary" />
                  فعالیت‌های اخیر کاربران
                </h3>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-background rounded-2xl border border-white/5 transition-colors hover:border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-zinc-400 border border-white/5">
                          <ImageIcon size={18} />
                        </div>
                        <div>
                          <p className="text-white font-medium">طراحی جدید روی {products[0]?.name || 'محصول'}</p>
                          <p className="text-zinc-500 text-xs">توسط کاربر ناشناس • {i*2} دقیقه پیش</p>
                        </div>
                      </div>
                      <span className="text-primary text-sm font-medium bg-primary/10 px-3 py-1 rounded-lg border border-primary/20">خروجی گرفته شد</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="animate-slide-up space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-white">مدیریت محصولات پایه</h3>
                <button 
                  onClick={() => handleOpenModal()}
                  className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors shadow-lg shadow-primary/20"
                >
                  <Plus size={18} />
                  افزودن محصول جدید
                </button>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {products.map((product, index) => (
                  <div key={product.id} className="bg-surface border border-white/5 rounded-3xl p-6 flex flex-col md:flex-row gap-6 items-center shadow-xl hover:border-white/5 transition-colors animate-fade-in" style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}>
                    <div className="w-32 h-32 bg-background rounded-2xl flex items-center justify-center p-4 border border-white/5 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      {product.views[0]?.path ? (
                        <svg viewBox={product.views[0].viewBox || "0 0 500 600"} className="w-full h-full text-zinc-600 relative z-10">
                          <path d={product.views[0].path} fill="currentColor" />
                        </svg>
                      ) : (
                        <ShoppingBag size={40} className="text-zinc-600 relative z-10" />
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-4 w-full">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xl font-bold text-white">{product.name}</h4>
                          <p className="text-zinc-400 text-sm mt-1">نوع: {product.type}</p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleOpenModal(product)}
                            className="p-2 bg-background hover:bg-surface-hover text-zinc-300 rounded-xl border border-white/5 transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/10 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-background p-4 rounded-2xl border border-white/5">
                          <p className="text-xs text-zinc-500 mb-2">رنگ‌های موجود</p>
                          <div className="flex gap-1.5 flex-wrap">
                            {product.colors.map(c => (
                              <div key={c.id} className="w-5 h-5 rounded-full border border-white/5 shadow-sm" style={{ backgroundColor: c.hex }} title={c.name} />
                            ))}
                          </div>
                        </div>
                        <div className="bg-background p-4 rounded-2xl border border-white/5">
                          <p className="text-xs text-zinc-500 mb-1">سایزها</p>
                          <p className="text-sm text-white font-medium">{product.sizes?.join(', ') || 'نامشخص'}</p>
                        </div>
                        <div className="bg-background p-4 rounded-2xl border border-white/5">
                          <p className="text-xs text-zinc-500 mb-1">تعداد نماها</p>
                          <p className="text-sm text-white font-medium">{product.views.length} نما</p>
                        </div>
                        <div className="bg-background p-4 rounded-2xl border border-white/5">
                          <p className="text-xs text-zinc-500 mb-1">ابعاد ناحیه چاپ (جلو)</p>
                          <p className="text-sm text-white font-medium" dir="ltr">
                            {product.views[0]?.printArea.width}x{product.views[0]?.printArea.height}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="animate-slide-up space-y-6">
              <h3 className="text-2xl font-bold text-white mb-6">گزارش‌های سیستم</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-surface border border-white/5 rounded-3xl p-6 shadow-xl animate-fade-in" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                      <Palette size={24} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">محبوب‌ترین رنگ‌ها</h4>
                      <p className="text-xs text-zinc-400">بر اساس طرح‌های ایجاد شده</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { name: 'مشکی', percent: 45, color: '#000000' },
                      { name: 'سفید', percent: 30, color: '#ffffff' },
                      { name: 'سرمه‌ای', percent: 15, color: '#1e3a8a' },
                      { name: 'قرمز', percent: 10, color: '#ef4444' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full border border-white/5" style={{ backgroundColor: item.color }} />
                        <span className="text-sm text-zinc-300 flex-1">{item.name}</span>
                        <span className="text-sm font-medium text-white">{item.percent}٪</span>
                        <div className="w-24 h-2 bg-background rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${item.percent}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-surface border border-white/5 rounded-3xl p-6 shadow-xl animate-fade-in" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-secondary/10 rounded-2xl text-secondary">
                      <Layers size={24} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">توزیع محصولات</h4>
                      <p className="text-xs text-zinc-400">محصولات انتخاب شده برای طراحی</p>
                    </div>
                  </div>
                  <div className="h-48 w-full" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#18181b', borderColor: '#ffffff10', borderRadius: '12px', color: '#fff' }}
                          itemStyle={{ color: '#fff' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-4 flex-wrap mt-2">
                    {pieData.map((entry, index) => (
                      <div key={index} className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="text-xs text-zinc-400">{entry.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-surface border border-white/5 rounded-3xl p-6 shadow-xl animate-fade-in" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-accent/10 rounded-2xl text-accent">
                      <FileImage size={24} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">منابع تصاویر</h4>
                      <p className="text-xs text-zinc-400">نحوه اضافه شدن تصاویر به طرح</p>
                    </div>
                  </div>
                  <div className="space-y-4 mt-6">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-zinc-300">آپلود از دستگاه</span>
                        <span className="text-white font-medium">۶۵٪</span>
                      </div>
                      <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full" style={{ width: '65%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-zinc-300">جستجوی هوش مصنوعی</span>
                        <span className="text-white font-medium">۲۵٪</span>
                      </div>
                      <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full opacity-70" style={{ width: '25%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-zinc-300">گالری پیش‌فرض</span>
                        <span className="text-white font-medium">۱۰٪</span>
                      </div>
                      <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full opacity-40" style={{ width: '10%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="animate-slide-up space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">تنظیمات پلتفرم</h3>
                <button 
                  onClick={handleSaveSettings}
                  className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-primary/20 transform hover:scale-105 active:scale-95"
                >
                  <Save size={18} />
                  ذخیره تغییرات
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-surface border border-white/5 rounded-3xl p-6 shadow-xl space-y-6 animate-fade-in" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
                  <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                    <div className="p-2 bg-primary/10 rounded-xl text-primary">
                      <Globe size={20} />
                    </div>
                    <h4 className="text-lg font-bold text-white">تنظیمات عمومی</h4>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between group">
                      <div>
                        <p className="text-white font-medium group-hover:text-primary transition-colors">حالت تعمیرات</p>
                        <p className="text-xs text-zinc-500">غیرفعال کردن موقت دسترسی کاربران به ویرایشگر</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-background peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-zinc-400 peer-checked:after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary border border-white/5"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between group">
                      <div>
                        <p className="text-white font-medium group-hover:text-primary transition-colors">واترمارک روی خروجی</p>
                        <p className="text-xs text-zinc-500">افزودن لوگو به تصاویر دانلود شده توسط کاربران</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-background peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-zinc-400 peer-checked:after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary border border-white/5"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between group">
                      <div>
                        <p className="text-white font-medium group-hover:text-primary transition-colors">ذخیره خودکار طرح‌ها</p>
                        <p className="text-xs text-zinc-500">ذخیره وضعیت ویرایشگر در مرورگر کاربر</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-background peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-zinc-400 peer-checked:after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary border border-white/5"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-surface border border-white/5 rounded-3xl p-6 shadow-xl space-y-6 animate-fade-in" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
                  <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                    <div className="p-2 bg-primary/10 rounded-xl text-primary">
                      <Shield size={20} />
                    </div>
                    <h4 className="text-lg font-bold text-white">امنیت و دسترسی</h4>
                  </div>
                  
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-300">تغییر رمز عبور ادمین</label>
                      <input type="password" placeholder="رمز عبور فعلی" className="w-full bg-background border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all" />
                      <input type="password" placeholder="رمز عبور جدید" className="w-full bg-background border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all mt-2" />
                    </div>
                    <button className="w-full bg-surface-hover hover:bg-surface-hover text-white py-3 rounded-xl border border-white/5 transition-colors font-medium">
                      بروزرسانی رمز عبور
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Toast Notification */}
        {showSaveToast && (
          <div className="fixed bottom-8 left-8 bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center gap-3 animate-slide-up z-50">
            <CheckCircle2 size={20} />
            <span className="font-medium">تنظیمات با موفقیت ذخیره شد</span>
          </div>
        )}

        {/* Add/Edit Product Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in p-4">
            <div className="bg-surface border border-white/5 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-surface-hover">
                <h3 className="text-xl font-bold text-white">
                  {editingProduct ? 'ویرایش محصول' : 'افزودن محصول جدید'}
                </h3>
                <button onClick={handleCloseModal} className="text-zinc-400 hover:text-white transition-colors">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">نام محصول</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="مثال: تی‌شرت یقه گرد مردانه"
                    className="w-full bg-background border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">نوع لباس (قالب)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {GARMENT_TYPES.map(garment => (
                      <button
                        key={garment.id}
                        onClick={() => setFormData({...formData, type: garment.id})}
                        className={`
                          p-3 rounded-xl border flex flex-col items-center gap-2 transition-all
                          ${formData.type === garment.id 
                            ? 'bg-primary/10 border-primary text-primary' 
                            : 'bg-background border-white/5 text-zinc-400 hover:border-white/5 hover:text-white'}
                        `}
                      >
                        <svg viewBox="0 0 500 600" className="w-12 h-12">
                          <path d={garment.path} fill="currentColor" />
                        </svg>
                        <span className="text-sm font-medium">{garment.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">سایزهای موجود</label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_SIZES.map(size => (
                      <button
                        key={size}
                        onClick={() => toggleSize(size)}
                        className={`
                          px-4 py-2 rounded-lg border text-sm font-medium transition-all
                          ${formData.sizes.includes(size)
                            ? 'bg-primary text-white border-primary'
                            : 'bg-background text-zinc-400 border-white/5 hover:border-white/5 hover:text-white'}
                        `}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">رنگ‌های موجود</label>
                  <div className="flex flex-wrap gap-3 p-4 bg-background rounded-xl border border-white/5">
                    {AVAILABLE_COLORS.map(color => {
                      const isSelected = formData.colors.some(c => c.id === color.id);
                      return (
                        <button
                          key={color.id}
                          onClick={() => toggleColor(color)}
                          className={`
                            w-10 h-10 rounded-full border-2 transition-all relative flex items-center justify-center
                            ${isSelected ? 'border-primary scale-110 shadow-lg shadow-primary/20' : 'border-white/5 hover:scale-105 hover:border-white/5'}
                          `}
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                        >
                          {isSelected && <CheckCircle2 size={16} className={color.hex === '#ffffff' ? 'text-black' : 'text-white'} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-white/5 bg-surface-hover flex justify-end gap-3">
                <button 
                  onClick={handleCloseModal}
                  className="px-6 py-2.5 rounded-xl text-zinc-300 hover:text-white hover:bg-surface-hover transition-colors font-medium"
                >
                  انصراف
                </button>
                <button 
                  onClick={handleSaveProduct}
                  className="bg-primary hover:bg-primary/90 text-white px-8 py-2.5 rounded-xl transition-colors shadow-lg shadow-primary/20 font-medium"
                >
                  ذخیره محصول
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const NavItem = ({ icon: Icon, label, active = false, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`
      w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
      ${active 
        ? 'bg-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/5' 
        : 'text-zinc-400 hover:text-white hover:bg-surface-hover'
      }
    `}
  >
    <Icon size={20} className={active ? 'animate-pulse-slow' : ''} />
    <span className="font-medium">{label}</span>
  </button>
);

const StatCard = ({ title, value, trend, icon: Icon }: any) => {
  return (
    <div className="p-6 rounded-3xl bg-surface border border-white/5 shadow-xl relative overflow-hidden group hover:border-white/5 transition-all duration-500 animate-fade-in">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-500" />
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 rounded-2xl bg-background border border-white/5 text-primary group-hover:scale-110 transition-transform duration-500">
            <Icon size={24} />
          </div>
          <span className="flex items-center gap-1 text-primary text-sm font-medium bg-primary/10 px-2 py-1 rounded-lg border border-primary/20">
            <TrendingUp size={14} />
            {trend}
          </span>
        </div>
        <h3 className="text-zinc-400 text-sm font-medium mb-1">{title}</h3>
        <p className="text-3xl font-bold text-white font-display tracking-tight">{value}</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
