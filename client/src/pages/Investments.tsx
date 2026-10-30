import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { TrendingUp, Plus, Award, Briefcase, BarChart3, AlertCircle, ArrowUpRight, ArrowDownRight, Search } from 'lucide-react';
import { api } from '../api';

export const Investments: React.FC = () => {
  const [holdings, setHoldings] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'GOLD' | 'MUTUAL_FUND' | 'STOCK' | 'CRYPTO'>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'GOLD' | 'MUTUAL_FUND' | 'STOCK' | 'CRYPTO' | null>(null);

  // Form states for Logam Mulia
  const [goldType, setGoldType] = useState('Emas'); // Emas or Silver
  const [goldForm, setGoldForm] = useState('PHYSICAL'); // PHYSICAL or DIGITAL
  const [goldBrand, setGoldBrand] = useState('Antam');
  const [goldWeight, setGoldWeight] = useState('');
  const [goldPrice, setGoldPrice] = useState('');

  // Mutual fund form states
  const [mfCatalog, setMfCatalog] = useState<any[]>([]);
  const [mfSearch, setMfSearch] = useState('');
  const [selectedMf, setSelectedMf] = useState<any>(null);
  const [mfPlatform, setMfPlatform] = useState('Bibit');
  const [mfAmount, setMfAmount] = useState('');

  // Stock form states
  const [stockCatalog, setStockCatalog] = useState<any[]>([]);
  const [stockSearch, setStockSearch] = useState('');
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [stockPlatform, setStockPlatform] = useState('Stockbit');
  const [stockLots, setStockLots] = useState('');
  const [stockPrice, setStockPrice] = useState('');

  const [walletId, setWalletId] = useState('');
  const [notes, setNotes] = useState('');
  const [cryptoModalOpen, setCryptoModalOpen] = useState(false);

  useEffect(() => {
    loadData();
    const handleOpen = () => setShowAddModal(true);
    window.addEventListener('open-add-investment', handleOpen);
    return () => window.removeEventListener('open-add-investment', handleOpen);
  }, []);

  const loadData = async () => {
    try {
      const [hRes, wRes] = await Promise.all([
        api.get('/investments'),
        api.get('/wallets'),
      ]);
      setHoldings(hRes);
      setWallets(wRes);
      if (wRes.length > 0) setWalletId(wRes[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  const searchStocks = async (q: string) => {
    setStockSearch(q);
    try {
      const res = await api.get(`/investments/catalog/stocks?q=${q}`);
      setStockCatalog(res);
    } catch (e) {
      console.error(e);
    }
  };

  const searchMutualFunds = async (q: string) => {
    setMfSearch(q);
    try {
      const res = await api.get(`/investments/catalog/mutual-funds?q=${q}`);
      setMfCatalog(res);
    } catch (e) {
      console.error(e);
    }
  };

  const handleBuyInvestment = async (e: React.FormEvent, assetType: string, symbol: string, name: string, units: number, pricePerUnit: number, totalAmount: number, fee: number) => {
    e.preventDefault();
    try {
      await api.post('/investments/buy', {
        assetType,
        symbol,
        name,
        units,
        pricePerUnit,
        totalAmount,
        fee,
        walletId,
        platform: selectedCategory === 'GOLD' ? goldForm : selectedCategory === 'MUTUAL_FUND' ? mfPlatform : stockPlatform,
        notes,
      });
      setShowAddModal(false);
      setSelectedCategory(null);
      setSelectedMf(null);
      setSelectedStock(null);
      setNotes('');
      loadData();
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan investasi');
    }
  };

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const totalModal = holdings.reduce((acc, h) => acc + Number(h.units) * Number(h.averageBuyPrice), 0);
  const totalMarketVal = holdings.reduce((acc, h) => acc + Number(h.units) * Number(h.instrument.currentPrice), 0);
  const totalPnL = totalMarketVal - totalModal;
  const pnlPercentage = totalModal > 0 ? (totalPnL / totalModal) * 100 : 0;

  const filteredHoldings = holdings.filter((h) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'GOLD') return h.instrument.assetType === 'GOLD' || h.instrument.assetType === 'COMMODITY';
    if (activeTab === 'MUTUAL_FUND') return h.instrument.assetType === 'MUTUAL_FUND';
    if (activeTab === 'STOCK') return h.instrument.assetType === 'STOCK';
    return false;
  });

  return (
    <div className="min-h-screen bg-bgMain pb-24 md:pb-12">
      <Header title="Investasi Saya" subtitle="Kelola dan pantau seluruh portofolio investasi Anda." />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header Action & Filters in 1 row with floating right add button */}
        <div className="relative flex items-center">
          <div className="flex space-x-2 overflow-x-auto pb-2 pr-14 w-full">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors whitespace-nowrap ${activeTab === 'ALL' ? 'bg-primaryPink text-white' : 'bg-surface text-textSecondary hover:text-white border border-borderCustom'}`}
            >
              Semua
            </button>
            <button
              onClick={() => setActiveTab('GOLD')}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors whitespace-nowrap ${activeTab === 'GOLD' ? 'bg-primaryPink text-white' : 'bg-surface text-textSecondary hover:text-white border border-borderCustom'}`}
            >
              Logam Mulia
            </button>
            <button
              onClick={() => setActiveTab('MUTUAL_FUND')}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors whitespace-nowrap ${activeTab === 'MUTUAL_FUND' ? 'bg-primaryPink text-white' : 'bg-surface text-textSecondary hover:text-white border border-borderCustom'}`}
            >
              Reksa Dana
            </button>
            <button
              onClick={() => setActiveTab('STOCK')}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors whitespace-nowrap ${activeTab === 'STOCK' ? 'bg-primaryPink text-white' : 'bg-surface text-textSecondary hover:text-white border border-borderCustom'}`}
            >
              Saham
            </button>
            <button
              onClick={() => setCryptoModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-medium bg-surface text-textMuted hover:text-white border border-borderCustom whitespace-nowrap flex items-center space-x-1"
            >
              <span>Kripto</span>
              <span className="text-[10px] bg-warningYellow/10 text-warningYellow px-1.5 py-0.5 rounded ml-1">Soon</span>
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="absolute right-0 top-0 bg-primaryPink text-white p-2.5 rounded-xl shadow-xl shadow-primaryPink/40 hover:scale-105 transition-transform flex items-center justify-center z-20 border border-white/10"
            title="Tambah Investasi"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Portfolio Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-surface border border-borderCustom rounded-2xl p-5">
            <span className="text-xs font-medium text-textMuted">Total Modal</span>
            <p className="text-xl font-bold text-white mt-1">{formatIDR(totalModal)}</p>
          </div>
          <div className="bg-surface border border-borderCustom rounded-2xl p-5">
            <span className="text-xs font-medium text-textMuted">Nilai Pasar</span>
            <p className="text-xl font-bold text-white mt-1">{formatIDR(totalMarketVal)}</p>
          </div>
          <div className="bg-surface border border-borderCustom rounded-2xl p-5">
            <span className="text-xs font-medium text-textMuted">Keuntungan / Kerugian</span>
            <p className={`text-xl font-bold mt-1 flex items-center space-x-1 ${totalPnL >= 0 ? 'text-successGreen' : 'text-errorRed'}`}>
              {totalPnL >= 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
              <span>{formatIDR(totalPnL)}</span>
            </p>
          </div>
          <div className="bg-surface border border-borderCustom rounded-2xl p-5">
            <span className="text-xs font-medium text-textMuted">Persentase Return</span>
            <p className={`text-xl font-bold mt-1 ${pnlPercentage >= 0 ? 'text-successGreen' : 'text-errorRed'}`}>
              {pnlPercentage >= 0 ? '+' : ''}{pnlPercentage.toFixed(2)}%
            </p>
          </div>
        </div>

        {/* Portfolio List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredHoldings.length === 0 ? (
            <div className="col-span-full bg-surface border border-borderCustom rounded-2xl p-12 text-center text-textMuted text-sm">
              Belum ada portofolio investasi tercatat. Klik tombol "+" di atas untuk memulai.
            </div>
          ) : (
            filteredHoldings.map((h) => {
              const marketVal = Number(h.units) * Number(h.instrument.currentPrice);
              const modalVal = Number(h.units) * Number(h.averageBuyPrice);
              const pnl = marketVal - modalVal;
              const pnlPct = modalVal > 0 ? (pnl / modalVal) * 100 : 0;
              return (
                <div key={h.id} className="bg-surface border border-borderCustom rounded-2xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="bg-infoBlue/10 text-infoBlue p-2.5 rounded-xl">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] bg-surfaceSecondary px-2.5 py-1 rounded-full text-textMuted border border-borderCustom">{h.instrument.assetType}</span>
                    </div>
                    <h3 className="font-bold text-white text-base mb-0.5">{h.instrument.name}</h3>
                    <p className="text-xs text-textMuted mb-3">{h.instrument.symbol} • {Number(h.units).toLocaleString('id-ID')} Unit</p>
                  </div>
                  <div className="pt-3 border-t border-borderCustom mt-3 flex justify-between items-end">
                    <div>
                      <span className="text-[11px] text-textMuted">Nilai Pasar</span>
                      <p className="font-bold text-white text-base">{formatIDR(marketVal)}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-textMuted">Return</span>
                      <p className={`font-bold text-sm ${pnl >= 0 ? 'text-successGreen' : 'text-errorRed'}`}>
                        {pnl >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Add Investment Selection Modal */}
        {showAddModal && !selectedCategory && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[100]">
            <div className="bg-surface border border-borderCustom rounded-2xl p-6 max-w-lg w-full space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">Pilih Jenis Investasi</h3>
                <button onClick={() => setShowAddModal(false)} className="text-textMuted hover:text-white">✕</button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedCategory('GOLD')}
                  className="bg-surfaceSecondary border border-borderCustom rounded-xl p-4 text-left hover:border-primaryPink transition-colors group"
                >
                  <Award className="w-6 h-6 text-warningYellow mb-2 group-hover:scale-110 transition-transform" />
                  <h4 className="font-bold text-white text-sm">Logam Mulia</h4>
                  <p className="text-[11px] text-textMuted mt-1">Emas & Perak fisik/digital</p>
                </button>

                <button
                  onClick={() => {
                    setSelectedCategory('MUTUAL_FUND');
                    searchMutualFunds('');
                  }}
                  className="bg-surfaceSecondary border border-borderCustom rounded-xl p-4 text-left hover:border-primaryPink transition-colors group"
                >
                  <BarChart3 className="w-6 h-6 text-infoBlue mb-2 group-hover:scale-110 transition-transform" />
                  <h4 className="font-bold text-white text-sm">Reksa Dana</h4>
                  <p className="text-[11px] text-textMuted mt-1">Pasar Uang, Saham, Obligasi</p>
                </button>

                <button
                  onClick={() => {
                    setSelectedCategory('STOCK');
                    searchStocks('');
                  }}
                  className="bg-surfaceSecondary border border-borderCustom rounded-xl p-4 text-left hover:border-primaryPink transition-colors group"
                >
                  <Briefcase className="w-6 h-6 text-successGreen mb-2 group-hover:scale-110 transition-transform" />
                  <h4 className="font-bold text-white text-sm">Saham</h4>
                  <p className="text-[11px] text-textMuted mt-1">Saham emiten Bursa Efek Indonesia</p>
                </button>

                <button
                  onClick={() => setCryptoModalOpen(true)}
                  className="bg-surfaceSecondary border border-borderCustom rounded-xl p-4 text-left opacity-75 hover:opacity-100 transition-opacity relative"
                >
                  <span className="absolute top-3 right-3 text-[10px] bg-warningYellow/20 text-warningYellow px-2 py-0.5 rounded-full font-medium">Soon</span>
                  <TrendingUp className="w-6 h-6 text-primaryPink mb-2" />
                  <h4 className="font-bold text-white text-sm">Kripto</h4>
                  <p className="text-[11px] text-textMuted mt-1">Bitcoin, Ethereum, dll</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Logam Mulia Wizard Form */}
        {showAddModal && selectedCategory === 'GOLD' && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[100]">
            <div className="bg-surface border border-borderCustom rounded-2xl p-6 max-w-md w-full">
              <h3 className="text-lg font-bold text-white mb-4">Tambah Logam Mulia</h3>
              <form
                onSubmit={(e) => {
                  const w = parseFloat(goldWeight) || 0;
                  const p = parseFloat(goldPrice) || 0;
                  handleBuyInvestment(e, goldType === 'Emas' ? 'GOLD' : 'COMMODITY', `${goldType.toUpperCase()}-${goldForm}-${goldBrand}`, `${goldType} ${goldBrand}`, w, p, w * p, 0);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-medium text-textSecondary mb-1.5">Bentuk</label>
                  <select
                    value={goldForm}
                    onChange={(e) => setGoldForm(e.target.value)}
                    className="w-full bg-surfaceSecondary border border-borderCustom rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primaryPink"
                  >
                    <option value="PHYSICAL">Fisik (Batangan / Perhiasan)</option>
                    <option value="DIGITAL">Digital (Tabungan)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-textSecondary mb-1.5">Jenis & Merk</label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={goldType}
                      onChange={(e) => setGoldType(e.target.value)}
                      className="bg-surfaceSecondary border border-borderCustom rounded-xl px-3 py-3 text-white text-sm focus:outline-none focus:border-primaryPink"
                    >
                      <option value="Emas">Emas</option>
                      <option value="Silver">Silver</option>
                    </select>
                    <input
                      type="text"
                      required
                      value={goldBrand}
                      onChange={(e) => setGoldBrand(e.target.value)}
                      className="bg-surfaceSecondary border border-borderCustom rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primaryPink"
                      placeholder="Merk (Contoh: Antam)"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-textSecondary mb-1.5">Berat (Gram)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={goldWeight}
                    onChange={(e) => setGoldWeight(e.target.value)}
                    className="w-full bg-surfaceSecondary border border-borderCustom rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primaryPink"
                    placeholder="Contoh: 10"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-textSecondary mb-1.5">Harga Beli per Gram (Rp)</label>
                  <input
                    type="number"
                    required
                    value={goldPrice}
                    onChange={(e) => setGoldPrice(e.target.value)}
                    className="w-full bg-surfaceSecondary border border-borderCustom rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primaryPink"
                    placeholder="Contoh: 1250000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-textSecondary mb-1.5">Dompet Sumber Dana</label>
                  <select
                    value={walletId}
                    onChange={(e) => setWalletId(e.target.value)}
                    className="w-full bg-surfaceSecondary border border-borderCustom rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primaryPink"
                  >
                    {wallets.map((w) => (
                      <option key={w.id} value={w.id}>{w.name} ({formatIDR(Number(w.currentBalance))})</option>
                    ))}
                  </select>
                </div>
                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory(null)}
                    className="flex-1 bg-surfaceSecondary border border-borderCustom text-textSecondary py-3 rounded-xl font-medium hover:bg-surface"
                  >
                    Kembali
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-primaryPink text-white py-3 rounded-xl font-medium hover:bg-primaryPink/90 shadow-lg shadow-primaryPink/20"
                  >
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Reksa Dana Wizard Form (With "Lainnya" Option) */}
        {showAddModal && selectedCategory === 'MUTUAL_FUND' && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[100]">
            <div className="bg-surface border border-borderCustom rounded-2xl p-6 max-w-md w-full">
              <h3 className="text-lg font-bold text-white mb-4">Tambah Reksa Dana</h3>
              {!selectedMf ? (
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => setSelectedMf({ id: 'CUSTOM-' + Date.now(), name: '', manager: 'Lainnya / Manual', nav: 1000, isCustom: true })}
                    className="w-full bg-surfaceSecondary border border-primaryPink/60 text-primaryPink py-3 rounded-xl font-medium hover:bg-primaryPink/10 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Reksa Dana Lainnya (Manual)</span>
                  </button>

                  <div className="relative">
                    <label className="block text-xs font-medium text-textSecondary mb-1.5">Atau Cari dari Katalog</label>
                    <div className="relative">
                      <Search className="w-4 h-4 text-textMuted absolute left-3 top-3.5" />
                      <input
                        type="text"
                        value={mfSearch}
                        onChange={(e) => searchMutualFunds(e.target.value)}
                        className="w-full bg-surfaceSecondary border border-borderCustom rounded-xl pl-9 pr-4 py-3 text-white text-sm focus:outline-none focus:border-primaryPink"
                        placeholder="Nama atau kategori..."
                      />
                    </div>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {mfCatalog.map((mf) => (
                      <div
                        key={mf.id}
                        onClick={() => setSelectedMf(mf)}
                        className="p-3 bg-surfaceSecondary rounded-xl border border-borderCustom cursor-pointer hover:border-primaryPink transition-colors flex justify-between items-center"
                      >
                        <div>
                          <h4 className="font-semibold text-white text-sm">{mf.name}</h4>
                          <p className="text-[11px] text-textMuted">{mf.category} • {mf.manager}</p>
                        </div>
                        <span className="text-xs font-bold text-successGreen">NAB {mf.nav}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory(null)}
                    className="w-full bg-surfaceSecondary text-textSecondary py-3 rounded-xl font-medium hover:bg-surface"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    const amt = parseFloat(mfAmount) || 0;
                    const navVal = selectedMf.isCustom ? (parseFloat(selectedMf.nav) || 1000) : selectedMf.nav;
                    const units = amt / navVal;
                    handleBuyInvestment(e, 'MUTUAL_FUND', selectedMf.id, selectedMf.name || 'Reksa Dana Lainnya', units, navVal, amt, 0);
                  }}
                  className="space-y-4"
                >
                  {selectedMf.isCustom ? (
                    <div className="space-y-3 p-3 bg-surfaceSecondary rounded-xl border border-borderCustom">
                      <h4 className="font-bold text-white text-sm text-primaryPink">Form Reksa Dana Lainnya (Manual)</h4>
                      <div>
                        <label className="block text-xs font-medium text-textSecondary mb-1">Nama Produk Reksa Dana</label>
                        <input
                          type="text"
                          required
                          value={selectedMf.name}
                          onChange={(e) => setSelectedMf({ ...selectedMf, name: e.target.value })}
                          className="w-full bg-surface border border-borderCustom rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primaryPink"
                          placeholder="Contoh: Reksa Dana Pasar Uang XYZ"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-textSecondary mb-1">NAB / Harga Unit (Rp)</label>
                        <input
                          type="number"
                          step="0.0001"
                          required
                          value={selectedMf.nav}
                          onChange={(e) => setSelectedMf({ ...selectedMf, nav: e.target.value })}
                          className="w-full bg-surface border border-borderCustom rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primaryPink"
                          placeholder="1000"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-surfaceSecondary rounded-xl border border-borderCustom">
                      <h4 className="font-bold text-white text-sm">{selectedMf.name}</h4>
                      <p className="text-xs text-textMuted">NAB: {selectedMf.nav} • {selectedMf.manager}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-textSecondary mb-1.5">Platform Pembelian</label>
                    <select
                      value={mfPlatform}
                      onChange={(e) => setMfPlatform(e.target.value)}
                      className="w-full bg-surfaceSecondary border border-borderCustom rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primaryPink"
                    >
                      <option value="Bibit">Bibit</option>
                      <option value="Bareksa">Bareksa</option>
                      <option value="Makmur">Makmur</option>
                      <option value="Custom">Custom / Lainnya</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-textSecondary mb-1.5">Nominal Pembelian (Rp)</label>
                    <input
                      type="number"
                      required
                      value={mfAmount}
                      onChange={(e) => setMfAmount(e.target.value)}
                      className="w-full bg-surfaceSecondary border border-borderCustom rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primaryPink"
                      placeholder="1000000"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-textSecondary mb-1.5">Dompet Sumber Dana</label>
                    <select
                      value={walletId}
                      onChange={(e) => setWalletId(e.target.value)}
                      className="w-full bg-surfaceSecondary border border-borderCustom rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primaryPink"
                    >
                      {wallets.map((w) => (
                        <option key={w.id} value={w.id}>{w.name} ({formatIDR(Number(w.currentBalance))})</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedMf(null)}
                      className="flex-1 bg-surfaceSecondary border border-borderCustom text-textSecondary py-3 rounded-xl font-medium hover:bg-surface"
                    >
                      Kembali
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-primaryPink text-white py-3 rounded-xl font-medium hover:bg-primaryPink/90 shadow-lg shadow-primaryPink/20"
                    >
                      Simpan
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Saham Wizard Form (With "Lainnya" Option & No Broker Fee) */}
        {showAddModal && selectedCategory === 'STOCK' && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[100]">
            <div className="bg-surface border border-borderCustom rounded-2xl p-6 max-w-md w-full">
              <h3 className="text-lg font-bold text-white mb-4">Tambah Saham</h3>
              {!selectedStock ? (
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => setSelectedStock({ symbol: 'CUSTOM-' + Math.floor(Math.random() * 1000), name: '', currentPrice: 1000, isCustom: true })}
                    className="w-full bg-surfaceSecondary border border-primaryPink/60 text-primaryPink py-3 rounded-xl font-medium hover:bg-primaryPink/10 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Saham Lainnya (Manual)</span>
                  </button>

                  <div>
                    <label className="block text-xs font-medium text-textSecondary mb-1.5">Atau Cari Kode / Nama Saham</label>
                    <div className="relative">
                      <Search className="w-4 h-4 text-textMuted absolute left-3 top-3.5" />
                      <input
                        type="text"
                        value={stockSearch}
                        onChange={(e) => searchStocks(e.target.value)}
                        className="w-full bg-surfaceSecondary border border-borderCustom rounded-xl pl-9 pr-4 py-3 text-white text-sm focus:outline-none focus:border-primaryPink"
                        placeholder="Contoh: BBCA, Telkom..."
                      />
                    </div>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {stockCatalog.map((stk) => (
                      <div
                        key={stk.symbol}
                        onClick={() => {
                          setSelectedStock(stk);
                          setStockPrice(stk.currentPrice.toString());
                        }}
                        className="p-3 bg-surfaceSecondary rounded-xl border border-borderCustom cursor-pointer hover:border-primaryPink transition-colors flex justify-between items-center"
                      >
                        <div>
                          <h4 className="font-semibold text-white text-sm">{stk.symbol} — {stk.name}</h4>
                          <p className="text-[11px] text-textMuted">{stk.sector}</p>
                        </div>
                        <span className="text-xs font-bold text-successGreen">{formatIDR(stk.currentPrice)}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory(null)}
                    className="w-full bg-surfaceSecondary text-textSecondary py-3 rounded-xl font-medium hover:bg-surface"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    const lots = parseInt(stockLots) || 0;
                    const shares = lots * 100;
                    const price = parseFloat(stockPrice) || parseFloat(selectedStock.currentPrice) || 0;
                    const total = shares * price;
                    handleBuyInvestment(e, 'STOCK', selectedStock.symbol, selectedStock.name || 'Saham Lainnya', shares, price, total, 0);
                  }}
                  className="space-y-4"
                >
                  {selectedStock.isCustom ? (
                    <div className="space-y-3 p-3 bg-surfaceSecondary rounded-xl border border-borderCustom">
                      <h4 className="font-bold text-white text-sm text-primaryPink">Form Saham Lainnya (Manual)</h4>
                      <div>
                        <label className="block text-xs font-medium text-textSecondary mb-1">Kode Saham (Simbol)</label>
                        <input
                          type="text"
                          required
                          value={selectedStock.symbol}
                          onChange={(e) => setSelectedStock({ ...selectedStock, symbol: e.target.value.toUpperCase() })}
                          className="w-full bg-surface border border-borderCustom rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primaryPink"
                          placeholder="Contoh: XYZ"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-textSecondary mb-1">Nama Perusahaan Saham</label>
                        <input
                          type="text"
                          required
                          value={selectedStock.name}
                          onChange={(e) => setSelectedStock({ ...selectedStock, name: e.target.value })}
                          className="w-full bg-surface border border-borderCustom rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primaryPink"
                          placeholder="Contoh: PT XYZ Tbk"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-textSecondary mb-1">Harga per Lembar (Rp)</label>
                        <input
                          type="number"
                          required
                          value={stockPrice}
                          onChange={(e) => {
                            setStockPrice(e.target.value);
                            setSelectedStock({ ...selectedStock, currentPrice: parseFloat(e.target.value) || 0 });
                          }}
                          className="w-full bg-surface border border-borderCustom rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primaryPink"
                          placeholder="1000"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-surfaceSecondary rounded-xl border border-borderCustom">
                      <h4 className="font-bold text-white text-sm">{selectedStock.symbol} — {selectedStock.name}</h4>
                      <p className="text-xs text-textMuted">Harga Referensi: {formatIDR(selectedStock.currentPrice)}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-textSecondary mb-1.5">Sekuritas / Platform</label>
                    <select
                      value={stockPlatform}
                      onChange={(e) => setStockPlatform(e.target.value)}
                      className="w-full bg-surfaceSecondary border border-borderCustom rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primaryPink"
                    >
                      <option value="Stockbit">Stockbit</option>
                      <option value="Ajaib">Ajaib</option>
                      <option value="IPOT">IPOT</option>
                      <option value="MOST">MOST</option>
                      <option value="Custom">Custom / Lainnya</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-textSecondary mb-1.5">Jumlah Lot (1 Lot = 100 Lembar)</label>
                    <input
                      type="number"
                      required
                      value={stockLots}
                      onChange={(e) => setStockLots(e.target.value)}
                      className="w-full bg-surfaceSecondary border border-borderCustom rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primaryPink"
                      placeholder="Contoh: 10"
                    />
                  </div>

                  {!selectedStock.isCustom && (
                    <div>
                      <label className="block text-xs font-medium text-textSecondary mb-1.5">Harga Beli per Lembar (Rp)</label>
                      <input
                        type="number"
                        required
                        value={stockPrice}
                        onChange={(e) => setStockPrice(e.target.value)}
                        className="w-full bg-surfaceSecondary border border-borderCustom rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primaryPink"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-textSecondary mb-1.5">Dompet Sumber Dana</label>
                    <select
                      value={walletId}
                      onChange={(e) => setWalletId(e.target.value)}
                      className="w-full bg-surfaceSecondary border border-borderCustom rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primaryPink"
                    >
                      {wallets.map((w) => (
                        <option key={w.id} value={w.id}>{w.name} ({formatIDR(Number(w.currentBalance))})</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedStock(null)}
                      className="flex-1 bg-surfaceSecondary border border-borderCustom text-textSecondary py-3 rounded-xl font-medium hover:bg-surface"
                    >
                      Kembali
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-primaryPink text-white py-3 rounded-xl font-medium hover:bg-primaryPink/90 shadow-lg shadow-primaryPink/20"
                    >
                      Simpan
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Crypto Coming Soon Modal */}
        {cryptoModalOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[100]">
            <div className="bg-surface border border-borderCustom rounded-2xl p-6 max-w-sm w-full text-center space-y-4">
              <div className="bg-warningYellow/10 text-warningYellow p-3 rounded-2xl w-fit mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">Fitur Kripto — Coming Soon</h3>
              <p className="text-xs text-textMuted">
                Modul pengelolaan portofolio dan pelacakan aset kripto sedang dalam tahap pengembangan dan akan segera hadir di pembaruan berikutnya.
              </p>
              <button
                onClick={() => setCryptoModalOpen(false)}
                className="w-full bg-primaryPink text-white py-3 rounded-xl font-medium hover:bg-primaryPink/90"
              >
                Mengerti
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
