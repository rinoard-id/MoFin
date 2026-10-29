import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { ArrowLeftRight, Plus, Search, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { api } from '../api';
import { db } from '../db';

export const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);

  const [type, setType] = useState<'INCOME' | 'EXPENSE' | 'TRANSFER'>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [walletId, setWalletId] = useState('');
  const [targetWalletId, setTargetWalletId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [notes, setNotes] = useState('');
  const [payee, setPayee] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [wRes, cRes, tRes] = await Promise.all([
        api.get('/wallets'),
        api.get('/categories'),
        api.get('/transactions'),
      ]);
      setWallets(wRes);
      setCategories(cRes);
      setTransactions(tRes);
      if (wRes.length > 0) setWalletId(wRes[0].id);
    } catch (err) {
      console.error(err);
      // Fallback load local transactions if offline
      const localTxs = await db.transactions.toArray();
      setTransactions(localTxs);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      walletId,
      targetWalletId: type === 'TRANSFER' ? targetWalletId : undefined,
      categoryId: type !== 'TRANSFER' ? categoryId : undefined,
      type,
      amount: parseFloat(amount) || 0,
      notes,
      payee,
      date: new Date().toISOString(),
    };

    const operationId = 'op_' + Math.random().toString(36).substring(2, 15);
    const entityId = 'tx_' + Math.random().toString(36).substring(2, 15);

    if (navigator.onLine) {
      try {
        const res = await api.post('/transactions', { ...payload, idempotencyKey: operationId });
        setTransactions([res, ...transactions]);
      } catch (err) {
        console.error('Online failed, saving locally:', err);
        await saveOffline(operationId, entityId, payload);
      }
    } else {
      await saveOffline(operationId, entityId, payload);
    }

    setShowModal(false);
    setAmount('');
    setNotes('');
    setPayee('');
  };

  const saveOffline = async (operationId: string, entityId: string, payload: any) => {
    const localTx = {
      id: entityId,
      ...payload,
      currency: 'IDR',
      syncStatus: 'PENDING' as const,
      clientTimestamp: new Date().toISOString(),
      tags: [],
    };
    await db.transactions.put(localTx);
    await db.syncQueue.add({
      operationId,
      entityType: 'TRANSACTION',
      entityId,
      action: 'CREATE',
      payload,
      clientTimestamp: new Date().toISOString(),
    });
    setTransactions([localTx, ...transactions]);
  };

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="min-h-screen bg-bgMain pb-24 md:pb-12">
      <Header title="Transaksi" subtitle="Pencatatan pemasukan, pengeluaran, dan transfer." />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">Riwayat Transaksi</h2>
          <button
            onClick={() => setShowModal(true)}
            className="bg-primaryPink text-white px-4 py-2.5 rounded-xl text-sm font-medium flex items-center space-x-2 hover:bg-primaryPink/90 transition-colors shadow-lg shadow-primaryPink/20"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Transaksi</span>
          </button>
        </div>

        <div className="bg-surface border border-borderCustom rounded-2xl overflow-hidden">
          <div className="divide-y divide-borderCustom">
            {transactions.length === 0 ? (
              <div className="p-8 text-center text-textMuted text-sm">Belum ada transaksi tercatat.</div>
            ) : (
              transactions.map((t) => (
                <div key={t.id} className="p-4 flex items-center justify-between hover:bg-surfaceSecondary transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2.5 rounded-xl ${t.type === 'INCOME' ? 'bg-successGreen/10 text-successGreen' : t.type === 'EXPENSE' ? 'bg-errorRed/10 text-errorRed' : 'bg-infoBlue/10 text-infoBlue'}`}>
                      {t.type === 'INCOME' ? <ArrowDownLeft className="w-5 h-5" /> : t.type === 'EXPENSE' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowLeftRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-sm">{t.notes || t.type}</h4>
                      <p className="text-xs text-textMuted">{new Date(t.date).toLocaleDateString('id-ID', { dateStyle: 'medium' })} • {t.wallet?.name || 'Dompet'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-sm ${t.type === 'INCOME' ? 'text-successGreen' : 'text-white'}`}>
                      {t.type === 'INCOME' ? '+' : '-'}{formatIDR(Number(t.amount))}
                    </p>
                    <span className="text-[10px] bg-surfaceSecondary px-2 py-0.5 rounded-full text-textMuted border border-borderCustom">{t.syncStatus || 'SYNCED'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-surface border border-borderCustom rounded-2xl p-6 max-w-md w-full">
              <h3 className="text-lg font-bold text-white mb-4">Tambah Transaksi Baru</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-3 gap-2 bg-surfaceSecondary p-1 rounded-xl border border-borderCustom">
                  <button
                    type="button"
                    onClick={() => setType('EXPENSE')}
                    className={`py-2 rounded-lg text-xs font-medium transition-colors ${type === 'EXPENSE' ? 'bg-errorRed text-white' : 'text-textSecondary'}`}
                  >
                    Pengeluaran
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('INCOME')}
                    className={`py-2 rounded-lg text-xs font-medium transition-colors ${type === 'INCOME' ? 'bg-successGreen text-surface' : 'text-textSecondary'}`}
                  >
                    Pemasukan
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('TRANSFER')}
                    className={`py-2 rounded-lg text-xs font-medium transition-colors ${type === 'TRANSFER' ? 'bg-infoBlue text-surface' : 'text-textSecondary'}`}
                  >
                    Transfer
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-textSecondary mb-1.5">Nominal (Rp)</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-surfaceSecondary border border-borderCustom rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primaryPink"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-textSecondary mb-1.5">Dompet {type === 'TRANSFER' ? 'Sumber' : ''}</label>
                  <select
                    value={walletId}
                    onChange={(e) => setWalletId(e.target.value)}
                    className="w-full bg-surfaceSecondary border border-borderCustom rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primaryPink"
                  >
                    {wallets.map((w) => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>

                {type === 'TRANSFER' && (
                  <div>
                    <label className="block text-xs font-medium text-textSecondary mb-1.5">Dompet Tujuan</label>
                    <select
                      value={targetWalletId}
                      onChange={(e) => setTargetWalletId(e.target.value)}
                      className="w-full bg-surfaceSecondary border border-borderCustom rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primaryPink"
                    >
                      <option value="">Pilih Dompet Tujuan</option>
                      {wallets.filter((w) => w.id !== walletId).map((w) => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {type !== 'TRANSFER' && (
                  <div>
                    <label className="block text-xs font-medium text-textSecondary mb-1.5">Kategori</label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full bg-surfaceSecondary border border-borderCustom rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primaryPink"
                    >
                      <option value="">Pilih Kategori</option>
                      {categories.filter((c) => c.type === type).map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-textSecondary mb-1.5">Catatan / Keterangan</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-surfaceSecondary border border-borderCustom rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primaryPink"
                    placeholder="Contoh: Belanja bulanan di supermarket"
                  />
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-surfaceSecondary border border-borderCustom text-textSecondary py-3 rounded-xl font-medium hover:bg-surface transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-primaryPink text-white py-3 rounded-xl font-medium hover:bg-primaryPink/90 transition-colors shadow-lg shadow-primaryPink/20"
                  >
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
