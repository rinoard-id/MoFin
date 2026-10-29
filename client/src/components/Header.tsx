import React, { useEffect, useState } from 'react';
import { SyncIndicator } from './SyncIndicator';
import { MoreVertical, Settings, LogOut } from 'lucide-react';
import { api, removeToken } from '../api';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const [user, setUser] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/auth/me').then(setUser).catch(() => {});
  }, []);

  const handleLogout = () => {
    removeToken();
    window.location.href = '/login';
  };

  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-surface border-b border-borderCustom px-6 py-4 gap-4 sticky top-0 z-30">
      <div>
        <h1 className="text-xl font-bold text-white">{title}</h1>
        {subtitle && <p className="text-xs text-textMuted mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center space-x-4 relative">
        <SyncIndicator />

        {user && (
          <div className="flex items-center space-x-3 bg-surfaceSecondary border border-borderCustom px-3 py-1.5 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-primaryPink/20 text-primaryPink flex items-center justify-center font-bold text-xs overflow-hidden shrink-0">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span>{user.name?.charAt(0) || 'U'}</span>
              )}
            </div>
            <span className="text-xs font-semibold text-white hidden sm:inline">{user.name}</span>
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="text-textMuted hover:text-white p-1 rounded-lg transition-colors"
                title="Menu Profil & Pengaturan"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-surface border border-borderCustom rounded-xl shadow-2xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-borderCustom mb-1">
                    <p className="text-xs font-bold text-white truncate">{user.name}</p>
                    <p className="text-[10px] text-textMuted truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      navigate('/profile');
                    }}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-xs text-textSecondary hover:text-white hover:bg-surfaceSecondary transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 text-primaryPink" />
                    <span>Profil & Pengaturan</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-xs text-errorRed hover:bg-surfaceSecondary transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Keluar</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
