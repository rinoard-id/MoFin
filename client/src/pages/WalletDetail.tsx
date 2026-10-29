import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Landmark, Smartphone, CreditCard, Banknote, Wallet as WalletIcon, ArrowLeft, ArrowUpRight, ArrowDownLeft, ArrowLeftRight } from 'lucide-react';
import { api } from '../api';

export const WalletDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWalletDetail();
  }, [id]);

  const loadWalletDetail = async () => {
    try {
      const res = await api.get(`/wallets/${id}`);
      setWallet(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getWalletIcon = (type: string) => {
    switch (type) {
      case 'BANK':
        return <Landmark className="w-6 h-6 text-primaryPink" />;
      case 'DIGITAL_BANK':
        return <Smartphone className="w-6 h-6 text-infoBlue" />;
      case 'E_WALLET':
        return <CreditCard className="w-6 h-6 text-successGreen" />;
      case 'CASH':
        return <Banknote className="w-6 h-6 text-warningYellow" />;
      default:
        return <WalletIcon className="w-6 h-6 text-primaryPink" />;
    }
  };

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bgMain pb-24 md:pb-12">
        <Header title="Detail Mutasi Dompet" subtitle="Memuat data rekening..." />
        <div className="p-6 text-center text-textMuted">Memuat...</div>
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="min-h-screen bg-bgMain pb-24 md:pb-12">
        <Header title="Detail Mutasi Dompet" subtitle="Dompet tidak ditemukan" />
        <div className="p-6 text-center text-textMuted">Dompet tidak ditemukan.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bgMain pb-24 md:pb-12">
      <Header title={`Mutasi — ${wallet.name}`} subtitle={wallet.institution || wallet.type} />

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <button
          onClick={() => navigate('/wallets')}
          className="flex items-center space-x-2 text-xs text-textSecondary hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Dompet</span>
        </button>

        {/* Wallet Balance Summary Card */}
        <div className="bg-surface border border-borderCustom rounded-2xl p-6 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-surfaceSecondary p-3 rounded-2xl border border-borderCustom">
              {getWalletIcon(wallet.type)}
            </div>
            <span className="text-xs bg-surfaceSecondary px-3 py-1 rounded-full text-textMuted border border-borderCustom">
              {wallet.type}
            </span>
          </div>
          <p className="text-xs uppercase tracking-wider text-textMuted font-medium mb-1">Saldo Saat Ini (Real-time)</p>
          <h2 className="text-3xl font-bold text-white mb-2">{formatIDR(Number(wallet.currentBalance))}</h2>
          <p className="text-xs text-textMuted">Saldo Awal: {formatIDR(Number(wallet.initialBalance))}</p>
        </div>

        {/* Mutasi Rekening Statement */}
        <div className="bg-surface border border-borderCustom rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-borderCustom bg-surfaceSecondary/50 flex justify-between items-center">
            <h3 className="text-sm font-bold text-white">Daftar Mutasi Transaksi</h3>
            <span className="text-xs text-textMuted">{wallet.transactions?.length || 0} Transaksi</span>
          </div>
          <div className="divide-y divide-borderCustom">
            {(!wallet.transactions || wallet.transactions.length === 0) ? (
              <div className="p-8 text-center text-textMuted text-xs">Belum ada riwayat mutasi transaksi pada dompet ini.</div>
            ) : (
              wallet.transactions.map((tx: any) => {
                const isIncome = tx.type === 'INCOME' || (tx.type === 'TRANSFER' && tx.targetWalletId === wallet.id);
                const isExpense = tx.type === 'EXPENSE' || (tx.type === 'TRANSFER' && tx.walletId === wallet.id);
                return (
                  <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-surfaceSecondary/40 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2.5 rounded-xl ${isIncome ? 'bg-successGreen/10 text-successGreen' : 'bg-errorRed/10 text-errorRed'}`}>
                        {isIncome ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white text-sm">{tx.notes || tx.type}</h4>
                        <p className="text-[11px] text-textMuted">
                          {new Date(tx.date).toLocaleDateString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                          {tx.type === 'TRANSFER' && (
                            <span> • {tx.walletId === wallet.id ? `Transfer ke ${tx.targetWallet?.name}` : `Transfer dari ${tx.wallet?.name}`}</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-sm ${isIncome ? 'text-successGreen' : 'text-errorRed'}`}>
                        {isIncome ? '+' : '-'}{formatIDR(Number(tx.amount))}
                      </p>
                      <span className="text-[10px] text-textMuted uppercase font-medium">{tx.type}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
