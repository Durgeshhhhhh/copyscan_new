
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-charcoal-900/80 backdrop-blur-xl animate-in fade-in duration-300">
      <Card className="w-full max-w-md border-none shadow-[0_0_50px_-12px_rgba(124,58,237,0.2)] relative bg-white/98 backdrop-blur-md rounded-2xl overflow-hidden">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-9 h-9 rounded-full bg-charcoal-100 flex items-center justify-center text-charcoal-500 hover:text-charcoal-800 hover:bg-charcoal-200 transition-all duration-200 z-10"
        >
          <i className="fas fa-times text-sm"></i>
        </button>

        <div className="p-10 md:p-12">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-lavender-600 rounded-2xl mb-6 text-white shadow-md shadow-lavender-500/20">
              <i className="fas fa-fingerprint text-2xl"></i>
            </div>
            <h2 className="text-3xl font-bold text-charcoal-800 tracking-tight">
              Sign In
            </h2>
            <p className="text-charcoal-600 mt-3 text-sm font-normal">
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
              className="h-12 rounded-xl border-charcoal-200 focus:ring-lavender-500"
            />
            
            <Input 
              label="Password" 
              type="password" 
              placeholder="••••••••" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 rounded-xl border-charcoal-200 focus:ring-lavender-500"
            />

            {error && (
              <div className="p-4 rounded-xl flex items-center space-x-3 text-sm bg-red-50 text-red-700 border border-red-200 animate-in slide-in-from-top-2">
                <i className="fas fa-exclamation-circle"></i>
                <span className="font-medium">{error}</span>
              </div>
            )}

            <Button type="submit" isLoading={localLoading} className="w-full h-14 text-sm font-medium tracking-wide bg-lavender-600 hover:bg-lavender-700 shadow-md shadow-lavender-500/20 mt-4 rounded-xl border-none">
              Authorize Login
            </Button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wide leading-relaxed">
              Restricted Access • Managed by Administrator
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
