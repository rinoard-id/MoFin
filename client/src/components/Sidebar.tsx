import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Wallet, ArrowLeftRight, TrendingUp, Target, PieChart, User, LogOut } from 'lucide-react';
import { removeToken } from '../api';

export const Sidebar: React.FC = () => {
  const navItems = [
    { to: '/', label: 'Beranda', icon: LayoutDashboard },
    { to: '/wallets', label: 'Dompet', icon: Wallet },
    { to: '/transactions', label: 'Transaksi', icon: ArrowLeftRight },
    { to: '/investments', label: 'Investasi', icon: TrendingUp },
    { to: '/goals', label: 'Target Tabungan', icon: Target },
    { to: '/reports', label: 'Laporan', icon: PieChart },
    { to: '/profile', label: 'Profil & Pengaturan', icon: User },
  ];

  const handleLogout = () => {
    removeToken();
    window.location.href = '/login';
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-surface border-r border-borderCustom h-screen sticky top-0">
      <div className="p-6 flex items-center space-x-3 border-b border-borderCustom">
        <div className="bg-primaryPink p-2 rounded-xl text-white">
          <Wallet className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-tight text-white">MoFin</h1>
          <p className="text-xs text-textMuted">Personal Finance</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primaryPink text-white shadow-lg shadow-primaryPink/20'
                    : 'text-textSecondary hover:bg-surfaceSecondary hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-borderCustom">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-errorRed hover:bg-surfaceSecondary transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
};
