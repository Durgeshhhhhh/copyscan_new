
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

<footer className="bg-[#0B0F1A] border-t-4 border-violet-500 text-slate-300 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-violet-500/5 rounded-full blur-[140px] -mr-40 -mt-40 pointer-events-none"></div>

      <div className="max-w-[1440px] mx-auto relative z-10 px-6 md:px-12 pt-12 pb-8">
        
        {/* Logo Section - Separate */}
        <div className="mb-8 pb-6 border-b border-slate-700/50">
          <div className="flex items-center space-x-3 cursor-default">
            <div className="bg-violet-500 p-2.5 rounded-xl text-white shadow-lg shadow-violet-900/30 flex-shrink-0">
              <i className="fas fa-shield-halved text-2xl"></i>
            </div>
            <span className="text-[32px] font-bold text-white tracking-tight font-sans">
              COPYSCAN
            </span>
          </div>

          <div className="pt-4 space-y-1 border-l-2 border-violet-500/40 pl-5 ml-2">
            <p className="text-[15px] font-semibold text-slate-200 tracking-tight font-sans">
              Requin Solutions Pvt Ltd
            </p>

            <a
              href="https://www.requingroup.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[13px] font-medium tracking-tight text-violet-400 hover:text-violet-300 transition underline underline-offset-4"
            >
              www.requingroup.com
              <span className="text-[13px]">↗</span>
            </a>

            <p className="text-[13px] font-medium text-slate-400 tracking-tight pt-1">
              CIN: U72900RJ2021PTC075344
            </p>
          </div>
        </div>

        {/* Footer Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 items-start mb-8">

          {/* Column 1 - Solutions */}
          <div className="space-y-4 pb-4 md:pb-0 border-b md:border-b-0 border-slate-700/50">
            <h4 className="text-[20px] font-bold tracking-tight text-white flex items-center font-sans">
              <span className="w-1 h-5 bg-violet-500 mr-3"></span> Solutions
            </h4>

            <ul className="space-y-2">
              {['Enterprise AI', 'Mobile Engineering', 'Forensic Auditing', 'IP Vaulting'].map(item => (
                <li key={item}>
                  <a
                    href="https://www.requingroup.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group text-[18px] font-medium tracking-tight flex items-center text-slate-300 hover:text-violet-400 transition-all duration-300 font-sans"
                  >
                    <span className="w-1 h-1 bg-violet-500/40 rounded-full mr-3 group-hover:bg-violet-400"></span>
                    {item}
                    <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2 - Headquarters */}
          <div className="space-y-4 pb-4 md:pb-0 border-b md:border-b-0 border-slate-700/50">
            <h4 className="text-[20px] font-bold tracking-tight text-white flex items-center font-sans">
              <span className="w-1 h-5 bg-violet-500 mr-3"></span> Headquarters
            </h4>
            <p className="text-[18px] font-normal text-slate-300 leading-relaxed tracking-tight font-sans">
              Plot No 6/397, 1st Floor, Sec-6,<br />
              Malviya Nagar, Jaipur, Rajasthan<br />
              India - 302017
            </p>
          </div>

          {/* Column 3 - Compliance */}
          <div className="space-y-4 pb-4 md:pb-0 border-b md:border-b-0 border-slate-700/50">
            <h4 className="text-[20px] font-bold tracking-tight text-white flex items-center font-sans">
              <span className="w-1 h-5 bg-violet-500 mr-3"></span> Compliance
            </h4>
            <div className="flex flex-wrap gap-2">
              {['SOC2', 'GDPR', 'ISO 27001'].map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1.5 bg-slate-800/50 rounded text-[18px] font-medium text-slate-200 border border-slate-700 tracking-tight hover:border-violet-500 transition font-sans"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Column 4 - Support */}
          <div className="space-y-4 pb-4 md:pb-0">
            <h4 className="text-[20px] font-bold tracking-tight text-white flex items-center font-sans">
              <span className="w-1 h-5 bg-violet-500 mr-3"></span> Support
            </h4>

            <div className="space-y-1">
              <a
                href="mailto:requingroupsolutions@gmail.com"
                className="text-[18px] font-normal lowercase tracking-tight text-slate-200 hover:text-violet-400 underline-offset-4 hover:underline transition font-sans block"
              >
                requingroupsolutions@gmail.com
              </a>

              <div className="flex items-center space-x-2 pt-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[18px] font-medium text-emerald-400 tracking-tight font-sans">
                  Nodes Active
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Copyright */}
      <div className="bg-[#090D16] border-t border-slate-700/50 py-6 px-6 md:px-12">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
          <div className="flex items-center space-x-3">
            <i className="fas fa-copyright text-violet-500 text-xl"></i>
            <p className="text-[15px] font-medium text-slate-300 tracking-tight font-sans">
              {new Date().getFullYear()} Requin Solutions Pvt Ltd | All Rights Reserved
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-end gap-4 md:gap-8">
            {['Privacy Policy', 'Terms of Service', 'Data SLA'].map(item => (
              <span
                key={item}
                className="text-[15px] font-medium text-slate-500 tracking-tight hover:text-violet-400 transition cursor-default font-sans"
              >
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
