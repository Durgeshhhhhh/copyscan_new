
import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile, ScanHistoryRecord, UserDocument } from '../types';
import { Card, Button } from './UI';
import { useLoading } from './LoadingContext';

interface ScanHistoryProps {
  user: UserProfile;
}

export const ScanHistory: React.FC<ScanHistoryProps> = ({ user }) => {
  const [scans, setScans] = useState<ScanHistoryRecord[]>([]);
  const [selectedScan, setSelectedScan] = useState<ScanHistoryRecord | null>(null);
  const [viewingVaultDoc, setViewingVaultDoc] = useState<UserDocument | null>(null);
  const { setIsLoading } = useLoading();

  const fetchScans = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, 'users', user.uid, 'scans'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data: ScanHistoryRecord[] = [];
      snapshot.forEach(d => {
        data.push({ id: d.id, ...d.data() } as ScanHistoryRecord);
      });
      setScans(data);
    } catch (err) {
      console.error("History fetch failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchScans();
  }, [user.uid]);

  const handleDelete = async (e: React.MouseEvent, scanId: string) => {
    e.stopPropagation();
    if (!window.confirm("Delete this scan from your history?")) return;
    setIsLoading(true);
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'scans', scanId));
      fetchScans();
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewVaultSource = async (url: string) => {
    const parts = url.replace('internal://vault/', '').split('/');
    if (parts.length < 2) return;
    const [ownerId, docId] = parts;

    setIsLoading(true);
    try {
      const docSnap = await getDoc(doc(db, 'users', ownerId, 'documents', docId));
      if (docSnap.exists()) {
        setViewingVaultDoc({ id: docSnap.id, ...docSnap.data() } as UserDocument);
      } else {
        alert("The matched vault document could not be found.");
      }
    } catch (err) {
      console.error(err);
      alert("Access denied to this vault document.");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadFile = (docObj: UserDocument) => {
    const element = document.createElement("a");
    const file = new Blob([docObj.content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${docObj.title || 'vault_match'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Scan History</h2>
          <p className="text-gray-500 mt-1">Review your past originality reports and source overlaps.</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-full px-4 py-2 flex items-center space-x-2 shadow-sm">
          <i className="fas fa-list-check text-indigo-400 text-xs"></i>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Scans: {scans.length}</span>
        </div>
      </div>

      {scans.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {scans.map((scan) => (
            <Card 
              key={scan.id} 
              className="group cursor-pointer hover:border-indigo-300 transition-all border-gray-100"
              onClick={() => setSelectedScan(scan)}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter shadow-sm ${scan.result.score > 50 ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'}`}>
                      {scan.result.score}% OVERLAP
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      {new Date(scan.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2 italic font-medium leading-relaxed bg-gray-50/50 p-3 rounded-xl border border-gray-50">
                    "{scan.text}"
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={(e) => handleDelete(e, scan.id)}
                    className="w-10 h-10 rounded-full hover:bg-red-50 text-gray-200 hover:text-red-500 transition-colors flex items-center justify-center"
                  >
                    <i className="fas fa-trash-alt text-xs"></i>
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-white border-2 border-dashed border-gray-100 rounded-3xl">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-history text-gray-200 text-3xl"></i>
          </div>
          <p className="text-gray-900 font-black text-xl tracking-tight">No History Found</p>
          <p className="text-sm text-gray-400 mt-1">Complete your first scan to see results here.</p>
        </div>
      )}

      {selectedScan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0 shadow-2xl rounded-[2.5rem] border-none">
             <div className="p-8 bg-indigo-600 text-white flex justify-between items-center">
                <div>
                   <h3 className="text-xl font-black uppercase tracking-tight">Report Review</h3>
                   <p className="text-xs opacity-80 font-medium mt-1">Generated: {new Date(selectedScan.createdAt).toLocaleString()}</p>
                </div>
                <button onClick={() => setSelectedScan(null)} className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors">
                   <i className="fas fa-times"></i>
                </button>
             </div>
             
             <div className="p-8 overflow-y-auto flex-1 space-y-8 scrollbar-thin">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Uniqueness</p>
                      <p className="text-3xl font-black text-indigo-700">{100 - selectedScan.result.score}% Original</p>
                   </div>
                   <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Matches Found</p>
                      <p className="text-3xl font-black text-gray-900">{selectedScan.result.sources.length} Items</p>
                   </div>
                </div>
                <div className="bg-gray-900 text-indigo-100 p-8 rounded-[2rem] shadow-inner text-sm leading-relaxed font-mono italic">
                   "{selectedScan.text}"
                </div>
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b pb-2">Analysis Findings</h4>
                  <p className="text-gray-600 font-medium leading-relaxed italic">
                    {selectedScan.result.summary}
                  </p>
                  <div className="space-y-2 pt-4">
                    {selectedScan.result.sources.map((s, i) => {
                      const isVault = s.url?.startsWith('internal://vault/');
                      const isExternal = s.url && !s.url.startsWith('internal://');
                      
                      const innerContent = (
                        <>
                          <div className="truncate flex-1 mr-4">
                            <div className="flex items-center space-x-2">
                               {isVault && <i className="fas fa-database text-[10px] text-indigo-400"></i>}
                               <p className="font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">{s.title}</p>
                            </div>
                            {isExternal ? (
                              <p className="text-[10px] text-gray-400 truncate font-mono flex items-center">
                                <i className="fas fa-external-link-alt text-[8px] mr-1.5 opacity-50"></i>
                                {s.url}
                              </p>
                            ) : isVault ? (
                              <button 
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleViewVaultSource(s.url);
                                }}
                                className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mt-1 hover:underline flex items-center"
                              >
                                <i className="fas fa-eye mr-1.5"></i> View Original File
                              </button>
                            ) : (
                               <p className="text-[10px] text-gray-400 truncate font-mono">{s.url}</p>
                            )}
                          </div>
                          <span className={`px-2 py-1 rounded text-[10px] font-black tracking-tight ${s.score > 60 ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'}`}>
                            {s.score}% Match
                          </span>
                        </>
                      );

                      if (isExternal) {
                        return (
                          <a 
                            key={`source-${i}`}
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex justify-between items-center p-4 border border-gray-50 rounded-2xl bg-white hover:border-indigo-100 transition-all group cursor-pointer block"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {innerContent}
                          </a>
                        );
                      } else {
                        return (
                          <div 
                            key={`source-${i}`}
                            className="flex justify-between items-center p-4 border border-gray-50 rounded-2xl bg-white hover:border-indigo-100 transition-all group"
                          >
                            {innerContent}
                          </div>
                        );
                      }
                    })}
                  </div>
                </div>
             </div>
             <div className="p-6 bg-gray-50 border-t flex justify-end">
                <Button onClick={() => setSelectedScan(null)} className="px-8">Close Report</Button>
             </div>
          </Card>
        </div>
      )}

      {viewingVaultDoc && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-gray-900/80 backdrop-blur-md animate-in fade-in duration-300">
           <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col p-0 shadow-2xl rounded-[2.5rem] border-none bg-white">
              <div className="p-6 bg-gray-900 text-white flex justify-between items-center">
                 <div className="flex items-center space-x-3">
                    <i className="fas fa-file-shield text-indigo-400"></i>
                    <h3 className="font-black uppercase tracking-tight text-sm">Vault Asset: {viewingVaultDoc.title}</h3>
                 </div>
                 <button onClick={() => setViewingVaultDoc(null)} className="text-white/50 hover:text-white"><i className="fas fa-times"></i></button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 leading-relaxed text-gray-700 whitespace-pre-wrap font-medium text-sm scrollbar-thin">
                 {viewingVaultDoc.content}
              </div>
              <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
                 <button onClick={() => downloadFile(viewingVaultDoc)} className="text-[10px] font-black uppercase text-indigo-600 flex items-center px-4 py-2 hover:bg-white rounded-xl transition-colors">
                    <i className="fas fa-download mr-2"></i> Download Document
                 </button>
                 <Button onClick={() => setViewingVaultDoc(null)} variant="secondary" className="px-6 text-[10px] font-black uppercase">Dismiss</Button>
              </div>
           </Card>
        </div>
      )}
    </div>
  );
};
