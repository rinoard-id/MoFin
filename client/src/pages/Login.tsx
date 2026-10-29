import React, { useState } from 'react';
import { Wallet, ArrowRight } from 'lucide-react';
import { api, setToken } from '../api';

export const Login: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password minimal harus 6 karakter.');
      return;
    }

    setLoading(true);
    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const body = isRegister ? { email, password, name } : { email, password };
      const res = await api.post(endpoint, body);
      setToken(res.token);
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan pada server atau data tidak valid.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bgMain flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-md bg-surface border border-borderCustom rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-primaryPink p-3 rounded-2xl text-white">
            <Wallet className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">MoFin</h1>
            <p className="text-xs text-textMuted">Personal Finance, Your Way.</p>
          </div>
        </div>

        {error && (
          <div className="bg-errorRed/10 border border-errorRed/20 text-errorRed text-sm p-3 rounded-xl mb-6 flex items-center justify-between">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-medium text-textSecondary mb-1.5">Nama Lengkap</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-surfaceSecondary border border-borderCustom rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primaryPink"
                placeholder="Nama Anda"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-textSecondary mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surfaceSecondary border border-borderCustom rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primaryPink"
              placeholder="nama@email.com"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-textSecondary mb-1.5">Password (Min. 6 Karakter)</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surfaceSecondary border border-borderCustom rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primaryPink"
              placeholder="••••••••"
            />
            {password.length > 0 && password.length < 6 && (
              <p className="text-[11px] text-errorRed mt-1">Password kurang dari 6 karakter.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primaryPink text-white font-medium py-3 rounded-xl flex items-center justify-center space-x-2 hover:bg-primaryPink/90 transition-colors shadow-lg shadow-primaryPink/20 disabled:opacity-50"
          >
            <span>{loading ? 'Memproses...' : isRegister ? 'Daftar Akun' : 'Masuk'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs text-textMuted hover:text-white transition-colors"
          >
            {isRegister ? 'Sudah punya akun? Masuk' : 'Belum punya akun? Daftar'}
          </button>
        </div>
      </div>
    </div>
  );
};
