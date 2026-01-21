
import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { deleteUser, updateProfile } from 'firebase/auth';
import { db, auth } from '../firebase';
import { UserProfile } from '../types';
import { Button, Input, Card } from './UI';

interface ProfileProps {
  user: UserProfile;
}

export const Profile: React.FC<ProfileProps> = ({ user }) => {
  const [firestoreData, setFirestoreData] = useState<any>(null);
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setFirestoreData(data);
        setName(data.name || '');
      }
    };
    fetchUserData();
  }, [user.uid]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { name });
      
      const currentUser = auth.currentUser;
      if (currentUser) {
        await updateProfile(currentUser, { displayName: name });
      }
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Failed to update profile: ' + err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you absolutely sure? This will permanently delete your account and all data. This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'users', user.uid));
      const currentUser = auth.currentUser;
      if (currentUser) {
        await deleteUser(currentUser);
      }
    } catch (err: any) {
      alert("Error deleting account: " + err.message + ". You might need to re-authenticate for this operation.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4 mb-8">
        <div className="relative">
          <img 
            src={user.photoURL || `https://ui-avatars.com/api/?name=${name || user.email}&background=2563eb&color=fff`} 
            alt="Profile" 
            className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover"
          />
          <div className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full text-white shadow-sm border-2 border-white">
            <i className="fas fa-camera text-xs"></i>
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <h2 className="text-3xl font-bold text-gray-900">{name || 'User'}</h2>
            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest shadow-sm ${user.role === 'admin' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
              {user.role || 'user'}
            </span>
          </div>
          <p className="text-gray-500 font-medium">{user.email}</p>
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Profile Information</h3>
          {user.role === 'admin' && (
            <div className="flex items-center space-x-2 text-purple-600">
              <i className="fas fa-shield-check"></i>
              <span className="text-[10px] font-black uppercase tracking-widest">Admin Privileges Active</span>
            </div>
          )}
        </div>
        
        <form onSubmit={handleUpdate} className="space-y-6">
          <Input 
            label="Display Name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Your name"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-gray-700">Email Address</p>
              <p className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 select-none">
                {user.email}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-gray-700">Account ID</p>
              <p className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-400 select-none font-mono text-xs overflow-hidden text-ellipsis">
                {user.uid}
              </p>
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-xl flex items-center space-x-2 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              <i className={`fas ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
              <span>{message.text}</span>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <Button type="submit" isLoading={isLoading}>
              Save Changes
            </Button>
          </div>
        </form>
      </Card>

      <Card className="border-red-100 bg-red-50/30">
        <div className="flex items-start space-x-4">
          <div className="bg-red-100 p-3 rounded-xl text-red-600">
            <i className="fas fa-triangle-exclamation text-xl"></i>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-red-900">Danger Zone</h3>
            <p className="text-red-700/70 text-sm mt-1">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <div className="mt-4">
              <Button 
                variant="danger" 
                onClick={handleDeleteAccount} 
                isLoading={isDeleting}
              >
                Delete My Account
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
