"use client";

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { User, Phone, AtSign, CheckCircle2, ArrowRight } from 'lucide-react';

const AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Mimi',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver',
];

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const profile = {
      name,
      username,
      phoneNumber: phone,
      photoURL: selectedAvatar,
      balance: 0,
      createdAt: new Date().toISOString()
    };

    // Save to localStorage to mock the backend persistence
    localStorage.setItem('taskxearn_profile', JSON.stringify(profile));
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden"
      >
        <div className="bg-indigo-600 p-6 text-white text-center">
          <h1 className="text-2xl font-bold mb-2">Create Your Profile</h1>
          <p className="text-indigo-100 text-sm">Set up your account to start earning</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Profile Picture Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">Choose an Avatar</label>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {AVATARS.map((avatar, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`relative shrink-0 rounded-full p-1 transition-all ${
                    selectedAvatar === avatar ? 'bg-indigo-600' : 'bg-transparent hover:bg-slate-100'
                  }`}
                >
                  <img src={avatar} alt={`Avatar ${idx + 1}`} className="w-14 h-14 rounded-full bg-slate-100" />
                  {selectedAvatar === avatar && (
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                      <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Inputs */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <AtSign className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                  placeholder="johndoe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number (For Withdrawals)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                  placeholder="+265 999 999 999"
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">This number will be locked for your withdrawals to ensure security.</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !name || !username || !phone}
            className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
          >
            {isSubmitting ? 'Creating Profile...' : 'Complete Signup'}
            {!isSubmitting && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
