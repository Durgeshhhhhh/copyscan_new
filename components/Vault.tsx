
import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, query, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { UserProfile, UserDocument } from '../types';
import { Button, Input, Card } from './UI';
import { useLoading } from './LoadingContext';
import { parseFileToText } from '../services/fileParsingService';

interface VaultProps {
  user: UserProfile;
  onScanDocument: (content: string) => void;
}

export const Vault: React.FC<VaultProps> = ({ user, onScanDocument }) => {
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoadingLocal] = useState(false);
  const [isAdding, setIsAddingLocal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setIsLoading } = useLoading();

  const fetchDocs = async () => {
    setIsLoadingLocal(true);
    setIsLoading(true);
    setError(null);
    try {
      const q = query(collection(db, 'users', user.uid, 'documents'));
      const querySnapshot = await getDocs(q);
      const docs: UserDocument[] = [];
      querySnapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() } as UserDocument);
      });
      setDocuments(docs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err: any) {
      console.error("Error fetching vault docs:", err);
      if (err.code === 'permission-denied') {
        setError("Access Denied: Please check your Firestore Security Rules.");
      } else {
        setError("Failed to load documents.");
      }
    } finally {
      setIsLoadingLocal(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [user.uid]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoadingLocal(true);
    setIsLoading(true);
    setError(null);

    try {
      const text = await parseFileToText(file);
      setContent(text);
      if (!title) {
        setTitle(file.name.split('.')[0]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to parse file.");
    } finally {
      setIsLoadingLocal(false);
      setIsLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setIsAddingLocal(true);
    setIsLoading(true);
    setError(null);
    try {
      await addDoc(collection(db, 'users', user.uid, 'documents'), {
        title,
        content,
        createdAt: new Date().toISOString(),
        serverTime: serverTimestamp(),
        ownerId: user.uid,
        ownerEmail: user.email
      });
      setTitle('');
      setContent('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchDocs();
    } catch (err: any) {
      setError("Failed to add document.");
    } finally {
      setIsAddingLocal(false);
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this document from your vault?")) return;
    setIsLoading(true);
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'documents', id));
      fetchDocs();
    } catch (err: any) {
      alert("Delete failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const getWordCount = (str: string) => str.split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Private Vault</h2>
          <p className="text-gray-500 mt-1">Your secure database for internal cross-referencing and protection.</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-400 font-medium bg-gray-100 px-3 py-1 rounded-full">
          <i className="fas fa-database text-xs"></i>
          <span>{documents.length} / 500 Documents</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start space-x-3 text-sm">
          <i className="fas fa-exclamation-triangle mt-0.5"></i>
          <div>
            <p className="font-bold">Error Processing File</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <Card className="lg:col-span-4 h-fit sticky top-24 border-indigo-100 shadow-xl shadow-indigo-500/5">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <i className="fas fa-file-upload text-indigo-600 mr-2"></i>
            Add New Content
          </h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Import File</label>
              <input 
                type="file" 
                ref={fileInputRef}
                accept=".txt,.md,.rtf,.pdf,.docx,.pptx,.ppt,.html,.htm" 
                onChange={handleFileUpload}
                className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
              />
              <p className="text-[9px] text-gray-400 mt-1">Supports PDF, Word, PowerPoint, HTML, and Text.</p>
            </div>

            <Input 
              label="Document Title" 
              placeholder="e.g. Master Thesis Final" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Content Preview</label>
              <textarea 
                className="w-full h-48 px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none text-sm leading-relaxed"
                placeholder="Paste the document text here or upload a file..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
              <div className="flex justify-end">
                <span className="text-[10px] font-bold text-gray-400 uppercase">{getWordCount(content)} words</span>
              </div>
            </div>
            
            <Button type="submit" className="w-full" isLoading={isAdding}>
              <i className="fas fa-save mr-2"></i> Save to Vault
            </Button>
          </form>
        </Card>

        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-bold text-gray-900">Stored Files</h3>
            <Button variant="ghost" onClick={fetchDocs} className="text-xs p-1 h-8 w-8">
              <i className="fas fa-sync-alt"></i>
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : documents.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {documents.map((doc) => (
                <Card key={doc.id} className="group hover:border-indigo-300 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                          <i className="fas fa-file-lines"></i>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{doc.title}</h4>
                          <div className="flex items-center space-x-3 mt-0.5 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                            <span className="flex items-center">
                              <i className="far fa-calendar mr-1"></i>
                              {new Date(doc.createdAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center">
                              <i className="fas fa-font mr-1"></i>
                              {getWordCount(doc.content)} Words
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 italic bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                        "{doc.content}"
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2 ml-4">
                      <Button 
                        onClick={() => onScanDocument(doc.content)}
                        className="text-xs py-1.5 px-3 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white border-none shadow-none"
                      >
                        <i className="fas fa-search-plus mr-1.5"></i> Scan
                      </Button>
                      <button 
                        onClick={() => handleDelete(doc.id)}
                        className="text-gray-300 hover:text-red-500 p-2 transition-colors"
                        title="Delete from vault"
                      >
                        <i className="fas fa-trash-alt text-sm"></i>
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-white border-2 border-dashed border-gray-100 rounded-2xl">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-cloud-upload-alt text-gray-300 text-2xl"></i>
              </div>
              <p className="text-gray-900 font-bold text-lg">Your Vault is Empty</p>
              <p className="text-sm text-gray-400 max-w-xs mx-auto mt-1">
                Upload PDFs, Word docs, PowerPoint slides, or Text files to protect your work.
              </p>
              <Button 
                variant="secondary" 
                className="mt-6 text-sm"
                onClick={() => fileInputRef.current?.click()}
              >
                Upload First File
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
