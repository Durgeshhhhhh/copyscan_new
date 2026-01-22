
import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, doc, updateDoc, deleteDoc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';
import { db, auth as primaryAuth } from '../firebase';
import { Card, Button, Input } from './UI';
import { useLoading } from './LoadingContext';
import { AdminStats, UserWithStats, ScanHistoryRecord, UserDocument } from '../types';

interface AdminPanelProps {
  onScanDocument?: (content: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onScanDocument }) => {
  const [activeTab, setActiveTab] = useState<'USERS' | 'UNIVERSAL_VAULT'>('USERS');
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [allDocuments, setAllDocuments] = useState<UserDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedUserDetail, setSelectedUserDetail] = useState<{
    email: string;
    userId: string;
    role: string;
    password?: string;
    scans: ScanHistoryRecord[];
    docs: UserDocument[];
    view: 'SCANS' | 'FILES' | 'SECURITY';
  } | null>(null);
  
  const [focusedScan, setFocusedScan] = useState<ScanHistoryRecord | null>(null);
  const [focusedDoc, setFocusedDoc] = useState<UserDocument | null>(null);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{email: string; pass: string; name: string} | null>(null);

  const { setIsLoading } = useLoading();

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const usersQuery = query(collection(db, 'users'), orderBy('updatedAt', 'desc'));
      const usersSnapshot = await getDocs(usersQuery);
      
      const usersData: UserWithStats[] = [];
      usersSnapshot.forEach(userDoc => {
        const data = userDoc.data();
        usersData.push({
          uid: userDoc.id,
          email: data.email,
          displayName: data.name || data.displayName,
          photoURL: data.photoURL,
          role: data.role || 'user',
          password: data.password,
          docCount: 0,
          joinedAt: data.updatedAt?.toDate()?.toISOString() || new Date().toISOString()
        });
      });
      setUsers(usersData);
    } catch (error) {
      console.error("Admin fetch failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUniversalVault = async () => {
    setIsLoading(true);
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const userIds: {id: string, email: string}[] = [];
      usersSnapshot.forEach(u => {
        const data = u.data();
        userIds.push({ id: u.id, email: data.email || 'Unknown' });
      });

      const masterDocs: UserDocument[] = [];
      const fetchPromises = userIds.map(async (user) => {
        const docsSnap = await getDocs(collection(db, 'users', user.id, 'documents'));
        docsSnap.forEach(d => {
          const data = d.data();
          masterDocs.push({
            id: d.id,
            ...data,
            ownerId: user.id,
            ownerEmail: user.email
          } as UserDocument);
        });
      });

      await Promise.all(fetchPromises);
      masterDocs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setAllDocuments(masterDocs);
    } catch (err: any) {
      console.error("Universal vault fetch failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'USERS') fetchAdminData();
    if (activeTab === 'UNIVERSAL_VAULT') fetchUniversalVault();
  }, [activeTab]);

  const downloadFile = (doc: UserDocument) => {
    const element = document.createElement("a");
    const file = new Blob([doc.content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${doc.title || 'document'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setCreateError(null);
    const secondaryAppName = 'AdminRegistrationApp_' + Date.now();
    const secondaryApp = initializeApp(primaryAuth.app.options, secondaryAppName);
    const secondaryAuth = getAuth(secondaryApp);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, newEmail, newPassword);
      const newUser = userCredential.user;
      await updateProfile(newUser, { displayName: newName });
      await setDoc(doc(db, 'users', newUser.uid), {
        uid: newUser.uid,
        email: newEmail,
        name: newName,
        password: newPassword,
        role: 'user',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      await signOut(secondaryAuth);
      setCreatedCredentials({ email: newEmail, pass: newPassword, name: newName });
      setNewEmail('');
      setNewPassword('');
      setNewName('');
      fetchAdminData();
    } catch (err: any) {
      console.error("User Creation Error:", err);
      if (err.code === 'auth/email-already-in-use') {
        setCreateError("This email address is already in use.");
      } else if (err.code === 'auth/weak-password') {
        setCreateError("Password should be at least 6 characters.");
      } else {
        setCreateError(err.message || "Failed to create user.");
      }
    } finally {
      setIsCreating(false);
      try { await deleteApp(secondaryApp); } catch (cleanupErr) { console.warn("Cleanup Warning:", cleanupErr); }
    }
  };

  const handleViewVaultFile = async (url: string) => {
    const parts = url.replace('internal://vault/', '').split('/');
    if (parts.length < 2) return;
    const [ownerId, docId] = parts;
    
    setIsLoading(true);
    try {
      const docSnap = await getDoc(doc(db, 'users', ownerId, 'documents', docId));
      if (docSnap.exists()) {
        setFocusedDoc({ id: docSnap.id, ...docSnap.data(), ownerId } as UserDocument);
      } else {
        alert("This document no longer exists in the vault.");
      }
    } catch (err) {
      alert("Failed to retrieve vault document.");
    } finally {
      setIsLoading(false);
    }
  };

  const inspectUser = async (userId: string, email: string, role: string, password?: string) => {
    setIsLoading(true);
    try {
      const qScans = query(collection(db, 'users', userId, 'scans'), orderBy('createdAt', 'desc'));
      const qDocs = query(collection(db, 'users', userId, 'documents'), orderBy('createdAt', 'desc'));
      const [snapScans, snapDocs] = await Promise.all([getDocs(qScans), getDocs(qDocs)]);
      const scans: ScanHistoryRecord[] = [];
      snapScans.forEach(d => { scans.push({ id: d.id, ...d.data() } as ScanHistoryRecord); });
      const docs: UserDocument[] = [];
      snapDocs.forEach(d => { docs.push({ id: d.id, ...d.data() } as UserDocument); });
      setSelectedUserDetail({ email, userId, role, password, scans, docs, view: 'SECURITY' });
      setFocusedScan(null);
      setFocusedDoc(null);
    } catch (err) {
      console.error(err);
      alert("Inspection failed. Records might be empty or missing.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDoc = async (docObj: UserDocument) => {
    if (!window.confirm(`Permanently delete "${docObj.title}"?`)) return;
    if (!docObj.ownerId) return alert("Owner data missing.");
    setIsLoading(true);
    try {
      await deleteDoc(doc(db, 'users', docObj.ownerId, 'documents', docObj.id));
      fetchUniversalVault();
    } catch (err) { alert("Deletion failed."); } finally { setIsLoading(false); }
  };

  const handleToggleRole = async (targetUserId: string, currentRole: string | undefined) => {
    if (targetUserId === primaryAuth.currentUser?.uid) return alert("Operation forbidden.");
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Switch role to ${newRole}?`)) return;
    setIsLoading(true);
    await updateDoc(doc(db, 'users', targetUserId), { role: newRole });
    await fetchAdminData();
  };

  const handleDeleteUser = async (targetUserId: string, email: string | null) => {
    if (targetUserId === primaryAuth.currentUser?.uid) return alert("Operation forbidden.");
    if (!window.confirm(`Delete ${email}? This only removes the Firestore profile.`)) return;
    setIsLoading(true);
    try {
      await deleteDoc(doc(db, 'users', targetUserId));
      fetchAdminData();
    } catch (err: any) { alert(err.message); } finally { setIsLoading(false); }
  };

  const filteredDocs = allDocuments.filter(d => 
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.ownerEmail?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Admin <span className="text-lavender-600">Intelligence</span></h2>
          <p className="text-gray-500 text-sm font-medium">Universal oversight of all platform activity and intellectual property.</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => { setCreatedCredentials(null); setCreateError(null); setShowCreateModal(true); }}>
            <i className="fas fa-user-plus mr-2"></i> Register User
          </Button>
          <Button onClick={activeTab === 'USERS' ? fetchAdminData : fetchUniversalVault} variant="secondary" className="bg-white">
            <i className="fas fa-sync-alt"></i>
          </Button>
        </div>
      </div>

      <div className="flex border-b border-gray-100">
        <button 
          onClick={() => setActiveTab('USERS')}
          className={`px-8 py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'USERS' ? 'border-lavender-600 text-lavender-600 bg-lavender-50/30' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          User Directory
        </button>
        <button 
          onClick={() => setActiveTab('UNIVERSAL_VAULT')}
          className={`px-8 py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'UNIVERSAL_VAULT' ? 'border-lavender-600 text-lavender-600 bg-lavender-50/30' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          Universal Vault
        </button>
      </div>

      {activeTab === 'USERS' ? (
        <Card className="p-0 overflow-hidden border-gray-100 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b">
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400">Researcher</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400">Permissions</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map(u => (
                  <tr key={u.uid} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-lavender-600 text-white flex items-center justify-center font-bold text-xs">
                          {u.email?.[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{u.displayName || 'Unknown'}</p>
                          <p className="text-[10px] text-lavender-600 font-black uppercase">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[8px] font-black uppercase ${u.role === 'admin' ? 'bg-lavender-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                        {u.role || 'user'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button onClick={() => inspectUser(u.uid, u.email || '', u.role || 'user', u.password)} className="text-[10px] font-black uppercase text-lavender-600">Inspect</button>
                      <button onClick={() => handleDeleteUser(u.uid, u.email)} className="text-[10px] font-black uppercase text-red-500">Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
              <input 
                type="text"
                placeholder="Search across all user files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-lavender-500 outline-none"
              />
            </div>
            <div className="bg-lavender-50 px-6 py-3 rounded-2xl flex items-center">
              <span className="text-[10px] font-black uppercase text-lavender-600 tracking-widest">Total Assets: {allDocuments.length}</span>
            </div>
          </div>

          <Card className="p-0 overflow-hidden border-gray-100 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 border-b">
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400">Document</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400">Owner</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400">Created</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 text-right">Oversight</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredDocs.map(d => (
                    <tr key={d.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <i className="fas fa-file-lines text-lavender-500"></i>
                          <span className="font-bold text-sm text-gray-900">{d.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-gray-600">{d.ownerEmail || 'Unknown'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{new Date(d.createdAt).toLocaleDateString()}</span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-3">
                        <button 
                          onClick={() => onScanDocument?.(d.content)} 
                          className="text-[10px] font-black uppercase text-lavender-600 hover:text-lavender-800"
                        >
                          Scan Content
                        </button>
                        <button 
                          onClick={() => handleDeleteDoc(d)} 
                          className="text-[10px] font-black uppercase text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-sm">
          <Card className="w-full max-w-md shadow-2xl rounded-[2.5rem] border-none p-0 overflow-hidden">
            {createdCredentials ? (
              <div className="p-8 space-y-6">
                <div className="text-center">
                   <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4"><i className="fas fa-check"></i></div>
                   <h3 className="text-lg font-black uppercase tracking-tight">Account Configured</h3>
                </div>
                <div className="space-y-4">
                   <div className="p-4 bg-gray-50 rounded-2xl border">
                      <p className="text-[9px] font-black uppercase text-gray-400">Email</p>
                      <p className="text-sm font-mono">{createdCredentials.email}</p>
                   </div>
                   <div className="p-4 bg-gray-50 rounded-2xl border">
                      <p className="text-[9px] font-black uppercase text-gray-400">Temporary Password</p>
                      <div className="flex justify-between items-center">
                         <p className="text-sm font-mono font-bold text-lavender-600">{createdCredentials.pass}</p>
                         <button onClick={() => navigator.clipboard.writeText(createdCredentials.pass)} className="text-lavender-500 hover:text-lavender-700">
                           <i className="fas fa-copy"></i>
                         </button>
                      </div>
                   </div>
                </div>
                <Button onClick={() => setShowCreateModal(false)} className="w-full">Dismiss</Button>
              </div>
            ) : (
              <form onSubmit={handleCreateUser} className="p-8 space-y-4">
                <h3 className="text-xl font-black uppercase tracking-tight mb-4">System Registration</h3>
                <Input label="Name" required value={newName} onChange={(e) => setNewName(e.target.value)} />
                <Input label="Email" type="email" required value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
                <Input label="Password" type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                {createError && <p className="text-[10px] font-black text-red-500 uppercase">{createError}</p>}
                <Button type="submit" isLoading={isCreating} className="w-full">Authorize Account</Button>
                <Button variant="ghost" onClick={() => setShowCreateModal(false)} className="w-full">Cancel</Button>
              </form>
            )}
          </Card>
        </div>
      )}

      {selectedUserDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <Card className="w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col p-0 shadow-2xl rounded-[2.5rem] border-none bg-white">
            <div className="p-8 bg-gray-900 text-white flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-lavender-600 rounded-2xl flex items-center justify-center text-xl font-bold">
                  {selectedUserDetail.email[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold uppercase tracking-tight">Audit Trail</h3>
                  <p className="text-xs text-lavender-400 font-semibold uppercase tracking-widest">{selectedUserDetail.email}</p>
                </div>
              </div>
              <button onClick={() => setSelectedUserDetail(null)} className="text-white/60 hover:text-white"><i className="fas fa-times"></i></button>
            </div>
            
            <div className="flex bg-gray-100 p-1">
              {['SECURITY', 'SCANS', 'FILES'].map((v: any) => (
                <button key={v} onClick={() => setSelectedUserDetail({...selectedUserDetail, view: v})} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${selectedUserDetail.view === v ? 'bg-white text-lavender-600 shadow-sm rounded-xl' : 'text-gray-400'}`}>{v}</button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-8 scrollbar-thin">
              {focusedScan ? (
                <div className="space-y-6 animate-in slide-in-from-right-4">
                   <button onClick={() => setFocusedScan(null)} className="text-[10px] font-black uppercase text-lavender-600"><i className="fas fa-arrow-left mr-2"></i> Back</button>
                   <div className="bg-gray-900 text-lavender-100 p-8 rounded-[2rem] font-mono italic text-sm">"{focusedScan.text}"</div>
                   <div className="space-y-3">
                     {focusedScan.result.sources.map((s, i) => {
                       const isVault = s.url?.startsWith('internal://vault/');
                       const isExternal = s.url && !s.url.startsWith('internal://');
                       return (
                         <div key={i} className="p-4 border rounded-2xl flex justify-between items-center text-xs bg-white shadow-sm hover:border-lavender-200 transition-colors">
                           <div className="flex-1 truncate mr-4">
                             <div className="flex items-center space-x-2">
                               {isVault && <i className="fas fa-database text-[10px] text-lavender-500"></i>}
                               <span className="font-bold block truncate">{s.title}</span>
                             </div>
                             {isExternal ? (
                               <a 
                                 href={s.url} 
                                 target="_blank" 
                                 rel="noopener noreferrer" 
                                 className="text-lavender-600 hover:underline flex items-center mt-1 font-medium"
                               >
                                 <i className="fas fa-external-link-alt text-[8px] mr-1.5 opacity-70"></i>
                                 {s.url}
                               </a>
                             ) : isVault ? (
                               <button 
                                 onClick={() => handleViewVaultFile(s.url)}
                                 className="text-lavender-600 hover:text-lavender-800 font-black uppercase text-[8px] mt-1 flex items-center tracking-widest"
                               >
                                 <i className="fas fa-eye mr-1.5"></i> View Original Document
                               </button>
                             ) : (
                               <span className="text-gray-400 italic text-[10px] mt-1 block">{s.url || 'Internal Asset'}</span>
                             )}
                           </div>
                           <span className={`px-2 py-1 rounded font-black shrink-0 ${s.score > 70 ? 'bg-red-50 text-red-600' : 'bg-lavender-50 text-lavender-600'}`}>
                            {s.score}% Match
                           </span>
                         </div>
                       );
                     })}
                   </div>
                </div>
              ) : focusedDoc ? (
                <div className="space-y-6 animate-in slide-in-from-right-4">
                  <div className="flex items-center justify-between">
                    <button onClick={() => setFocusedDoc(null)} className="text-[10px] font-black uppercase text-lavender-600"><i className="fas fa-arrow-left mr-2"></i> Back</button>
                    <button 
                      onClick={() => downloadFile(focusedDoc)} 
                      className="text-[10px] font-black uppercase text-gray-500 hover:text-lavender-600 flex items-center bg-gray-50 px-3 py-1.5 rounded-lg border"
                    >
                      <i className="fas fa-download mr-1.5"></i> Download TXT
                    </button>
                  </div>
                  <div className="bg-white p-8 rounded-[2rem] border border-gray-100 font-medium text-gray-700 whitespace-pre-wrap leading-relaxed">{focusedDoc.content}</div>
                </div>
              ) : (
                <div className="space-y-4">
                   {selectedUserDetail.view === 'SECURITY' && (
                     <div className="space-y-6">
                        <div className="bg-lavender-900 text-white p-6 rounded-[2rem]">
                          <p className="text-xs font-bold text-lavender-300 uppercase mb-2">Audit Credentials</p>
                          <div className="space-y-3">
                             <div>
                                <p className="text-[8px] font-black text-lavender-400 uppercase tracking-[0.2em] mb-0.5">Primary Email</p>
                                <p className="font-mono text-sm text-black">{selectedUserDetail.email}</p>
                             </div>
                             <div>
                                <p className="text-[8px] font-black text-lavender-400 uppercase tracking-[0.2em] mb-0.5">Login Password</p>
                                <p className="font-mono text-xl tracking-widest text-black">{selectedUserDetail.password || 'HIDDEN'}</p>
                             </div>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <Button onClick={() => handleToggleRole(selectedUserDetail.userId, selectedUserDetail.role)} className="flex-1">Toggle Admin</Button>
                          <Button onClick={() => handleDeleteUser(selectedUserDetail.userId, selectedUserDetail.email)} variant="danger" className="flex-1">Delete Profile</Button>
                        </div>
                     </div>
                   )}
                   {selectedUserDetail.view === 'SCANS' && selectedUserDetail.scans.map(s => (
                     <div key={s.id} onClick={() => setFocusedScan(s)} className="p-4 border border-gray-100 rounded-2xl hover:bg-lavender-50 cursor-pointer flex justify-between group transition-all">
                       <span className="text-xs font-medium truncate italic flex-1 mr-4">"{s.text.slice(0, 60)}..."</span>
                       <div className="flex items-center space-x-3">
                         <span className="text-xs font-black text-lavender-600">{s.result.score}%</span>
                         <i className="fas fa-chevron-right text-gray-200 group-hover:text-lavender-400 text-[10px]"></i>
                       </div>
                     </div>
                   ))}
                   {selectedUserDetail.view === 'FILES' && selectedUserDetail.docs.map(d => (
                     <div key={d.id} className="p-4 border border-gray-100 rounded-2xl hover:bg-lavender-50 flex justify-between items-center group transition-all">
                       <div className="flex-1 cursor-pointer" onClick={() => setFocusedDoc(d)}>
                         <span className="text-xs font-bold block text-gray-900">{d.title}</span>
                         <span className="text-[10px] text-gray-400 font-bold uppercase">{new Date(d.createdAt).toLocaleDateString()}</span>
                       </div>
                       <div className="flex items-center space-x-2">
                         <button 
                            onClick={() => downloadFile(d)}
                            className="p-2 text-gray-300 hover:text-lavender-600 transition-colors"
                            title="Download File"
                         >
                            <i className="fas fa-download text-xs"></i>
                         </button>
                         <button 
                            onClick={() => setFocusedDoc(d)}
                            className="p-2 text-gray-300 hover:text-lavender-600 transition-colors"
                            title="View Content"
                         >
                            <i className="fas fa-eye text-xs"></i>
                         </button>
                       </div>
                     </div>
                   ))}
                </div>
              )}
            </div>
            <div className="p-6 border-t flex justify-end">
              <Button onClick={() => setSelectedUserDetail(null)} variant="secondary">Exit Audit</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
