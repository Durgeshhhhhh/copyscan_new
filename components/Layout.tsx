
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

      <footer className="bg-[#080B12] border-t-4 border-violet-600 text-slate-300 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-violet-600/5 rounded-full blur-[140px] -mr-40 -mt-40 pointer-events-none"></div>
        
        <div className="max-w-[1440px] mx-auto relative z-10 px-12 pt-20 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 items-start mb-16">
            
            {/* Column 1: Identity & Legal Disclosure */}
            <div className="space-y-6">
              <div className="flex items-center space-x-4 cursor-default">
                <div className="bg-violet-600 p-2.5 rounded-xl text-white shadow-xl shadow-violet-900/50">
                  <i className="fas fa-shield-halved text-xl"></i>
                </div>
                <span className="text-2xl font-black text-white tracking-tighter font-display uppercase">COPYSCAN</span>
              </div>
              <div className="pt-4 space-y-1.5 border-l-2 border-violet-600/50 pl-5">
                <p className="text-[10px] font-black text-white uppercase tracking-widest">REQUIN SOLUTIONS PVT LTD</p>
                <p className="text-[9px] font-bold text-slate-500 tracking-[0.1em] uppercase">CIN: U72900RJ2021PTC075344</p>
              </div>
            </div>

            {/* Column 2: Service Ecosystem */}
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white flex items-center">
                <span className="w-1 h-3 bg-violet-600 mr-3"></span> Solutions
              </h4>
              <ul className="space-y-3">
                {['Enterprise AI', 'Mobile Engineering', 'Forensic Auditing', 'IP Vaulting'].map((item) => (
                  <li key={item} className="text-[11px] font-black text-slate-500 uppercase tracking-tighter flex items-center hover:text-slate-300 transition-colors cursor-default">
                    <span className="w-1 h-1 bg-violet-600/40 rounded-full mr-3"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Headquarters */}
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white flex items-center">
                <span className="w-1 h-3 bg-violet-600 mr-3"></span> Headquarters
              </h4>
              <p className="text-[11px] font-bold text-slate-500 leading-relaxed uppercase tracking-wider">
                Plot no 6/397, 1st Floor, Sec-6,<br/>
                Malviya Nagar, Jaipur, Rajasthan<br/>
                India - 302017
              </p>
            </div>

            {/* Column 4: Compliance */}
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white flex items-center">
                <span className="w-1 h-3 bg-violet-600 mr-3"></span> Compliance
              </h4>
              <div className="flex flex-wrap gap-2">
                {['SOC2', 'GDPR', 'ISO 27001'].map(tag => (
                  <span key={tag} className="px-2 py-1 bg-slate-900 rounded text-[9px] font-black text-white border border-slate-800 tracking-widest">{tag}</span>
                ))}
              </div>
            </div>

            {/* Column 5: Support */}
            <div className="space-y-6 lg:text-right">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white flex items-center lg:justify-end">
                <span className="w-1 h-3 bg-violet-600 mr-3"></span> Support
              </h4>
              <div className="space-y-2">
                <p className="text-[12px] font-black text-white tracking-tight uppercase">requingroupsolutions@gmail.com</p>
                <div className="flex lg:justify-end items-center space-x-2 pt-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-black uppercase text-green-500 tracking-widest">Nodes Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Highlighted Copyright Bar - Highly Visible Legal Anchor */}
        <div className="bg-[#0A0E17] border-t border-slate-800/50 py-10 px-12">
          <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center space-x-3">
              <i className="fas fa-copyright text-violet-600 text-lg"></i>
              <p className="text-[11px] font-black text-white uppercase tracking-[0.5em]">
                {new Date().getFullYear()} REQUIN SOLUTIONS PVT LTD | ALL RIGHTS RESERVED
              </p>
            </div>
            <div className="flex items-center space-x-10">
              {['Privacy Policy', 'Terms of Service', 'Data SLA'].map(item => (
                <span key={item} className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] cursor-default hover:text-violet-400 transition-colors">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
