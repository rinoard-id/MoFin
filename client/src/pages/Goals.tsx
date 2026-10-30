import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { Target, Plus } from 'lucide-react';
import { api } from '../api';

export const Goals: React.FC = () => {
  const [goals, setGoals] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const res = await api.get('/goals');
      setGoals(res);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/goals', {
        name,
        targetAmount: parseFloat(targetAmount) || 0,
        currentAmount: parseFloat(currentAmount) || 0,
      });
      setShowModal(false);
      setName('');
      setTargetAmount('');
      setCurrentAmount('');
      loadGoals();
    } catch (err) {
      console.error(err);
    }
  };

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="min-h-screen bg-bgMain pb-24 md:pb-12">
      <Header title="Target Tabungan" subtitle="Dana darurat, rumah, liburan, dan impian masa depan." />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">Daftar Target</h2>
          <button
            onClick={() => setShowModal(true)}
            className="bg-primaryPink text-white px-4 py-2.5 rounded-xl text-sm font-medium flex items-center space-x-2 hover:bg-primaryPink/90 transition-colors shadow-lg shadow-primaryPink/20"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Target</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.length === 0 ? (
            <div className="col-span-full bg-surface border border-borderCustom rounded-2xl p-8 text-center text-textMuted text-sm">
              Belum ada target tabungan.
            </div>
          ) : (
            goals.map((g) => {
              const percentage = Math.min(100, Math.round((Number(g.currentAmount) / Number(g.targetAmount)) * 100));
              return (
                <div key={g.id} className="bg-surface border border-borderCustom rounded-2xl p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-primaryPink/10 text-primaryPink p-3 rounded-2xl">
                        <Target className="w-6 h-6" />
                      </div>
                      <span className="text-xs bg-surfaceSecondary px-2.5 py-1 rounded-full text-textMuted border border-borderCustom">{percentage}%</span>
                    </div>
                    <h3 className="font-bold text-white text-lg mb-4">{g.name}</h3>
                    <div className="w-full bg-surfaceSecondary rounded-full h-2.5 mb-4 overflow-hidden border border-borderCustom">
                      <div className="bg-primaryPink h-2.5 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-borderCustom">
                    <div>
                      <span className="text-xs text-textMuted">Terkumpul</span>
                      <p className="font-bold text-white text-sm">{formatIDR(Number(g.currentAmount))}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-textMuted">Target</span>
                      <p className="font-bold text-white text-sm">{formatIDR(Number(g.targetAmount))}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[100]">
            <div className="bg-surface border border-borderCustom rounded-2xl p-6 max-w-md w-full">
              <h3 className="text-lg font-bold text-white mb-4">Tambah Target Tabungan</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-textSecondary mb-1.5">Nama Target</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-surfaceSecondary border border-borderCustom rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primaryPink"
                    placeholder="Contoh: Dana Darurat"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-textSecondary mb-1.5">Target Nominal (Rp)</label>
                  <input
                    type="number"
                    required
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full bg-surfaceSecondary border border-borderCustom rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primaryPink"
                    placeholder="50000000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-textSecondary mb-1.5">Saldo Awal Terkumpul (Rp)</label>
                  <input
                    type="number"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
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
