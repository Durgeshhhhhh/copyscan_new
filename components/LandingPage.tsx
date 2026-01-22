
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
      color: "text-lavender-600",
      bg: "bg-lavender-50"
    },
    {
      title: "Encrypted Vault",
      desc: "Securely index and cross-reference your organization's intellectual property.",
      icon: "fa-vault",
      color: "text-charcoal-700",
      bg: "bg-charcoal-50"
    },
    {
      title: "Side-by-Side",
      desc: "Precision visual analysis with semantic phrase highlighting.",
      icon: "fa-columns",
      color: "text-lavender-600",
      bg: "bg-lavender-50"
    },
    {
      title: "Certified PDF",
      desc: "Generate legal-ready reports detailing match sources and attribution.",
      icon: "fa-file-pdf",
      color: "text-charcoal-700",
      bg: "bg-charcoal-50"
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
    <div className="min-h-screen bg-ivory-50 text-charcoal-900 selection:bg-lavender-100 font-sans">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes zoomIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md z-50 border-b border-charcoal-100 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3 group cursor-default">
            <div className="bg-lavender-600 p-2.5 rounded-xl text-white shadow-md shadow-lavender-500/20 animate-float">
              <i className="fas fa-shield-halved text-lg"></i>
            </div>
            <h1 className="text-xl font-bold text-charcoal-800 tracking-tight">CopyScan</h1>
          </div>
          <Button onClick={onLoginClick} className="text-xs font-medium uppercase tracking-wide px-6 py-2.5 rounded-xl bg-charcoal-800 text-white hover:bg-charcoal-700 border-none shadow-sm hover:shadow-md transition-all duration-200">
            Sign In
          </Button>
        </div>
      </nav>

      <header className="pt-40 pb-24 px-6 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-lavender-100/30 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-charcoal-100/20 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        <div className="max-w-7xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center space-x-2 bg-lavender-50 border border-lavender-200 px-5 py-2 rounded-full">
            <span className="text-xs font-medium uppercase tracking-wide text-lavender-700">Enterprise Originality Platform</span>
          </div>
          
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-bold text-charcoal-900 leading-[0.95] tracking-tight max-w-4xl mx-auto">
            Protect Your <span className="text-lavender-600">Intellectual Property</span> with Confidence
          </h2>
          
          <p className="text-lg md:text-xl text-charcoal-600 font-normal max-w-2xl mx-auto leading-relaxed">
            Advanced plagiarism detection and content verification. Ensure originality across web sources and your private document vault.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button onClick={onLoginClick} className="px-10 py-5 text-lg font-medium rounded-xl bg-lavender-600 text-white shadow-md shadow-lavender-500/20 border-none group transition-all duration-200 hover:scale-[1.02] hover:bg-lavender-700">
              Start Your Audit <i className="fas fa-arrow-right ml-3 group-hover:translate-x-1 transition-transform duration-200"></i>
            </Button>
          </div>
          
          <div className="pt-8 space-y-3 max-w-3xl mx-auto">
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-charcoal-500">
              <div className="flex items-center space-x-2">
                <i className="fas fa-check-circle text-lavender-600"></i>
                <span>Real-time scanning</span>
              </div>
              <div className="flex items-center space-x-2">
                <i className="fas fa-check-circle text-lavender-600"></i>
                <span>Secure document vault</span>
              </div>
              <div className="flex items-center space-x-2">
                <i className="fas fa-check-circle text-lavender-600"></i>
                <span>Certified reports</span>
              </div>
            </div>
            <p className="text-xs font-medium text-charcoal-400 uppercase tracking-wide">
              Restricted access • Registration managed by organization admins
            </p>
          </div>
        </div>
      </header>

      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h3 className="text-3xl md:text-4xl font-bold text-charcoal-900 mb-4">Powerful Features for Content Protection</h3>
          <p className="text-lg text-charcoal-600 max-w-2xl mx-auto">Comprehensive tools designed to safeguard your intellectual property</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {coreFunctions.map((f, i) => (
            <Card key={i} className="p-8 border border-charcoal-100 bg-white shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 rounded-xl group animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}>
              <div className={`${f.bg} ${f.color} w-14 h-14 rounded-xl flex items-center justify-center text-xl mb-6 group-hover:scale-105 transition-transform duration-300`}>
                <i className={`fas ${f.icon}`}></i>
              </div>
              <h4 className="text-lg font-bold text-charcoal-800 mb-2">{f.title}</h4>
              <p className="text-charcoal-600 font-normal text-sm leading-relaxed">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-in fade-in slide-in-from-left-4 duration-700">
            <h3 className="text-3xl md:text-4xl font-bold text-charcoal-900 mb-6">Why Choose CopyScan?</h3>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-xl bg-lavender-100 flex items-center justify-center text-lavender-600 flex-shrink-0">
                  <i className="fas fa-shield-check text-xl"></i>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-charcoal-800 mb-2">Enterprise-Grade Security</h4>
                  <p className="text-charcoal-600 leading-relaxed">Your documents are encrypted and stored securely. Access is strictly controlled with role-based permissions for complete privacy and compliance.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-xl bg-lavender-100 flex items-center justify-center text-lavender-600 flex-shrink-0">
                  <i className="fas fa-bolt text-xl"></i>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-charcoal-800 mb-2">Lightning-Fast Analysis</h4>
                  <p className="text-charcoal-600 leading-relaxed">Our advanced algorithms scan billions of web pages and your private vault in seconds, delivering comprehensive originality reports instantly.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-xl bg-lavender-100 flex items-center justify-center text-lavender-600 flex-shrink-0">
                  <i className="fas fa-chart-line text-xl"></i>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-charcoal-800 mb-2">Detailed Insights</h4>
                  <p className="text-charcoal-600 leading-relaxed">Get comprehensive match analysis with highlighted similarities, source links, and similarity scores. Export professional PDF reports for legal and academic use.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="animate-in fade-in slide-in-from-right-4 duration-700">
            <Card className="p-10 bg-gradient-to-br from-lavender-50 to-white border-lavender-200">
              <h4 className="text-2xl font-bold text-charcoal-900 mb-6">Perfect For</h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-charcoal-700">
                  <i className="fas fa-check-circle text-lavender-600"></i>
                  <span className="font-medium">Academic institutions and researchers</span>
                </div>
                <div className="flex items-center space-x-3 text-charcoal-700">
                  <i className="fas fa-check-circle text-lavender-600"></i>
                  <span className="font-medium">Content creators and publishers</span>
                </div>
                <div className="flex items-center space-x-3 text-charcoal-700">
                  <i className="fas fa-check-circle text-lavender-600"></i>
                  <span className="font-medium">Legal firms and compliance teams</span>
                </div>
                <div className="flex items-center space-x-3 text-charcoal-700">
                  <i className="fas fa-check-circle text-lavender-600"></i>
                  <span className="font-medium">Corporate intellectual property departments</span>
                </div>
                <div className="flex items-center space-x-3 text-charcoal-700">
                  <i className="fas fa-check-circle text-lavender-600"></i>
                  <span className="font-medium">Journalists and media organizations</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-white rounded-xl border border-charcoal-100 shadow-sm animate-in fade-in zoom-in-95 duration-700" style={{ animationDelay: '0ms' }}>
            <div className="text-4xl font-bold text-lavender-600 mb-2">45B+</div>
            <div className="text-sm text-charcoal-600 font-medium">Web Pages Indexed</div>
          </div>
          <div className="text-center p-6 bg-white rounded-xl border border-charcoal-100 shadow-sm animate-in fade-in zoom-in-95 duration-700" style={{ animationDelay: '100ms' }}>
            <div className="text-4xl font-bold text-lavender-600 mb-2">99.9%</div>
            <div className="text-sm text-charcoal-600 font-medium">Uptime Guarantee</div>
          </div>
          <div className="text-center p-6 bg-white rounded-xl border border-charcoal-100 shadow-sm animate-in fade-in zoom-in-95 duration-700" style={{ animationDelay: '200ms' }}>
            <div className="text-4xl font-bold text-lavender-600 mb-2">&lt;3s</div>
            <div className="text-sm text-charcoal-600 font-medium">Average Scan Time</div>
          </div>
          <div className="text-center p-6 bg-white rounded-xl border border-charcoal-100 shadow-sm animate-in fade-in zoom-in-95 duration-700" style={{ animationDelay: '300ms' }}>
            <div className="text-4xl font-bold text-lavender-600 mb-2">256-bit</div>
            <div className="text-sm text-charcoal-600 font-medium">Encryption Standard</div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-charcoal-800 rounded-3xl mx-6 mb-20 relative overflow-hidden text-white shadow-lg">
        <div className="absolute top-0 right-0 w-96 h-96 bg-lavender-500/10 blur-[120px] animate-pulse"></div>
        <div className="max-w-5xl mx-auto px-10 text-center relative z-10">
          <h3 className="text-lavender-300 font-medium text-xs uppercase tracking-wider mb-4 animate-in fade-in duration-700">How it works</h3>
          <h4 className="text-3xl md:text-4xl font-bold mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">Simple, Fast, and Reliable</h4>
          <div className="grid md:grid-cols-3 gap-12">
            {simplifiedWorkflow.map((step, i) => (
              <div key={i} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${i * 150}ms`, animationFillMode: 'both' }}>
                <div className="w-14 h-14 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center mx-auto mb-6 text-xl text-lavender-300 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <i className={`fas ${step.icon}`}></i>
                </div>
                <h4 className="text-xl font-bold">{step.title}</h4>
                <p className="text-charcoal-300 text-sm font-normal leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
