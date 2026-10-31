import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { ArrowLeftRight, Plus, Search, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { api } from '../api';
import { db } from '../db';

export const Transactions: React.FC = () => {
  const navigate = useNavigate();
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
  const [filterPeriod, setFilterPeriod] = useState<'today' | '7days' | '1month' | 'custom'>('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredTransactions = transactions.filter((t) => {
    const txDate = new Date(t.date);
    const now = new Date();
    if (filterPeriod === 'today') {
      return txDate.toDateString() === now.toDateString();
    }
    if (filterPeriod === '7days') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      return txDate >= sevenDaysAgo;
    }
    if (filterPeriod === '1month') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(now.getMonth() - 1);
      return txDate >= oneMonthAgo;
    }
    if (filterPeriod === 'custom') {
      if (!startDate && !endDate) return true;
      const start = startDate ? new Date(startDate) : new Date(0);
      const end = endDate ? new Date(endDate) : new Date(8640000000000000);
      end.setHours(23, 59, 59, 999);
      return txDate >= start && txDate <= end;
    }
    return txDate.toDateString() === now.toDateString();
  });

  const handleOpenTransactionModal = async () => {
    try {
      const freshWallets = await api.get('/wallets');
      if (!freshWallets || freshWallets.length === 0) {
        alert('Belum ada dompet. Silakan tambahkan dompet terlebih dahulu sebelum mencatat transaksi.');
        navigate('/wallets');
        return;
      }
      setWallets(freshWallets);
      if (freshWallets.length > 0 && !walletId) {
        setWalletId(freshWallets[0].id);
      }
      setShowModal(true);
    } catch (err: any) {
      if (err.message === 'Unauthorized') return;
      alert('Belum ada dompet. Silakan tambahkan dompet terlebih dahulu sebelum mencatat transaksi.');
      navigate('/wallets');
    }
  };

  useEffect(() => {
    loadData();
    const handleOpen = () => {
      handleOpenTransactionModal();
    };
    window.addEventListener('open-add-transaction', handleOpen);
    return () => window.removeEventListener('open-add-transaction', handleOpen);
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

  const formatNumberDot = (val: string | number) => {
    if (val === '' || val === undefined || val === null) return '';
    const clean = String(val).replace(/\D/g, '');
    if (!clean) return '';
    return parseInt(clean, 10).toLocaleString('id-ID');
  };

  const parseNumberDot = (val: string) => {
    return val.replace(/\./g, '');
  };

  return (
    <div className="min-h-screen bg-bgMain pb-24 md:pb-12">
      <Header title="Transaksi" subtitle="Pencatatan pemasukan, pengeluaran, dan transfer." />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">Riwayat Transaksi</h2>
          <button
            onClick={handleOpenTransactionModal}
            className="hidden md:flex bg-primaryPink text-white p-2.5 rounded-xl hover:bg-primaryPink/90 transition-colors shadow-lg shadow-primaryPink/20 items-center justify-center"
            title="Tambah Transaksi"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Period Filter Bar (Horizontally scrollable single line) */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none flex-nowrap">
            {[
              { id: 'today', label: 'Hari Ini' },
              { id: '7days', label: '7 Hari' },
              { id: '1month', label: '1 Bulan' },
              { id: 'custom', label: 'Rentang Tgl' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterPeriod(f.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors border flex-shrink-0 ${
                  filterPeriod === f.id
                    ? 'bg-primaryPink text-white border-primaryPink'
                    : 'bg-surfaceSecondary text-textSecondary border-borderCustom hover:border-primaryPink/50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {filterPeriod === 'custom' && (
            <div className="flex items-center space-x-2 bg-surface border border-borderCustom rounded-xl p-3">
              <div className="flex-1">
                <label className="block text-[10px] text-textMuted mb-1">Dari Tanggal</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-surfaceSecondary border border-borderCustom rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-primaryPink"
                />
              </div>
              <span className="text-textMuted text-xs pt-4">s/d</span>
              <div className="flex-1">
                <label className="block text-[10px] text-textMuted mb-1">Sampai Tanggal</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-surfaceSecondary border border-borderCustom rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-primaryPink"
                />
              </div>
            </div>
          )}
        </div>

        <div className="bg-surface border border-borderCustom rounded-2xl overflow-hidden">
          <div className="divide-y divide-borderCustom">
            {filteredTransactions.length === 0 ? (
              <div className="p-8 text-center text-textMuted text-sm">
                {filterPeriod === 'today' ? 'Belum ada transaksi hari ini.' : 'Belum ada transaksi tercatat untuk periode ini.'}
              </div>
            ) : (
              filteredTransactions.map((t) => (
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
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[100]">
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
                    type="text"
                    inputMode="numeric"
                    required
                    value={formatNumberDot(amount)}
                    onChange={(e) => setAmount(parseNumberDot(e.target.value))}
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
                      <option key={w.id} value={w.id}>{w.name} - {w.institution || w.type}</option>
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
                        <option key={w.id} value={w.id}>{w.name} - {w.institution || w.type}</option>
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
