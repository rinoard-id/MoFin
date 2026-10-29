import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { PieChart, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { api } from '../api';

export const Reports: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const res = await api.get('/transactions');
      setTransactions(res);
    } catch (err) {
      console.error(err);
    }
  };

  const totalIncome = transactions.filter((t) => t.type === 'INCOME').reduce((a, b) => a + Number(b.amount), 0);
  const totalExpense = transactions.filter((t) => t.type === 'EXPENSE').reduce((a, b) => a + Number(b.amount), 0);
  const netCashFlow = totalIncome - totalExpense;

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="min-h-screen bg-bgMain pb-24 md:pb-12">
      <Header title="Laporan & Analisis" subtitle="Analisis arus kas, pemasukan, dan pengeluaran." />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-surface border border-borderCustom rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-successGreen/10 text-successGreen p-2.5 rounded-xl">
                <ArrowDownLeft className="w-5 h-5" />
              </div>
              <span className="text-xs text-textMuted font-medium">Total Pemasukan</span>
            </div>
            <p className="text-2xl font-bold text-white">{formatIDR(totalIncome)}</p>
          </div>

          <div className="bg-surface border border-borderCustom rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-errorRed/10 text-errorRed p-2.5 rounded-xl">
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <span className="text-xs text-textMuted font-medium">Total Pengeluaran</span>
            </div>
            <p className="text-2xl font-bold text-white">{formatIDR(totalExpense)}</p>
          </div>

          <div className="bg-surface border border-borderCustom rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-primaryPink/10 text-primaryPink p-2.5 rounded-xl">
                <PieChart className="w-5 h-5" />
              </div>
              <span className="text-xs text-textMuted font-medium">Arus Kas Bersih</span>
            </div>
            <p className="text-2xl font-bold text-white">{formatIDR(netCashFlow)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
