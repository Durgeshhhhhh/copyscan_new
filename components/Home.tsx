
import React from 'react';
import { UserProfile, AppView } from '../types';
import { Card, Button } from './UI';

interface HomeProps {
  user: UserProfile;
  onViewChange: (view: AppView) => void;
}

export const Home: React.FC<HomeProps> = ({ user, onViewChange }) => {
  const quickActions = [
    {
      id: 'SCANNER',
      title: 'Quick Scan',
      desc: 'Verify if your text exists elsewhere on the internet.',
      icon: 'fa-bolt',
      color: 'bg-indigo-600',
      shadow: 'shadow-indigo-200'
    },
    {
      id: 'VAULT',
      title: 'Document Vault',
      desc: 'Securely store and manage your private files for auditing.',
      icon: 'fa-folder-open',
      color: 'bg-indigo-500',
      shadow: 'shadow-indigo-100'
    },
    {
      id: 'COMPARISON',
      title: 'Text Comparison',
      desc: 'Compare two texts to see how much they overlap.',
      icon: 'fa-columns',
      color: 'bg-cyan-500',
      shadow: 'shadow-cyan-100'
    }
  ];

  const platformStats = [
    { label: 'Pages Indexed', value: '45.2B+', icon: 'fa-globe' },
    { label: 'Scans Performed', value: '1.2M+', icon: 'fa-bolt' },
    { label: 'Originality Rate', value: '94%', icon: 'fa-chart-pie' },
    { label: 'Secure Vaults', value: '12.8K', icon: 'fa-lock' }
  ];

  const steps = [
    { 
      title: 'Input Content', 
      desc: 'Paste your raw text or upload documents directly into the scanner.',
      icon: 'fa-keyboard' 
    },
    { 
      title: 'Select Sources', 
      desc: 'Choose to scan the global web, your private vault, or both simultaneously.',
      icon: 'fa-layer-group' 
    },
    { 
      title: 'Audit & Export', 
      desc: 'Review detailed matches, visit source links, and download your report.',
      icon: 'fa-file-export' 
    }
  ];

  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-top-4 duration-700 pb-20">
      {/* Hero Welcome */}
      <section className="relative bg-slate-950 rounded-[3rem] p-10 md:p-16 text-white overflow-hidden shadow-2xl shadow-indigo-900/20">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/20 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-400/10 rounded-full -ml-10 -mb-10 blur-2xl"></div>
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 mb-6">
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse mr-3"></span>
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Intelligent Protection Active</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Welcome, {user.displayName?.split(' ')[0] || 'Researcher'}! 
          </h2>
          <p className="text-lg text-slate-300 mt-4 font-medium max-w-lg leading-relaxed opacity-90">
            CopyScan is your dedicated partner for digital integrity. Protect your intellectual property with real-time hybrid scanning technology.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button onClick={() => onViewChange('SCANNER')} className="bg-indigo-600 text-white hover:bg-indigo-700 px-8 py-3 text-lg font-bold shadow-xl shadow-indigo-600/30 border-none">
              Run New Audit
            </Button>
            <Button onClick={() => onViewChange('VAULT')} variant="ghost" className="text-white hover:bg-white/10 border border-white/20 px-8 py-3 text-lg font-bold">
              Access Vault
            </Button>
          </div>
        </div>
      </section>

      {/* Platform Stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-2">
        {platformStats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center text-center group hover:border-indigo-200 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-3 group-hover:scale-110 transition-transform">
              <i className={`fas ${stat.icon} text-sm`}></i>
            </div>
            <p className="text-2xl font-black text-gray-900 tracking-tighter">{stat.value}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* Quick Actions Grid */}
      <section>
        <div className="flex items-center justify-between mb-8 px-2">
           <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Productivity Tools</h3>
           <div className="h-px flex-1 bg-gray-100 mx-6"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action) => (
            <Card 
              key={action.id} 
              className="group cursor-pointer hover:border-indigo-400 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 p-8 border-gray-50 rounded-[2.5rem]"
              onClick={() => onViewChange(action.id as AppView)}
            >
              <div className={`${action.color} ${action.shadow} w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-lg`}>
                <i className={`fas ${action.icon}`}></i>
              </div>
              <h4 className="text-xl font-black text-gray-900 mb-2">{action.title}</h4>
              <p className="text-gray-500 text-sm font-medium leading-relaxed">
                {action.desc}
              </p>
              <div className="mt-6 flex items-center text-indigo-600 font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                Launch <i className="fas fa-arrow-right ml-2"></i>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-slate-900 rounded-[3rem] p-10 md:p-16 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-transparent to-transparent"></div>
        </div>
        
        <div className="relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h3 className="text-[10px] font-black uppercase text-cyan-400 tracking-[0.3em] mb-4">Precision Workflow</h3>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">How CopyScan Protects Your Work</h2>
            <p className="text-gray-400 mt-4 font-medium">Three simple steps to verify authenticity and secure your creative assets.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {steps.map((step, idx) => (
              <div key={idx} className="relative">
                <div className="flex items-center mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-xl font-black shadow-lg shadow-indigo-600/30">
                    {idx + 1}
                  </div>
                  <div className="h-px flex-1 bg-white/10 ml-4 hidden md:block"></div>
                </div>
                <h4 className="text-xl font-bold mb-3 flex items-center">
                  <i className={`fas ${step.icon} text-cyan-400 mr-3 text-sm opacity-60`}></i>
                  {step.title}
                </h4>
                <p className="text-gray-400 text-sm leading-relaxed font-medium">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Protection Tips Card */}
      <section className="px-2">
        <Card className="bg-gradient-to-br from-white to-indigo-50/50 p-10 border-indigo-100 flex flex-col md:flex-row items-center gap-10 rounded-[3rem]">
           <div className="w-20 h-20 rounded-3xl bg-amber-50 flex items-center justify-center text-amber-500 text-3xl shrink-0 shadow-inner">
             <i className="fas fa-lightbulb"></i>
           </div>
           <div className="flex-1 text-center md:text-left">
             <h4 className="text-xl font-black text-gray-900 mb-2">Pro Tip: Maintain a Private Vault</h4>
             <p className="text-gray-600 text-sm font-medium leading-relaxed">
               Adding your previous works to your <strong>Private Vault</strong> prevents internal overlap and allows you to track content evolution. It’s the most effective way to ensure your entire team or organization stays unique.
             </p>
           </div>
           <Button onClick={() => onViewChange('VAULT')} className="shrink-0 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-none px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs">
             Open My Vault
           </Button>
        </Card>
      </section>
    </div>
  );
};
