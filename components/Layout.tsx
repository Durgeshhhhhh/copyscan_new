
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
    <div className="flex flex-col h-full bg-ivory-50 relative font-sans">
      <div className={`fixed top-0 left-0 right-0 h-1 z-[100] transition-all duration-300 pointer-events-none ${isLoading ? 'opacity-100' : 'opacity-0'}`}>
        <div className="h-full bg-gradient-to-r from-lavender-500 via-lavender-600 to-lavender-500 animate-[loading_1.5s_infinite_linear]" style={{ width: '30%', backgroundSize: '200% 100%' }}></div>
      </div>
      
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); width: 30%; }
          50% { width: 60%; }
          100% { transform: translateX(400%); width: 30%; }
        }
      `}</style>

      <header className="bg-white/95 backdrop-blur-md border-b border-charcoal-100 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => onViewChange('HOME')}>
            <div className="bg-lavender-600 p-2 rounded-xl text-white shadow-md shadow-lavender-500/20 group-hover:shadow-lavender-500/30 transition-all duration-200">
              <i className="fas fa-shield-halved text-sm"></i>
            </div>
            <h1 className="text-lg font-bold text-charcoal-800 tracking-tight">CopyScan</h1>
          </div>
          
          {user && (
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <button 
                  key={item.id}
                  onClick={() => onViewChange(item.id as AppView)}
                  className={`px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${currentView === item.id ? 'bg-lavender-600 text-white shadow-sm shadow-lavender-500/20' : 'text-charcoal-500 hover:text-charcoal-800 hover:bg-charcoal-50'}`}
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
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-200"
            >
              <img 
                src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || user.email}&background=7c3aed&color=fff`} 
                alt="Profile" 
                className="w-8 h-8 rounded-full ring-2 ring-lavender-100 shadow-sm"
              />
              <span className="text-xs font-medium text-charcoal-700 hidden sm:inline-block">
                {user.displayName?.split(' ')[0] || 'User'}
              </span>
            </button>
            <div className="h-5 w-px bg-charcoal-200"></div>
            <button onClick={handleLogout} className="text-charcoal-400 hover:text-red-600 transition-colors duration-200 p-2 hover:bg-red-50 rounded-lg">
              <i className="fas fa-power-off text-sm"></i>
            </button>
          </div>
        )}
      </header>

      <main className={`flex-1 overflow-y-auto p-4 md:p-8 transition-opacity duration-300 ${isLoading ? 'opacity-70' : 'opacity-100'}`}>
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>

      <footer className="bg-white/90 backdrop-blur-sm border-t border-charcoal-100 px-6 py-5 text-center">
        <p className="text-xs font-medium uppercase tracking-wider text-charcoal-500">
          © {new Date().getFullYear()} Requin Solutions Pvt Ltd
        </p>
      </footer>
    </div>
  );
};
