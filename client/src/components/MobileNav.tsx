import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Wallet, ArrowLeftRight, TrendingUp, PieChart, Plus } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const navigate = useNavigate();
  const [showChoiceModal, setShowChoiceModal] = useState(false);

  const navItems = [
    { to: '/', label: 'Beranda', icon: LayoutDashboard },
    { to: '/wallets', label: 'Dompet', icon: Wallet },
    { to: '/transactions', label: 'Transaksi', icon: ArrowLeftRight },
    { to: '/investments', label: 'Investasi', icon: TrendingUp },
    { to: '/reports', label: 'Laporan', icon: PieChart },
  ];

  return (
    <>
      <nav className="md:hidden fixed bottom-4 left-4 right-4 max-w-md mx-auto glass-dock rounded-3xl z-30 px-3 py-2 flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center py-1.5 px-2 rounded-2xl text-[10px] font-medium ios-touch ${
                  isActive
                    ? 'bg-primaryPink/20 text-primaryPink shadow-sm shadow-primaryPink/20 font-semibold'
                    : 'text-textMuted hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="tracking-tight scale-90">{item.label}</span>
            </NavLink>
          );
        })}

        <div className="flex items-center justify-center pl-1">
          <button
            onClick={() => setShowChoiceModal(true)}
            className="w-10 h-10 rounded-full bg-primaryPink text-white flex items-center justify-center shadow-sm shadow-primaryPink/20 ios-touch font-bold"
            title="Tambah Baru"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Choice Popup Modal */}
      {showChoiceModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[100]">
          <div className="bg-surface border border-borderCustom rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-white">Pilih Aksi Penambahan</h3>
              <button onClick={() => setShowChoiceModal(false)} className="text-textMuted hover:text-white">✕</button>
            </div>
            <div className="space-y-2.5">
              <button
                onClick={() => {
                  setShowChoiceModal(false);
                  navigate('/transactions');
                  setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('open-add-transaction'));
                  }, 50);
                }}
                className="w-full p-4 bg-surfaceSecondary hover:bg-primaryPink/20 hover:text-primaryPink text-white rounded-xl text-xs font-semibold flex items-center justify-between transition-colors border border-borderCustom shadow-sm"
              >
                <span>Tambah Transaksi</span>
                <span className="text-primaryPink font-bold text-base">+</span>
              </button>
              <button
                onClick={() => {
                  setShowChoiceModal(false);
                  navigate('/investments');
                  setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('open-add-investment'));
                  }, 50);
                }}
                className="w-full p-4 bg-surfaceSecondary hover:bg-primaryPink/20 hover:text-primaryPink text-white rounded-xl text-xs font-semibold flex items-center justify-between transition-colors border border-borderCustom shadow-sm"
              >
                <span>Tambah Investasi</span>
                <span className="text-primaryPink font-bold text-base">+</span>
              </button>
              <button
                onClick={() => {
                  setShowChoiceModal(false);
                  navigate('/wallets');
                  setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('open-add-wallet'));
                  }, 50);
                }}
                className="w-full p-4 bg-surfaceSecondary hover:bg-primaryPink/20 hover:text-primaryPink text-white rounded-xl text-xs font-semibold flex items-center justify-between transition-colors border border-borderCustom shadow-sm"
              >
                <span>Tambah Dompet</span>
                <span className="text-primaryPink font-bold text-base">+</span>
              </button>
            </div>
            <button
              onClick={() => setShowChoiceModal(false)}
              className="w-full py-3 bg-surfaceSecondary text-textMuted hover:text-white rounded-xl text-xs font-medium transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </>
  );
};
