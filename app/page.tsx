'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wallet, 
  PlaySquare, 
  CalendarCheck, 
  FileText, 
  ArrowRight, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  X,
  Smartphone,
  Banknote,
  WifiOff
} from 'lucide-react';

const formatMWK = (amount: number) => {
  // Hardcode the MK symbol to prevent server/client hydration mismatches
  // caused by different Intl.NumberFormat implementations across environments.
  return `MK ${new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`;
};

type TaskCategory = 'Video Ads' | 'Surveys' | 'Daily Tasks';

type Task = {
  id: string;
  title: string;
  reward: number;
  icon: React.ElementType;
  completed: boolean;
  category: TaskCategory;
};

const INITIAL_TASKS: Task[] = [
  { id: '1', title: 'Watch Video Ad', reward: 50, icon: PlaySquare, completed: false, category: 'Video Ads' },
  { id: '2', title: 'Daily Check-in', reward: 50, icon: CalendarCheck, completed: false, category: 'Daily Tasks' },
  { id: '3', title: 'Complete Survey', reward: 150, icon: FileText, completed: false, category: 'Surveys' },
  { id: '4', title: 'Watch App Promo', reward: 60, icon: PlaySquare, completed: false, category: 'Video Ads' },
];

export default function Home() {
  const [balance, setBalance] = useState(0);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Video Ads', 'Surveys', 'Daily Tasks'];

  // Network status listener
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    setIsOffline(!navigator.onLine);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleTaskClick = async (task: Task) => {
    if (task.completed || loadingTaskId || isOffline) return;

    setLoadingTaskId(task.id);

    // Simulate network request with basic error handling for slow internet
    try {
      // Simulate delay (1.5s to 3s)
      const delay = Math.floor(Math.random() * 1500) + 1500;
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // 10% chance to fail to simulate bad connection
          if (Math.random() > 0.9) {
            reject(new Error('Network timeout'));
          } else {
            resolve(true);
          }
        }, delay);
      });

      setBalance((prev) => prev + task.reward);
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, completed: true } : t))
      );
    } catch (error) {
      alert('Connection is slow or failed. Please try again.');
    } finally {
      setLoadingTaskId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24">
      {/* Header */}
      <header className="bg-indigo-600 text-white p-6 rounded-b-3xl shadow-lg">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold tracking-tight">TaskxEarn MW</h1>
            <div className="bg-indigo-500/50 p-2 rounded-full">
              <Wallet size={24} />
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <p className="text-indigo-100 text-sm font-medium mb-1">Total Balance</p>
            <h2 className="text-4xl font-bold mb-4">{formatMWK(balance)}</h2>
            <button 
              onClick={() => setIsWithdrawing(true)}
              disabled={balance === 0 || isOffline}
              className="w-full bg-white text-indigo-600 font-semibold py-3 rounded-xl shadow-sm hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Banknote size={20} />
              Withdraw Funds
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto p-6">
        {isOffline && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex items-center gap-3 border border-red-100"
          >
            <WifiOff size={20} />
            <p className="text-sm font-medium">You are offline. Please check your internet connection.</p>
          </motion.div>
        )}

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800">Available Tasks</h3>
          <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            {tasks.filter(t => !t.completed && (selectedCategory === 'All' || t.category === selectedCategory)).length} remaining
          </span>
        </div>

        {/* Categories Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {tasks.filter(t => selectedCategory === 'All' || t.category === selectedCategory).map((task) => (
            <motion.button
              key={task.id}
              whileHover={{ scale: task.completed ? 1 : 1.02 }}
              whileTap={{ scale: task.completed ? 1 : 0.98 }}
              onClick={() => handleTaskClick(task)}
              disabled={task.completed || loadingTaskId !== null || isOffline}
              className={`w-full flex items-center p-4 rounded-2xl border transition-all ${
                task.completed 
                  ? 'bg-slate-100 border-slate-200 opacity-70' 
                  : 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200'
              }`}
            >
              <div className={`p-3 rounded-xl mr-4 ${
                task.completed ? 'bg-slate-200 text-slate-500' : 'bg-indigo-100 text-indigo-600'
              }`}>
                <task.icon size={24} />
              </div>
              
              <div className="flex-1 text-left">
                <h4 className={`font-semibold ${task.completed ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                  {task.title}
                </h4>
                <p className={`text-sm font-medium ${task.completed ? 'text-slate-400' : 'text-emerald-600'}`}>
                  +{formatMWK(task.reward)}
                </p>
              </div>

              <div className="ml-4">
                {loadingTaskId === task.id ? (
                  <Loader2 className="animate-spin text-indigo-600" size={24} />
                ) : task.completed ? (
                  <CheckCircle2 className="text-emerald-500" size={24} />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200">
                    <ArrowRight size={16} className="text-slate-400" />
                  </div>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </main>

      {/* Adsterra Banner Placeholder */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-2 z-10">
        <div className="max-w-md mx-auto h-16 bg-slate-100 border border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400">
          <span className="text-xs font-semibold uppercase tracking-wider mb-1">Advertisement</span>
          <span className="text-[10px]">Adsterra Banner Space (320x50)</span>
        </div>
      </div>

      {/* Withdraw Modal */}
      <AnimatePresence>
        {isWithdrawing && (
          <WithdrawModal 
            balance={balance} 
            onClose={() => setIsWithdrawing(false)} 
            onSuccess={() => {
              setBalance(0);
              setIsWithdrawing(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function WithdrawModal({ balance, onClose, onSuccess }: { balance: number, onClose: () => void, onSuccess: () => void }) {
  const [provider, setProvider] = useState<'airtel' | 'tnm' | null>(null);
  const [phone, setPhone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!provider) {
      setError('Please select a mobile money provider');
      return;
    }

    if (phone.length < 9) {
      setError('Please enter a valid phone number');
      return;
    }

    setIsProcessing(true);

    try {
      // --- PAYCHANGU API PLACEHOLDER ---
      // This is where the PayChangu Payout API integration goes.
      // 
      // API Endpoint: POST https://api.paychangu.com/mobile-money/payouts/initialize
      // 
      // Headers:
      // Authorization: Bearer YOUR_PAYCHANGU_SECRET_KEY
      // Accept: application/json
      // Content-Type: application/json
      //
      // Body:
      // {
      //   "amount": balance,
      //   "currency": "MWK",
      //   "mobile": phone,
      //   "mobile_money_operator_ref_id": provider === 'airtel' ? "AIRTEL_MONEY_REF" : "TNM_MPAMBA_REF",
      //   "narration": "TaskEarn Payout",
      //   "charge_bearer": "merchant"
      // }
      
      // Simulating API call
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() > 0.9) {
            reject(new Error('Network timeout'));
          } else {
            resolve(true);
          }
        }, 2000);
      });
      
      alert(`Success! ${formatMWK(balance)} has been sent to your ${provider === 'airtel' ? 'Airtel Money' : 'TNM Mpamba'} account (+265 ${phone}).`);
      onSuccess();
    } catch (err) {
      setError('Transaction failed. Please check your connection and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-900">Withdraw Funds</h3>
            <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="bg-indigo-50 rounded-2xl p-4 mb-6 text-center border border-indigo-100">
            <p className="text-indigo-600 text-sm font-medium mb-1">Available to Withdraw</p>
            <p className="text-3xl font-bold text-indigo-900">{formatMWK(balance)}</p>
          </div>

          <form onSubmit={handleWithdraw} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Select Provider</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setProvider('airtel')}
                  className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                    provider === 'airtel' 
                      ? 'border-red-500 bg-red-50 text-red-700' 
                      : 'border-slate-200 bg-white text-slate-600 hover:border-red-200'
                  }`}
                >
                  <Smartphone size={24} className={provider === 'airtel' ? 'text-red-500' : ''} />
                  <span className="font-semibold text-sm">Airtel Money</span>
                </button>
                <button
                  type="button"
                  onClick={() => setProvider('tnm')}
                  className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                    provider === 'tnm' 
                      ? 'border-green-500 bg-green-50 text-green-700' 
                      : 'border-slate-200 bg-white text-slate-600 hover:border-green-200'
                  }`}
                >
                  <Smartphone size={24} className={provider === 'tnm' ? 'text-green-500' : ''} />
                  <span className="font-semibold text-sm">TNM Mpamba</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">+265</span>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="88X XXX XXX"
                  className="w-full pl-16 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium"
                  maxLength={9}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm font-medium">
                <AlertCircle size={16} />
                <p>{error}</p>
              </div>
            )}

            <button 
              type="submit"
              disabled={isProcessing || !provider || phone.length < 9}
              className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 mt-4"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Processing...
                </>
              ) : (
                'Confirm Withdrawal'
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
