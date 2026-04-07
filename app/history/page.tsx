"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, History, Loader2, Calendar } from 'lucide-react';
import { useAuth } from "@/components/auth-provider";
import { db } from "@/firebase";
import { collection, query, orderBy, getDocs } from "firebase/firestore";

type TaskHistoryItem = {
  id: string;
  taskId: string;
  title: string;
  reward: number;
  completedAt: string;
};

export default function HistoryPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [history, setHistory] = useState<TaskHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      try {
        const historyRef = collection(db, "users", user.uid, "history");
        const q = query(historyRef, orderBy("completedAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        const historyData: TaskHistoryItem[] = [];
        querySnapshot.forEach((doc) => {
          historyData.push({ id: doc.id, ...doc.data() } as TaskHistoryItem);
        });
        
        setHistory(historyData);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    if (user) {
      fetchHistory();
    }
  }, [user]);

  if (loading || isLoadingHistory) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24">
      {/* Header */}
      <header className="bg-indigo-600 text-white p-6 rounded-b-3xl shadow-lg">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-4 mb-2">
            <button 
              onClick={() => router.push('/')}
              className="bg-indigo-500/50 p-2 rounded-full hover:bg-indigo-500 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold tracking-tight">Task History</h1>
          </div>
          <p className="text-indigo-100 text-sm ml-12">View your completed tasks and earnings.</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto p-6">
        {history.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center mt-4">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <History className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">No History Yet</h3>
            <p className="text-slate-500 text-sm">Complete tasks to see your earning history here.</p>
            <button 
              onClick={() => router.push('/')}
              className="mt-6 bg-indigo-50 text-indigo-600 font-semibold py-2 px-6 rounded-xl hover:bg-indigo-100 transition-colors"
            >
              Go to Tasks
            </button>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {history.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{item.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(item.completedAt).toLocaleDateString(undefined, { 
                        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-600">+MK {item.reward}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
