import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { Layout } from './components/Layout';
import { AuthForms } from './components/AuthForms';
import { LandingPage } from './components/LandingPage';
import { Home } from './components/Home';
import { PlagiarismChecker } from './components/PlagiarismChecker';
import { TextComparison } from './components/TextComparison';
import { Vault } from './components/Vault';
import { Profile } from './components/Profile';
import { AdminPanel } from './components/AdminPanel';
import { ScanHistory } from './components/ScanHistory';
import { UserProfile, AppView } from './types';
import { LoadingProvider } from './components/LoadingContext';

const AppContent: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [currentView, setCurrentView] = useState<AppView>('HOME');
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const [scanContent, setScanContent] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        const userData = userDoc.data();
        
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          role: userData?.role || 'user',
        });
        setShowAuthModal(false); // Close modal on success
      } else {
        setUser(null);
        setCurrentView('HOME');
      }
      setInitializing(false);
    });

    return () => unsubscribe();
  }, []);

  const handleScanFromVault = (content: string) => {
    setScanContent(content);
    setCurrentView('SCANNER');
  };

  const handleViewChange = (view: AppView) => {
    if (view !== 'SCANNER') {
      setScanContent(null);
    }
    setCurrentView(view);
  };

  if (initializing) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-white">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-50 rounded-full"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <div className="mt-8 text-center">
          <h1 className="text-xl font-black text-gray-900 tracking-tighter italic">CopyScan</h1>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Securing Intellectual Property</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <LandingPage onLoginClick={() => setShowAuthModal(true)} />
        {showAuthModal && (
          <AuthForms onClose={() => setShowAuthModal(false)} />
        )}
      </>
    );
  }

  return (
    <Layout user={user} currentView={currentView} onViewChange={handleViewChange}>
      {currentView === 'HOME' && <Home user={user} onViewChange={handleViewChange} />}
      {currentView === 'SCANNER' && (
        <PlagiarismChecker 
          key={scanContent ? 'prefilled' : 'empty'} 
          initialText={scanContent || ''} 
          autoScan={!!scanContent}
        />
      )}
      {currentView === 'COMPARISON' && <TextComparison />}
      {currentView === 'VAULT' && <Vault user={user} onScanDocument={handleScanFromVault} />}
      {currentView === 'HISTORY' && <ScanHistory user={user} />}
      {currentView === 'PROFILE' && <Profile user={user} />}
      {currentView === 'ADMIN' && user.role === 'admin' && (
        <AdminPanel onScanDocument={handleScanFromVault} />
      )}
    </Layout>
  );
};

const App: React.FC = () => (
  <LoadingProvider>
    <AppContent />
  </LoadingProvider>
);

export default App;