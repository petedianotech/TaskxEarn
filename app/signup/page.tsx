"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import { User, Phone, AtSign, CheckCircle2, ArrowRight, Mail, KeyRound, Loader2, Gift } from 'lucide-react';
import { useAuth } from "@/components/auth-provider";
import { db } from "@/firebase";
import { doc, setDoc, getDoc, writeBatch, increment } from "firebase/firestore";

const AVATARS = [
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23FFEDD5"/><path d="M20 100 Q50 60 80 100" fill="%233B82F6"/><circle cx="50" cy="45" r="22" fill="%23FDBA74"/><path d="M28 35 Q50 15 72 35 L70 45 Q50 30 30 45 Z" fill="%231E293B"/><circle cx="42" cy="42" r="2.5" fill="%231E293B"/><circle cx="58" cy="42" r="2.5" fill="%231E293B"/><path d="M45 52 Q50 58 55 52" stroke="%231E293B" stroke-width="2.5" stroke-linecap="round" fill="none"/></svg>',
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23E0E7FF"/><path d="M20 100 Q50 60 80 100" fill="%2310B981"/><circle cx="50" cy="45" r="22" fill="%23FCD34D"/><path d="M25 40 Q50 10 75 40 Q60 25 50 25 Q40 25 25 40 Z" fill="%2378350F"/><circle cx="30" cy="35" r="8" fill="%2378350F"/><circle cx="45" cy="25" r="10" fill="%2378350F"/><circle cx="60" cy="28" r="9" fill="%2378350F"/><circle cx="70" cy="38" r="7" fill="%2378350F"/><rect x="34" y="38" width="14" height="10" rx="3" stroke="%231E293B" stroke-width="2" fill="none"/><rect x="52" y="38" width="14" height="10" rx="3" stroke="%231E293B" stroke-width="2" fill="none"/><line x1="48" y1="43" x2="52" y2="43" stroke="%231E293B" stroke-width="2"/><path d="M46 54 Q50 57 54 54" stroke="%231E293B" stroke-width="2.5" stroke-linecap="round" fill="none"/></svg>',
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23FCE7F3"/><path d="M25 45 Q50 10 75 45 L80 80 Q50 90 20 80 Z" fill="%23451A03"/><path d="M20 100 Q50 60 80 100" fill="%23EC4899"/><circle cx="50" cy="45" r="20" fill="%23FDBA74"/><path d="M30 40 Q50 25 70 40" fill="%23451A03"/><circle cx="42" cy="42" r="2.5" fill="%231E293B"/><circle cx="58" cy="42" r="2.5" fill="%231E293B"/><path d="M45 52 Q50 58 55 52" stroke="%231E293B" stroke-width="2.5" stroke-linecap="round" fill="none"/><circle cx="38" cy="48" r="4" fill="%23FCA5A5" opacity="0.6"/><circle cx="62" cy="48" r="4" fill="%23FCA5A5" opacity="0.6"/></svg>',
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23FEF3C7"/><path d="M20 100 Q50 60 80 100" fill="%238B5CF6"/><path d="M25 50 Q50 15 75 50 L75 65 Q50 75 25 65 Z" fill="%231E293B"/><circle cx="50" cy="45" r="20" fill="%23FCD34D"/><path d="M30 45 Q50 30 70 45" fill="%231E293B"/><circle cx="42" cy="42" r="2.5" fill="%231E293B"/><circle cx="58" cy="42" r="2.5" fill="%231E293B"/><path d="M46 53 Q50 56 54 53" stroke="%231E293B" stroke-width="2.5" stroke-linecap="round" fill="none"/><circle cx="38" cy="48" r="4" fill="%23FCA5A5" opacity="0.6"/><circle cx="62" cy="48" r="4" fill="%23FCA5A5" opacity="0.6"/></svg>',
];

export default function SignupPage() {
  const router = useRouter();
  const { user, profile, loading, signInWithGoogle, setupRecaptcha, signInWithPhone } = useAuth();
  
  // Auth State
  const [authMethod, setAuthMethod] = useState<'select' | 'phone' | 'verify'>('select');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Profile State
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refUid, setRefUid] = useState<string | null>(null);
  const [inviterName, setInviterName] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRefUid(params.get('ref'));
  }, []);

  useEffect(() => {
    const fetchInviter = async () => {
      if (user && refUid) {
        try {
          const inviterDoc = await getDoc(doc(db, 'users', refUid));
          if (inviterDoc.exists()) {
            setInviterName(inviterDoc.data().name);
          }
        } catch (err) {
          console.error("Failed to fetch inviter", err);
        }
      }
    };
    fetchInviter();
  }, [user, refUid]);

  useEffect(() => {
    if (!loading && user && profile) {
      router.push('/');
    }
    if (user && !profilePhone && user.phoneNumber) {
      setProfilePhone(user.phoneNumber);
    }
    if (user && !name && user.displayName) {
      setName(user.displayName);
    }
  }, [user, profile, loading, router, profilePhone, name]);

  useEffect(() => {
    if (authMethod === 'phone') {
      setupRecaptcha('recaptcha-container');
    }
  }, [authMethod, setupRecaptcha]);

  const handleGoogleSignIn = async () => {
    try {
      setIsAuthenticating(true);
      setAuthError('');
      await signInWithGoogle();
    } catch (error: any) {
      setAuthError(error.message || 'Failed to sign in with Google');
      setIsAuthenticating(false);
    }
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsAuthenticating(true);
      setAuthError('');
      const result = await signInWithPhone(phoneNumber);
      setConfirmationResult(result);
      setAuthMethod('verify');
    } catch (error: any) {
      setAuthError(error.message || 'Failed to send verification code');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsAuthenticating(true);
      setAuthError('');
      await confirmationResult.confirm(verificationCode);
    } catch (error: any) {
      setAuthError(error.message || 'Invalid verification code');
      setIsAuthenticating(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    setAuthError('');
    
    try {
      const batch = writeBatch(db);
      const userRef = doc(db, "users", user.uid);
      
      const profileData: any = {
        uid: user.uid,
        name,
        username,
        phoneNumber: profilePhone,
        photoURL: selectedAvatar,
        balance: 0,
        createdAt: new Date().toISOString()
      };

      if (refUid && inviterName) {
        profileData.balance = 4;
        profileData.referredBy = refUid;
        const inviterRef = doc(db, "users", refUid);
        batch.update(inviterRef, { balance: increment(5) });
      }

      batch.set(userRef, profileData);
      await batch.commit();
      // The onSnapshot listener in AuthProvider will pick this up and redirect
    } catch (error: any) {
      console.error(error);
      setAuthError(error.message || 'Failed to create profile');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden"
      >
        <div className="bg-indigo-600 p-6 text-white text-center">
          <h1 className="text-2xl font-bold mb-2">
            {!user ? 'Welcome to TaskxEarn' : 'Create Your Profile'}
          </h1>
          <p className="text-indigo-100 text-sm">
            {!user ? 'Sign in or create an account to start earning' : 'Set up your account to start earning'}
          </p>
        </div>

        <div className="p-6">
          {authError && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
              {authError}
            </div>
          )}

          {!user ? (
            <AnimatePresence mode="wait">
              {authMethod === 'select' && (
                <motion.div
                  key="select"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={isAuthenticating}
                    className="w-full bg-white border-2 border-slate-200 text-slate-700 font-bold py-4 rounded-xl hover:bg-slate-50 hover:border-indigo-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isAuthenticating ? <Loader2 className="animate-spin w-5 h-5" /> : <Mail className="w-5 h-5 text-red-500" />}
                    Continue with Google
                  </button>
                  
                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink-0 mx-4 text-slate-400 text-sm font-medium">OR</span>
                    <div className="flex-grow border-t border-slate-200"></div>
                  </div>

                  <button
                    onClick={() => setAuthMethod('phone')}
                    className="w-full bg-indigo-50 text-indigo-700 font-bold py-4 rounded-xl hover:bg-indigo-100 transition-all flex items-center justify-center gap-3"
                  >
                    <Phone className="w-5 h-5" />
                    Continue with Phone Number
                  </button>
                </motion.div>
              )}

              {authMethod === 'phone' && (
                <motion.form
                  key="phone"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleSendCode}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all text-slate-900"
                        placeholder="+265 999 999 999"
                      />
                    </div>
                  </div>
                  
                  <div id="recaptcha-container" className="flex justify-center"></div>

                  <button
                    type="submit"
                    disabled={isAuthenticating || !phoneNumber}
                    className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isAuthenticating ? <Loader2 className="animate-spin w-5 h-5" /> : 'Send Verification Code'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setAuthMethod('select')}
                    className="w-full text-slate-500 font-medium py-2 hover:text-slate-700 transition-colors text-sm"
                  >
                    Back to options
                  </button>
                </motion.form>
              )}

              {authMethod === 'verify' && (
                <motion.form
                  key="verify"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleVerifyCode}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Verification Code</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <KeyRound className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        required
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all tracking-widest text-center font-mono text-lg text-slate-900"
                        placeholder="123456"
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-2 text-center">Enter the 6-digit code sent to {phoneNumber}</p>
                  </div>

                  <button
                    type="submit"
                    disabled={isAuthenticating || verificationCode.length < 6}
                    className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isAuthenticating ? <Loader2 className="animate-spin w-5 h-5" /> : 'Verify & Continue'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setAuthMethod('phone')}
                    className="w-full text-slate-500 font-medium py-2 hover:text-slate-700 transition-colors text-sm"
                  >
                    Change phone number
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          ) : (
            <motion.form 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handleProfileSubmit} 
              className="space-y-6"
            >
              {/* Profile Picture Selection */}
              {inviterName && (
                <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium border border-emerald-100 flex items-center justify-center gap-2">
                  <Gift className="w-5 h-5" />
                  You were invited by {inviterName}! You'll get 4 points.
                </div>
              )}
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
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all text-slate-900"
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
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all text-slate-900"
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
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all text-slate-900"
                      placeholder="+265 999 999 999"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">This number will be locked for your withdrawals to ensure security.</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !name || !username || !profilePhone}
                className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : 'Complete Signup'}
                {!isSubmitting && <ArrowRight className="w-5 h-5" />}
              </button>
            </motion.form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
