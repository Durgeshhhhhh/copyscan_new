
import React from 'react';
import { Button, Card } from './UI';

interface LandingPageProps {
  onLoginClick: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick }) => {
  const coreFunctions = [
    {
      title: "Hybrid Scan",
      desc: "Simultaneously audit against 45B+ web documents and your private vault.",
      icon: "fa-magnifying-glass",
      color: "text-indigo-600",
      bg: "bg-indigo-50"
    },
    {
      title: "Encrypted Vault",
      desc: "Securely index and cross-reference your organization's intellectual property.",
      icon: "fa-vault",
      color: "text-cyan-500",
      bg: "bg-cyan-50"
    },
    {
      title: "Side-by-Side",
      desc: "Precision visual analysis with semantic phrase highlighting.",
      icon: "fa-columns",
      color: "text-fuchsia-500",
      bg: "bg-fuchsia-50"
    },
    {
      title: "Certified PDF",
      desc: "Generate legal-ready reports detailing match sources and attribution.",
      icon: "fa-file-pdf",
      color: "text-rose-500",
      bg: "bg-rose-50"
    }
  ];

  const simplifiedWorkflow = [
    {
      title: "1. Ingest",
      desc: "Upload documents or paste text to be audited.",
      icon: "fa-cloud-arrow-up"
    },
    {
      title: "2. Analyze",
      desc: "Engine scans web and private databases instantly.",
      icon: "fa-microchip"
    },
    {
      title: "3. Verify",
      desc: "Review match sources and export certified reports.",
      icon: "fa-check-double"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-100 font-sans">
      <nav className="fixed top-0 left-0 right-0 bg-white/70 backdrop-blur-xl z-50 border-b border-slate-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2 group cursor-default">
            <div className="bg-gradient-to-tr from-indigo-600 to-cyan-500 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/20">
              <i className="fas fa-shield-halved text-lg"></i>
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tighter">COPYSCAN</h1>
          </div>
          <Button onClick={onLoginClick} className="text-xs font-black uppercase tracking-widest px-6 py-2.5 rounded-xl bg-slate-950 text-white hover:bg-slate-800 border-none shadow-xl">
            Sign In
          </Button>
        </div>
      </nav>

      <header className="pt-40 pb-20 px-6 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/15 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/15 rounded-full blur-[80px]"></div>
        
        <div className="max-w-7xl mx-auto text-center space-y-8 animate-in fade-in zoom-in-95 duration-1000">
          <div className="inline-flex items-center space-x-2 bg-indigo-600/5 border border-indigo-600/10 px-4 py-1.5 rounded-full">
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Enterprise Originality Platform</span>
          </div>
          
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 leading-[0.95] tracking-tight max-w-4xl mx-auto">
            Secure your <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-400">Original Ideas.</span>
          </h2>
          
          <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
            Professional-grade plagiarism detection and IP management powered by real-time hybrid scanning.
          </p>
          
          <div className="flex justify-center pt-4">
            <Button onClick={onLoginClick} className="px-10 py-5 text-lg font-black rounded-2xl bg-indigo-600 text-white shadow-2xl shadow-indigo-500/40 border-none group transition-all hover:scale-105 active:scale-95">
              Start Your Audit <i className="fas fa-arrow-right ml-3 group-hover:translate-x-1 transition-transform"></i>
            </Button>
          </div>
          
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Restricted access. Registration managed by organization admins.
          </p>
        </div>
      </header>

      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {coreFunctions.map((f, i) => (
            <Card key={i} className="p-8 border-none bg-white shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 rounded-[2rem] group">
              <div className={`${f.bg} ${f.color} w-14 h-14 rounded-2xl flex items-center justify-center text-xl mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-sm`}>
                <i className={`fas ${f.icon}`}></i>
              </div>
              <h4 className="text-lg font-black text-slate-900 mb-2">{f.title}</h4>
              <p className="text-slate-500 font-medium text-xs leading-relaxed">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="py-20 bg-slate-950 rounded-[3rem] mx-6 mb-20 relative overflow-hidden text-white shadow-2xl shadow-indigo-900/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 blur-[120px]"></div>
        <div className="max-w-5xl mx-auto px-10 text-center relative z-10">
          <h3 className="text-cyan-400 font-black text-[10px] uppercase tracking-[0.4em] mb-12">How it works</h3>
          <div className="grid md:grid-cols-3 gap-12">
            {simplifiedWorkflow.map((step, i) => (
              <div key={i} className="space-y-4">
                <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-xl text-cyan-400">
                  <i className={`fas ${step.icon}`}></i>
                </div>
                <h4 className="text-xl font-bold">{step.title}</h4>
                <p className="text-slate-400 text-sm font-medium leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-8 border-t border-slate-100 bg-white text-center">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          © {new Date().getFullYear()} Requin Solutions Pvt Ltd
        </p>
      </footer>
    </div>
  );
};
