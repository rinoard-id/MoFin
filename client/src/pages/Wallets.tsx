import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Landmark, Smartphone, CreditCard, Banknote, Wallet as WalletIcon, Plus, Building2, ChevronRight } from 'lucide-react';
import { api } from '../api';

const INSTITUTIONS_MAP: Record<string, { label: string; institution: string }[]> = {
  BANK: [
    { label: 'BCA (Bank Central Asia)', institution: 'PT Bank Central Asia Tbk' },
    { label: 'Bank Mandiri', institution: 'PT Bank Mandiri (Persero) Tbk' },
    { label: 'BRI (Bank Rakyat Indonesia)', institution: 'PT Bank Rakyat Indonesia (Persero) Tbk' },
    { label: 'BNI (Bank Negara Indonesia)', institution: 'PT Bank Negara Indonesia (Persero) Tbk' },
    { label: 'CIMB Niaga', institution: 'PT Bank CIMB Niaga Tbk' },
    { label: 'Bank Danamon', institution: 'PT Bank Danamon Indonesia Tbk' },
    { label: 'Bank Permata', institution: 'PT Bank Permata Tbk' },
    { label: 'Bank Mega', institution: 'PT Bank Mega Tbk' },
    { label: 'OCBC Indonesia', institution: 'PT Bank OCBC NISP Tbk' },
  ],
  DIGITAL_BANK: [
    { label: 'Bank Jago', institution: 'PT Bank Jago Tbk' },
    { label: 'SeaBank', institution: 'PT Bank SeaBank Indonesia' },
    { label: 'Blu by BCA Digital', institution: 'PT Bank Digital BCA' },
    { label: 'Allo Bank', institution: 'PT Allo Bank Indonesia Tbk' },
    { label: 'Jenius (BTPN)', institution: 'PT Bank BTPN Tbk' },
    { label: 'Bank Neo Commerce', institution: 'PT Bank Neo Commerce Tbk' },
  ],
  E_WALLET: [
    { label: 'GoPay', institution: 'GoTo Financial' },
    { label: 'OVO', institution: 'Visionet Internasional' },
    { label: 'DANA', institution: 'Espay Debit Indonesia Koe' },
    { label: 'ShopeePay', institution: 'AirPay International Indonesia' },
    { label: 'LinkAja', institution: 'Finarya' },
  ],
  CASH: [
    { label: 'Uang Tunai / Cash', institution: 'Dompet Fisik' },
  ],
};

export const Wallets: React.FC = () => {
  const navigate = useNavigate();
  const [wallets, setWallets] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [type, setType] = useState('BANK');
  const [selectedInstitution, setSelectedInstitution] = useState('');
  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [isCustomName, setIsCustomName] = useState(false);

  useEffect(() => {
    loadWallets();
  }, []);

  const loadWallets = async () => {
    try {
      const res = await api.get('/wallets');
      setWallets(res);
    } catch (err) {
      console.error(err);
    }
  };

  const getWalletIcon = (type: string) => {
    switch (type) {
      case 'BANK':
        return <Landmark className="w-5 h-5 text-primaryPink" />;
      case 'DIGITAL_BANK':
        return <Smartphone className="w-5 h-5 text-infoBlue" />;
      case 'E_WALLET':
        return <CreditCard className="w-5 h-5 text-successGreen" />;
      case 'CASH':
        return <Banknote className="w-5 h-5 text-warningYellow" />;
      default:
        return <WalletIcon className="w-5 h-5 text-primaryPink" />;
    }
  };

  const handleTypeChange = (newType: string) => {
    setType(newType);
    setSelectedInstitution('');
    if (newType === 'CUSTOM') {
      setIsCustomName(true);
      setName('');
      setInstitution('');
    } else {
      setIsCustomName(false);
      const list = INSTITUTIONS_MAP[newType];
      if (list && list.length > 0) {
        setSelectedInstitution(list[0].label);
        setName(list[0].label);
        setInstitution(list[0].institution);
      }
    }
  };

  const handleInstitutionSelect = (label: string) => {
    setSelectedInstitution(label);
    const list = INSTITUTIONS_MAP[type];
    const found = list?.find((item) => item.label === label);
    if (found) {
      setName(found.label);
      setInstitution(found.institution);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/wallets', {
        name,
        type,
        institution,
        initialBalance: parseFloat(initialBalance) || 0,
      });
      setShowModal(false);
      setName('');
      setInstitution('');
      setInitialBalance('');
      loadWallets();
    } catch (err) {
      console.error(err);
    }
  };

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="min-h-screen bg-bgMain pb-24 md:pb-12">
      <Header title="Dompet & Rekening" subtitle="Kelola rekening bank, e-wallet, dan uang tunai Anda." />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">Daftar Dompet</h2>
          <button
            onClick={() => {
              handleTypeChange('BANK');
              setShowModal(true);
            }}
            className="bg-primaryPink text-white px-4 py-2.5 rounded-xl text-sm font-medium flex items-center space-x-2 hover:bg-primaryPink/90 transition-colors shadow-lg shadow-primaryPink/20"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Dompet</span>
          </button>
        </div>

        {/* 2 columns side-by-side grid */}
        <div className="grid grid-cols-2 gap-3">
          {wallets.length === 0 ? (
            <div className="col-span-full bg-surface border border-borderCustom rounded-2xl p-8 text-center text-textMuted text-sm">
              Belum ada dompet. Klik tombol "Tambah Dompet" di atas untuk mulai mencatat keuangan Anda.
            </div>
          ) : (
            wallets.map((w) => (
              <div
                key={w.id}
                onClick={() => navigate(`/wallets/${w.id}`)}
                className="bg-surface border border-borderCustom rounded-2xl p-5 flex flex-col justify-between cursor-pointer hover:border-primaryPink/50 transition-all group"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="bg-surfaceSecondary p-2.5 rounded-xl border border-borderCustom group-hover:scale-105 transition-transform">
                      {getWalletIcon(w.type)}
                    </div>
                    <span className="text-[10px] bg-surfaceSecondary px-2 py-0.5 rounded-full text-textMuted border border-borderCustom">{w.type}</span>
                  </div>
                  <h3 className="font-bold text-white text-base mb-1 flex items-center justify-between">
                    <span>{w.name}</span>
                    <ChevronRight className="w-4 h-4 text-textMuted group-hover:text-primaryPink transition-colors" />
                  </h3>
                  {w.institution && <p className="text-xs text-textMuted mb-3 flex items-center space-x-1"><Building2 className="w-3 h-3" /><span>{w.institution}</span></p>}
                </div>
                <div className="pt-3 border-t border-borderCustom mt-3 flex justify-between items-center">
                  <span className="text-xs text-textMuted">Saldo</span>
                  <p className="font-bold text-white text-base">{formatIDR(Number(w.currentBalance))}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[100]">
            <div className="bg-surface border border-borderCustom rounded-2xl p-6 max-w-md w-full">
              <h3 className="text-lg font-bold text-white mb-4">Tambah Dompet Baru</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-textSecondary mb-1.5">1. Pilih Jenis Dompet</label>
                  <select
                    value={type}
                    onChange={(e) => handleTypeChange(e.target.value)}
                    className="w-full bg-surfaceSecondary border border-borderCustom rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primaryPink"
                  >
                    <option value="BANK">Bank Konvensional</option>
                    <option value="DIGITAL_BANK">Bank Digital</option>
                    <option value="E_WALLET">E-Wallet</option>
                    <option value="CASH">Uang Tunai</option>
                    <option value="CUSTOM">Lainnya / Custom</option>
                  </select>
                </div>

                {!isCustomName && INSTITUTIONS_MAP[type] && (
                  <div>
                    <label className="block text-xs font-medium text-textSecondary mb-1.5">2. Pilih Bank / E-Wallet</label>
                    <select
                      value={selectedInstitution}
                      onChange={(e) => handleInstitutionSelect(e.target.value)}
                      className="w-full bg-surfaceSecondary border border-borderCustom rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primaryPink"
                    >
                      {INSTITUTIONS_MAP[type].map((item, idx) => (
                        <option key={idx} value={item.label}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-textSecondary mb-1.5">
                    Nama Dompet {isCustomName ? '' : '(Otomatis sesuai pilihan)'}
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!isCustomName}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full bg-surfaceSecondary border border-borderCustom rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primaryPink ${
                      !isCustomName ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                    placeholder="Nama Dompet"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-textSecondary mb-1.5">Saldo Awal (Rp)</label>
                  <input
                    type="number"
                    required
                    value={initialBalance}
                    onChange={(e) => setInitialBalance(e.target.value)}
                    className="w-full bg-surfaceSecondary border border-borderCustom rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primaryPink"
                    placeholder="0"
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
