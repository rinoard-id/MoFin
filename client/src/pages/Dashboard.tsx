import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { Wallet, TrendingUp, ArrowUpRight, ArrowDownLeft, Plus, X, ArrowLeftRight } from 'lucide-react';
import { api } from '../api';
import { db } from '../db';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export const Dashboard: React.FC = () => {
  const [wallets, setWallets] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Transaction Modal State
  const [showAddTxModal, setShowAddTxModal] = useState(false);
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
      const [wRes, cRes, tRes, iRes] = await Promise.all([
        api.get('/wallets'),
        api.get('/categories'),
        api.get('/transactions'),
        api.get('/investments'),
      ]);
      setWallets(wRes);
      setCategories(cRes);
      setTransactions(tRes);
      setInvestments(iRes);
      if (wRes.length > 0) setWalletId(wRes[0].id);
    } catch (err) {
      console.error(err);
      const localTxs = await db.transactions.toArray();
      setTransactions(localTxs);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTransaction = async (e: React.FormEvent) => {
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

    setShowAddTxModal(false);
    setAmount('');
    setNotes('');
    setPayee('');
    loadData();
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

  const totalWalletBalance = wallets.reduce((acc, w) => acc + Number(w.initialBalance), 0);
  const totalInvestments = investments.reduce((acc, i) => acc + Number(i.units) * Number(i.instrument.currentPrice), 0);
  const totalNetWorth = totalWalletBalance + totalInvestments;

  const currentMonthIncome = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const currentMonthExpense = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const chartData = [
    { month: 'Jun', pemasukan: 0, pengeluaran: 0 },
    { month: 'Jul', pemasukan: 0, pengeluaran: 0 },
    { month: 'Agu', pemasukan: 0, pengeluaran: 0 },
    { month: 'Sep', pemasukan: 0, pengeluaran: 0 },
    { month: 'Okt', pemasukan: currentMonthIncome, pengeluaran: currentMonthExpense },
  ];

  return (
    <div className="min-h-screen bg-bgMain pb-24 md:pb-12 relative">
      <Header title="Beranda" subtitle="Catatan keuangan." />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Total Net Worth Card */}
        <div className="bg-surface border border-borderCustom rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primaryPink/5 rounded-full blur-3xl pointer-events-none" />
          <p className="text-xs uppercase tracking-wider text-textMuted font-medium mb-1">Total Kekayaan Bersih</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">{formatIDR(totalNetWorth)}</h2>
          <div className="flex items-center space-x-2 text-textMuted text-xs font-medium">
            <span>Dihitung dari saldo dompet dan portofolio aktual Anda</span>
          </div>
        </div>

        {/* Grid Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface border border-borderCustom rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-textMuted">Saldo Dompet</span>
              <div className="bg-primaryPink/10 text-primaryPink p-2 rounded-xl">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xl font-bold text-white">{formatIDR(totalWalletBalance)}</p>
          </div>

          <div className="bg-surface border border-borderCustom rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-textMuted">Nilai Investasi</span>
              <div className="bg-infoBlue/10 text-infoBlue p-2 rounded-xl">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xl font-bold text-white">{formatIDR(totalInvestments)}</p>
          </div>

          <div className="bg-surface border border-borderCustom rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-textMuted">Pemasukan</span>
              <div className="bg-successGreen/10 text-successGreen p-2 rounded-xl">
                <ArrowDownLeft className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xl font-bold text-white">{formatIDR(currentMonthIncome)}</p>
          </div>

          <div className="bg-surface border border-borderCustom rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-textMuted">Pengeluaran</span>
              <div className="bg-errorRed/10 text-errorRed p-2 rounded-xl">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xl font-bold text-white">{formatIDR(currentMonthExpense)}</p>
          </div>
        </div>

        {/* Cash Flow Chart */}
        <div className="bg-surface border border-borderCustom rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-white">Arus Kas</h3>
            <span className="text-xs text-textMuted">6 bulan terakhir</span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F044A5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F044A5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#93C5FD" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#93C5FD" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#AFA4B1" fontSize={12} />
                <YAxis stroke="#AFA4B1" fontSize={12} tickFormatter={(v) => `${v / 1000}rb`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#201C23', borderColor: '#403340', borderRadius: '12px' }}
                  formatter={(val: any) => formatIDR(Number(val))}
                />
                <Area type="monotone" dataKey="pemasukan" stroke="#F044A5" strokeWidth={2} fillOpacity={1} fill="url(#incomeGrad)" />
                <Area type="monotone" dataKey="pengeluaran" stroke="#93C5FD" strokeWidth={2} fillOpacity={1} fill="url(#expenseGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center space-x-6 mt-4 text-xs text-textSecondary">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-primaryPink" />
              <span>Pemasukan</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-infoBlue" />
              <span>Pengeluaran</span>
            </div>
          </div>
        </div>

        {/* Wallets Summary */}
        <div className="bg-surface border border-borderCustom rounded-2xl p-6">
          <h3 className="text-base font-bold text-white mb-4">Dompet Saya</h3>
          <div className="space-y-3">
            {wallets.length === 0 ? (
              <div className="p-6 bg-surfaceSecondary rounded-xl text-center text-textMuted text-xs">
                Belum ada dompet. Silakan tambahkan dompet pertama Anda di menu <a href="/wallets" className="text-primaryPink underline">Dompet</a>.
              </div>
            ) : (
              wallets.map((w) => (
                <div key={w.id} className="flex justify-between items-center p-4 bg-surfaceSecondary rounded-xl border border-borderCustom">
                  <div className="flex items-center space-x-3">
                    <div className="bg-primaryPink/10 text-primaryPink p-2.5 rounded-xl">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-sm">{w.name}</h4>
                      <p className="text-xs text-textMuted">{w.type} {w.institution ? `• ${w.institution}` : ''}</p>
                    </div>
                  </div>
                  <span className="font-bold text-white text-sm">{formatIDR(Number(w.initialBalance))}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Floating Action Button (FAB) to open Add Transaction Modal */}
      <button
        onClick={() => setShowAddTxModal(true)}
        className="fixed bottom-20 right-6 md:bottom-8 md:right-8 bg-primaryPink text-white p-4 rounded-full shadow-2xl z-40 hover:scale-110 transition-transform flex items-center justify-center group"
        title="Tambah Transaksi"
      >
        <Plus className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 text-xs font-semibold">
          Tambah Transaksi
        </span>
      </button>

      {/* Add Transaction Modal */}
      {showAddTxModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-surface border border-borderCustom rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Tambah Transaksi Baru</h3>
              <button onClick={() => setShowAddTxModal(false)} className="text-textMuted hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTransaction} className="space-y-4">
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
                    <option key={w.id} value={w.id}>{w.name} ({formatIDR(Number(w.currentBalance || w.initialBalance))})</option>
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
                  placeholder="Contoh: Belanja bulanan"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTxModal(false)}
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
  );
};
