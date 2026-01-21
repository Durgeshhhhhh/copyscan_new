
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { Button, Input, Card } from './UI';
import { useLoading } from './LoadingContext';

interface AuthFormsProps {
  onClose: () => void;
}

export const AuthForms: React.FC<AuthFormsProps> = ({ onClose }) => {
  const { setIsLoading } = useLoading();
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLocalLoading(true);
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      onClose();
    } catch (err: any) {
      console.error("Auth Error:", err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError("Invalid credentials. Please verify your details.");
      } else {
        setError("Authentication failed. Please check your connection.");
      }
    } finally {
      setLocalLoading(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
      <Card className="w-full max-w-md border-none shadow-[0_0_50px_-12px_rgba(79,70,229,0.3)] relative bg-white/95 backdrop-blur-md rounded-[2.5rem] overflow-hidden">
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all z-10"
        >
          <i className="fas fa-times text-xs"></i>
        </button>

        <div className="p-10 md:p-12">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-indigo-600 to-cyan-400 rounded-3xl mb-6 text-white shadow-xl shadow-indigo-500/30">
              <i className="fas fa-fingerprint text-2xl"></i>
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Sign In
            </h2>
            <p className="text-slate-500 mt-3 text-sm font-medium">
              Access your CopyScan workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input 
              label="Email Address" 
              type="email" 
              placeholder="name@company.com" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-2xl border-slate-200 focus:ring-indigo-600"
            />
            
            <Input 
              label="Password" 
              type="password" 
              placeholder="••••••••" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 rounded-2xl border-slate-200 focus:ring-indigo-600"
            />

            {error && (
              <div className="p-4 rounded-2xl flex items-center space-x-3 text-xs bg-red-50 text-red-600 border border-red-100 animate-in slide-in-from-top-2">
                <i className="fas fa-exclamation-circle"></i>
                <span className="font-bold uppercase tracking-tight">{error}</span>
              </div>
            )}

            <Button type="submit" isLoading={localLoading} className="w-full h-14 text-sm font-black tracking-widest uppercase bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 shadow-xl shadow-indigo-200/50 mt-4 rounded-2xl border-none">
              Authorize Login
            </Button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
              Restricted Access • Managed by Administrator
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
