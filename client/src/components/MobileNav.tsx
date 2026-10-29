import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Wallet, ArrowLeftRight, TrendingUp, PieChart } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const navItems = [
    { to: '/', label: 'Beranda', icon: LayoutDashboard },
    { to: '/wallets', label: 'Dompet', icon: Wallet },
    { to: '/transactions', label: 'Transaksi', icon: ArrowLeftRight },
    { to: '/investments', label: 'Investasi', icon: TrendingUp },
    { to: '/reports', label: 'Laporan', icon: PieChart },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-borderCustom z-50 px-4 py-2 flex justify-around items-center">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center py-1 px-3 rounded-lg text-xs font-medium transition-colors ${
                isActive ? 'text-primaryPink' : 'text-textMuted hover:text-white'
              }`
            }
          >
            <Icon className="w-5 h-5 mb-1" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
