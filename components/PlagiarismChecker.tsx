
import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, getDocs, query, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Button, Card } from './UI';
import { checkPlagiarism } from '../services/searchService';
import { parseFileToText } from '../services/fileParsingService';
import { PlagiarismResult, UserDocument } from '../types';
import { useLoading } from './LoadingContext';
import { jsPDF } from 'jspdf';

interface PlagiarismCheckerProps {
  initialText?: string;
  autoScan?: boolean;
}

export const PlagiarismChecker: React.FC<PlagiarismCheckerProps> = ({ initialText = '', autoScan = false }) => {
  const [text, setText] = useState(initialText);
  const [isLoading, setIsLoadingLocal] = useState(false);
  const [result, setResult] = useState<PlagiarismResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkVault, setCheckVault] = useState(true);
  const [searchWeb, setSearchWeb] = useState(true);
  const { setIsLoading } = useLoading();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoScan && initialText.length >= 30) {
      handleCheck();
    }
  }, [autoScan, initialText]);

  const fetchVaultDocs = async (): Promise<UserDocument[]> => {
    if (!auth.currentUser) return [];
    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const userSnap = await getDoc(userDocRef);
      const isAdmin = userSnap.data()?.role === 'admin';

      if (isAdmin) {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const masterDocs: UserDocument[] = [];
        
        const fetchPromises: Promise<void>[] = [];
        usersSnapshot.forEach(u => {
          const fetchOne = async () => {
            const docsSnap = await getDocs(collection(db, 'users', u.id, 'documents'));
            docsSnap.forEach(d => masterDocs.push({ 
              id: d.id, 
              ...d.data(), 
              ownerId: u.id 
            } as UserDocument));
          };
          fetchPromises.push(fetchOne());
        });

        await Promise.all(fetchPromises);
        return masterDocs;
      } else {
        const q = query(collection(db, 'users', auth.currentUser.uid, 'documents'));
        const snapshot = await getDocs(q);
        const docs: UserDocument[] = [];
        snapshot.forEach(d => docs.push({ 
          id: d.id, 
          ...d.data(), 
          ownerId: auth.currentUser.uid 
        } as UserDocument));
        return docs;
      }
    } catch (err: any) {
      console.warn("Vault access limited for this scan.", err);
      return [];
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoadingLocal(true);
    setIsLoading(true);
    setError(null);

    try {
      const content = await parseFileToText(file);
      setText(content);
    } catch (err: any) {
      setError(err.message || "Failed to process the uploaded file.");
    } finally {
      setIsLoadingLocal(false);
      setIsLoading(false);
      e.target.value = '';
    }
  };

  const handleCheck = async () => {
    if (!text.trim() || (!checkVault && !searchWeb)) return;
    setIsLoadingLocal(true);
    setIsLoading(true);
    setError(null);
    
    let scanData: PlagiarismResult | null = null;

    try {
      const vaultDocs = checkVault ? await fetchVaultDocs() : [];
      scanData = await checkPlagiarism(text, vaultDocs, searchWeb);
      setResult(scanData);

      try {
        if (auth.currentUser && scanData) {
          await addDoc(collection(db, 'users', auth.currentUser.uid, 'scans'), {
            text: text,
            result: scanData,
            createdAt: new Date().toISOString(),
            serverTime: serverTimestamp(),
            checkVaultOnly: checkVault && !searchWeb,
            userEmail: auth.currentUser.email
          });
        }
      } catch (saveError) {
        console.warn("Analytics: Failed to log scan.", saveError);
      }

    } catch (err: any) {
      setError("Analysis encountered an error. Check your connection.");
      console.error("Scan Error:", err);
    } finally {
      setIsLoadingLocal(false);
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!result) return;
    
    const doc = new jsPDF();
    const timestamp = new Date().toLocaleString();
    
    doc.setFillColor(99, 102, 241);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text("COPYSCAN AUDIT REPORT", 20, 25);
    doc.setFontSize(10);
    doc.text(`Generated: ${timestamp}`, 20, 33);
    
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(16);
    doc.text("Executive Summary", 20, 55);
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 58, 190, 58);
    
    doc.setFontSize(12);
    doc.text(`Originality Score: ${100 - result.score}% Unique`, 20, 68);
    doc.text(`Plagiarism Detected: ${result.score}%`, 20, 75);
    
    doc.setFontSize(10);
    const splitSummary = doc.splitTextToSize(result.summary, 170);
    doc.text(splitSummary, 20, 85);
    
    doc.setFontSize(16);
    doc.text("Analyzed Content", 20, 110);
    doc.line(20, 113, 190, 113);
    doc.setFontSize(8);
    const splitText = doc.splitTextToSize(text, 170);
    doc.text(splitText, 20, 120);
    
    doc.addPage();
    doc.setFontSize(16);
    doc.text("Matching Sources", 20, 20);
    doc.line(20, 23, 190, 23);
    
    let y = 35;
    const significantSources = result.sources.filter(s => s.score >= 20);
    significantSources.forEach((source, i) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(11);
      doc.setTextColor(99, 102, 241);
      doc.text(`${i + 1}. ${source.isPrivate ? '[VAULT] ' : ''}${source.title}`, 20, y);
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(8);
      doc.text(source.url, 20, y + 5);
      doc.setTextColor(220, 38, 38);
      doc.setFontSize(10);
      doc.text(`Match: ${source.score}%`, 170, y + 2);
      y += 18;
    });

    doc.save(`CopyScan_Report_${Date.now()}.pdf`);
  };

  const clearAll = () => {
    setText('');
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getScanModeLabel = () => {
    if (searchWeb && checkVault) return "Hybrid Scan Mode";
    if (searchWeb) return "Web Only Mode";
    if (checkVault) return "Vault Only Mode";
    return "No Source Selected";
  };

  const vaultMatches = result?.sources.filter(s => s.isPrivate && s.score >= 20) || [];
  const webMatches = result?.sources.filter(s => !s.isPrivate && s.score >= 20).slice(0, 8) || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Scanner</h2>
          <p className="text-gray-500 mt-1 text-sm font-medium">Verify originality against the web and your private vault.</p>
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-4 border-r border-gray-200 pr-6 mr-2">
            <label className="flex items-center space-x-2 cursor-pointer group">
              <div 
                onClick={() => setSearchWeb(!searchWeb)}
                  className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-1 ${searchWeb ? 'bg-lavender-600' : 'bg-gray-200'}`}
              >
                <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${searchWeb ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest ${searchWeb ? 'text-lavender-600' : 'text-gray-400'} transition-colors`}>Web</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer group">
              <div 
                onClick={() => setCheckVault(!checkVault)}
                  className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-1 ${checkVault ? 'bg-lavender-600' : 'bg-gray-200'}`}
              >
                <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${checkVault ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest ${checkVault ? 'text-lavender-600' : 'text-gray-400'} transition-colors`}>Vault</span>
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".txt,.md,.rtf,.pdf,.docx,.pptx,.ppt,.html,.htm" 
              onChange={handleFileUpload} 
            />
            <Button variant="secondary" onClick={() => fileInputRef.current?.click()} className="bg-white">
              <i className="fas fa-file-upload mr-2"></i> Upload
            </Button>
            <Button variant="secondary" onClick={clearAll} disabled={isLoading || !text} className="bg-white">
              <i className="fas fa-redo-alt"></i>
            </Button>
            <Button 
              onClick={handleCheck} 
              isLoading={isLoading} 
              disabled={!text || text.length < 30 || (!searchWeb && !checkVault)} 
              className="px-8 shadow-lavender-200"
            >
              <i className="fas fa-bolt mr-2"></i> Run Audit
            </Button>
          </div>
        </div>
      </div>

      <Card className="p-0 overflow-hidden border-lavender-50 shadow-2xl shadow-lavender-500/5 ring-4 ring-white">
        <textarea
          className="w-full h-80 p-8 text-xl text-gray-800 placeholder-gray-300 focus:outline-none resize-none border-none leading-relaxed font-medium"
          placeholder="Paste content here or upload (PDF, Word, PPT, HTML, TXT)..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="bg-lavender-50/30 px-8 py-3 flex justify-between text-[10px] text-gray-400 font-black uppercase tracking-widest border-t">
          <span>{text.length} Characters • {getScanModeLabel()}</span>
          <span className="text-lavender-500">{(!searchWeb && !checkVault) ? 'Select a scan source above' : 'Ready to Check Authenticity'}</span>
        </div>
      </Card>

      {error && (
        <div className="bg-red-50 text-red-600 p-5 rounded-2xl flex items-center space-x-4 border border-red-100">
          <i className="fas fa-exclamation-triangle text-xl"></i>
          <p className="font-semibold">{error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-lavender-100 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
             <div className="flex items-center space-x-3">
               <div className="w-10 h-10 rounded-full bg-lavender-600 flex items-center justify-center text-white">
                 <i className="fas fa-check-double text-xs"></i>
               </div>
               <div>
                 <h4 className="font-black text-gray-900 text-sm uppercase tracking-tight">Audit Ready</h4>
                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">High-match discovery report generated</p>
               </div>
             </div>
             <div className="flex items-center space-x-3 w-full sm:w-auto">
               <Button onClick={handleDownloadPDF} variant="secondary" className="flex-1 sm:flex-none text-[10px] font-black uppercase tracking-widest bg-white border-gray-200">
                 <i className="fas fa-file-pdf mr-2 text-red-600"></i> Export PDF
               </Button>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in zoom-in-95 duration-500">
            <Card className="lg:col-span-4 flex flex-col items-center justify-center p-10">
              <h3 className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-6">Uniqueness Score</h3>
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-48 h-48 transform -rotate-90">
                  <circle className="text-gray-100" strokeWidth="12" stroke="currentColor" fill="transparent" r="88" cx="96" cy="96" />
                  <circle
                    className={`${result.score > 60 ? 'text-red-500' : result.score > 20 ? 'text-amber-500' : 'text-lavender-600'} transition-all duration-1000 ease-out`}
                    strokeWidth="12" strokeDasharray={552.9} strokeDashoffset={552.9 - (552.9 * result.score) / 100} strokeLinecap="round" stroke="currentColor" fill="transparent" r="88" cx="96" cy="96"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-5xl font-black text-gray-900">{100 - result.score}%</span>
                  <span className="text-[10px] font-black text-gray-400 uppercase mt-1">Unique Content</span>
                </div>
              </div>
            </Card>

            <Card className="lg:col-span-8 p-10 border-lavender-50 bg-gradient-to-br from-white to-blue-50/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <i className="fas fa-shield-halved text-lavender-600 mr-3"></i> 
                  High-Match Results
                </h3>
              </div>
              
              <div className="text-gray-600 text-lg leading-relaxed font-medium mb-6">
                {result.summary}
              </div>
              
              <div className="space-y-8 max-h-[450px] overflow-y-auto pr-2 scrollbar-thin">
                {checkVault && (
                  <div>
                    <h3 className="text-[10px] font-black uppercase text-lavender-600 mb-4 tracking-[0.2em] border-b border-lavender-100 pb-2 flex items-center">
                      <i className="fas fa-database mr-2"></i> Vault High Matches ({vaultMatches.length})
                    </h3>
                    <div className="space-y-2">
                      {vaultMatches.length > 0 ? vaultMatches.map((source, idx) => (
                        <div 
                          key={`vault-${idx}`} 
                          className="p-4 rounded-xl border bg-lavender-50/30 border-lavender-100 flex items-center justify-between group transition-all duration-200"
                        >
                          <div className="flex-1 min-w-0 mr-4">
                            <div className="flex items-center space-x-2">
                              <p className="text-[10px] font-black text-lavender-500 uppercase tracking-widest">Vault File:</p>
                              <h4 className="font-bold text-sm text-gray-900 truncate">{source.title}</h4>
                            </div>
                            <p className="text-[9px] text-gray-400 mt-1 uppercase font-bold tracking-tighter">Matched with internal intellectual property</p>
                          </div>
                          <div className={`px-2 py-1 rounded text-[10px] font-black tracking-tight ${source.score > 70 ? 'bg-red-50 text-red-600' : 'bg-lavender-50 text-lavender-600'}`}>
                            {source.score}% Match
                          </div>
                        </div>
                      )) : (
                        <p className="text-gray-400 text-xs italic px-2">No high-similarity matches found in the vault.</p>
                      )}
                    </div>
                  </div>
                )}

                {searchWeb && (
                  <div>
                    <h3 className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-[0.2em] border-b pb-2 flex items-center">
                      <i className="fas fa-globe mr-2"></i> Web High Matches ({webMatches.length})
                    </h3>
                    <div className="space-y-2">
                      {webMatches.length > 0 ? webMatches.map((source, idx) => (
                        <a 
                          key={`web-${idx}`} 
                          href={source.url} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-4 rounded-xl border bg-white border-gray-100 flex items-center justify-between group transition-all duration-200 hover:border-lavender-300 hover:shadow-md cursor-pointer block"
                        >
                          <div className="flex-1 min-w-0 mr-4">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-bold text-sm text-gray-900 truncate group-hover:text-lavender-600">{source.title}</h4>
                              <i className="fas fa-external-link-alt text-[10px] text-lavender-300 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                            </div>
                            <p className="text-[10px] text-lavender-500 truncate mt-1 font-mono hover:underline">{source.url}</p>
                          </div>
                          <div className={`px-2 py-1 rounded text-[10px] font-black tracking-tight ${source.score > 70 ? 'bg-red-50 text-red-600' : 'bg-lavender-50 text-lavender-600'}`}>
                            {source.score}% Match
                          </div>
                        </a>
                      )) : (
                        <p className="text-gray-400 text-xs italic px-2">No significant external matches found (Threshold: 20%).</p>
                      )}
                    </div>
                  </div>
                )}

                {(vaultMatches.length === 0 && webMatches.length === 0) && (
                  <div className="py-10 text-center border-2 border-dashed border-gray-50 rounded-2xl">
                    <p className="text-gray-400 font-medium italic">Your work is highly original with no significant overlaps found.</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          <Card className="p-10 border-lavender-50 shadow-sm animate-in slide-in-from-bottom-2 duration-500">
             <div className="flex items-center justify-between mb-8">
               <div>
                 <h3 className="text-xl font-black text-gray-900 tracking-tight">Visual Analysis Breakdown</h3>
                 <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Red highlights indicate segments found in external sources</p>
               </div>
             </div>
             <div className="bg-gray-50/50 p-8 rounded-3xl border border-gray-100 min-h-[200px] leading-relaxed text-lg font-medium text-gray-800 whitespace-pre-wrap selection:bg-lavender-100">
                {result.highlightedHtml ? (
                   <div dangerouslySetInnerHTML={{ __html: result.highlightedHtml }} />
                ) : (
                  <p className="text-gray-400 italic font-normal">No highlights available.</p>
                )}
             </div>
          </Card>
        </div>
      )}
    </div>
  );
};
