import React, { useState } from 'react';
import { User, Lock, ArrowRight, ShieldCheck, ArrowLeft, AlertTriangle } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: () => void;
  onClose: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Mock authentication
    setTimeout(() => {
      if (username === 'admin' && password === 'admin') {
        onLoginSuccess();
      } else {
        setError('نام کاربری یا رمز عبور اشتباه است');
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background animate-fade-in overflow-hidden" dir="rtl">
      
      {/* Background Elements */}
      <div className="absolute top-10 -left-10 w-96 h-96 bg-primary rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-blob" />
      <div className="absolute top-0 -right-10 w-96 h-96 bg-secondary rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-blob" style={{ animationDelay: '2s' }} />
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-blob" style={{ animationDelay: '4s' }} />
      
      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background pointer-events-none" />

      {/* Back Button */}
      <button 
        onClick={onClose}
        className="absolute top-8 right-8 flex items-center gap-3 text-zinc-400 hover:text-white transition-all bg-surface/80 hover:bg-surface backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/5 shadow-lg group z-50"
      >
        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        <span className="font-medium">بازگشت به ویرایشگر</span>
      </button>

      <div className="w-full max-w-[480px] p-10 rounded-[2.5rem] bg-surface/80 backdrop-blur-2xl border border-white/5 shadow-2xl relative z-10 animate-slide-up">
        
        {/* Top Accent Line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-gradient-to-r from-primary to-accent rounded-b-full" />

        {/* Header */}
        <div className="text-center mb-10 mt-4">
          <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-accent/10 rounded-3xl mx-auto flex items-center justify-center mb-6 border border-primary/20 shadow-inner relative group">
            <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <ShieldCheck size={48} className="text-primary relative z-10 group-hover:scale-110 transition-transform duration-500" />
          </div>
          <h2 className="text-4xl font-black text-white mb-3 font-display tracking-tight">ورود مدیریت</h2>
          <p className="text-zinc-400 text-sm">جهت دسترسی به تنظیمات پلتفرم وارد شوید</p>
        </div>

        {/* User Warning Notice */}
        <div className="mb-8 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex gap-4 items-start animate-fade-in" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
          <div className="p-2 bg-red-500/20 rounded-xl text-red-500 shrink-0">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h4 className="text-red-500 font-bold text-sm mb-1">توجه: دسترسی غیرمجاز</h4>
            <p className="text-red-500/80 text-xs leading-relaxed">
              این صفحه صرفاً جهت ورود مدیر سایت برای مدیریت محصولات و آمار بازدید است. کاربران عادی به هیچ وجه نباید وارد این بخش شوند. این پلتفرم برای فروش نیست و فقط ابزاری برای طراحی است.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          
          <div className="space-y-2.5">
            <label className="text-sm font-semibold text-zinc-300 mr-1">نام کاربری</label>
            <div className="relative group">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <User size={20} className="text-zinc-500 group-focus-within:text-primary transition-colors" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-background/50 border border-white/5 rounded-2xl py-4 pr-12 pl-4 text-white placeholder-zinc-600 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all font-sans"
                placeholder="نام کاربری ادمین"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="text-sm font-semibold text-zinc-300 mr-1">رمز عبور</label>
            <div className="relative group">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <Lock size={20} className="text-zinc-500 group-focus-within:text-primary transition-colors" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-background/50 border border-white/5 rounded-2xl py-4 pr-12 pl-4 text-white placeholder-zinc-600 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all font-sans"
                placeholder="رمز عبور ادمین"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-sm font-medium text-center bg-red-500/10 py-3 rounded-xl border border-red-500/20 animate-fade-in">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-2xl shadow-[0_0_40px_-10px_rgba(59,130,246,0.5)] transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group mt-8"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white/5 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span className="text-lg">ورود به پنل مدیریت</span>
                <ArrowLeft size={20} className="group-hover:-translate-x-1.5 transition-transform" />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};

export default LoginPage;
