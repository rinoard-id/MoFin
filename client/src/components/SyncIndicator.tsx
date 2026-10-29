import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { db } from '../db';
import { api } from '../api';

export const SyncIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      triggerSync();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    checkPending();
    const interval = setInterval(checkPending, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const checkPending = async () => {
    const count = await db.syncQueue.count();
    setPendingCount(count);
    if (navigator.onLine && count > 0 && !isSyncing) {
      triggerSync();
    }
  };

  const triggerSync = async () => {
    if (!navigator.onLine || isSyncing) return;
    setIsSyncing(true);
    try {
      const queue = await db.syncQueue.toArray();
      if (queue.length === 0) {
        setIsSyncing(false);
        return;
      }

      const operations = queue.map((q) => ({
        operationId: q.operationId,
        entityType: q.entityType,
        entityId: q.entityId,
        action: q.action,
        payload: q.payload,
        clientTimestamp: q.clientTimestamp,
      }));

      const res = await api.post('/sync', { operations });
      if (res.status === 'ok') {
        const idsToRemove = queue.map((q) => q.id!).filter(Boolean);
        await db.syncQueue.bulkDelete(idsToRemove);
        setPendingCount(0);
      }
    } catch (err) {
      console.error('Sync failed:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isOnline) {
    return (
      <div className="flex items-center space-x-2 bg-errorRed/10 border border-errorRed/20 px-3 py-1.5 rounded-full text-xs text-errorRed">
        <WifiOff className="w-4 h-4 animate-pulse" />
        <span>Offline — {pendingCount} tersimpan</span>
      </div>
    );
  }

  if (isSyncing || pendingCount > 0) {
    return (
      <button
        onClick={triggerSync}
        className="flex items-center space-x-2 bg-warningYellow/10 border border-warningYellow/20 px-3 py-1.5 rounded-full text-xs text-warningYellow hover:bg-warningYellow/20 transition-colors"
      >
        <RefreshCw className="w-4 h-4 animate-spin" />
        <span>Sinkronisasi... ({pendingCount})</span>
      </button>
    );
  }

  return null;
};
