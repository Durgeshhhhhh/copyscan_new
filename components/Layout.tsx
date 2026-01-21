
import React from 'react';
import { UserProfile, AppView } from '../types';
import { auth } from '../firebase';
import { Button } from './UI';
import { useLoading } from './LoadingContext';

interface LayoutProps {
  children: React.ReactNode;
  user: UserProfile | null;
  currentView: AppView;
  onViewChange: (view: AppView) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, currentView, onViewChange }) => {
  const { isLoading } = useLoading();

  const handleLogout = () => {
    auth.signOut();
  };

  const navItems = [
    { id: 'HOME', label: 'Home', icon: 'fa-house' },
    { id: 'SCANNER', label: 'Scanner', icon: 'fa-search' },
    { id: 'COMPARISON', label: 'Compare', icon: 'fa-columns' },
    { id: 'VAULT', label: 'Vault', icon: 'fa-folder-open' },
    { id: 'HISTORY', label: 'History', icon: 'fa-clock-rotate-left' },
    { id: 'PROFILE', label: 'Account', icon: 'fa-user-circle' },
  ];

  if (user?.role === 'admin') {
    navItems.push({ id: 'ADMIN', label: 'Admin', icon: 'fa-user-shield' });
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 relative font-sans">
      <div className={`fixed top-0 left-0 right-0 h-1 z-[100] transition-all duration-300 pointer-events-none ${isLoading ? 'opacity-100' : 'opacity-0'}`}>
        <div className="h-full bg-gradient-to-r from-indigo-600 via-cyan-400 to-indigo-600 animate-[loading_1.5s_infinite_linear]" style={{ width: '30%', backgroundSize: '200% 100%' }}></div>
      </div>
      
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); width: 30%; }
          50% { width: 60%; }
          100% { transform: translateX(400%); width: 30%; }
        }
      `}</style>

      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-3 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => onViewChange('HOME')}>
            <div className="bg-gradient-to-tr from-indigo-600 to-cyan-500 p-1.5 rounded-lg text-white shadow-lg shadow-indigo-500/20">
              <i className="fas fa-shield-halved text-sm"></i>
            </div>
            <h1 className="text-lg font-black text-slate-900 tracking-tighter">CopyScan</h1>
          </div>
          
          {user && (
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <button 
                  key={item.id}
                  onClick={() => onViewChange(item.id as AppView)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${currentView === item.id ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'text-slate-400 hover:text-slate-900 hover:bg-indigo-50/50'}`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          )}
        </div>
        
        {user && (
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => onViewChange('PROFILE')}
              className="flex items-center space-x-2"
            >
              <img 
                src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || user.email}&background=4f46e5&color=fff`} 
                alt="Profile" 
                className="w-7 h-7 rounded-full ring-2 ring-indigo-100"
              />
              <span className="text-[10px] font-black uppercase text-slate-500 hidden sm:inline-block">
                {user.displayName?.split(' ')[0] || 'User'}
              </span>
            </button>
            <div className="h-4 w-px bg-slate-100"></div>
            <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition-colors">
              <i className="fas fa-power-off text-xs"></i>
            </button>
          </div>
        )}
      </header>

      <main className={`flex-1 overflow-y-auto p-4 md:p-8 transition-opacity duration-300 ${isLoading ? 'opacity-70' : 'opacity-100'}`}>
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>

      <footer className="bg-white border-t border-slate-100 px-6 py-4 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
          © {new Date().getFullYear()} Requin Solutions Pvt Ltd
        </p>
      </footer>
    </div>
  );
};
