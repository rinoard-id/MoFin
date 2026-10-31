import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { User, Mail, Lock, Globe, DollarSign, Shield, LogOut, Camera, CheckCircle, AlertCircle, KeyRound } from 'lucide-react';
import { api, removeToken } from '../api';

export const Profile: React.FC = () => {
  const [profile, setProfile] = useState<any>({
    name: '',
    email: '',
    avatar: '',
    currency: 'IDR',
    timezone: 'Asia/Jakarta',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passMsg, setPassMsg] = useState('');
  const [passErr, setPassErr] = useState('');

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      setProfile(res);
      setForgotEmail(res.email || '');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const updated = await api.put('/auth/profile', {
        name: profile.name,
        avatar: profile.avatar,
      });
      setProfile(updated);
      setSuccessMsg('Profil berhasil diperbarui!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memperbarui profil');
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran gambar maksimal 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setProfile((prev: any) => ({ ...prev, avatar: uploadEvent.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg('');
    setPassErr('');
    try {
      await api.put('/auth/profile', {
        currentPassword,
        newPassword,
      });
      setPassMsg('Kata sandi berhasil diubah!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPassErr(err.message || 'Gagal mengubah kata sandi');
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotStatus('');
    try {
      const res = await api.post('/auth/forgot-password', { email: forgotEmail });
      setForgotStatus(res.message || 'Instruksi pemulihan telah dikirim.');
    } catch (err: any) {
      setForgotStatus(err.message || 'Gagal mengirim instruksi pemulihan.');
    }
  };

  const handleLogout = () => {
    removeToken();
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bgMain pb-24 md:pb-12">
        <Header title="Profil & Pengaturan" subtitle="Kelola identitas pemilik akun dan preferensi aplikasi." />
        <div className="p-6 text-center text-textMuted">Memuat data profil...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bgMain pb-24 md:pb-12">
      <Header title="Profil & Pengaturan" subtitle="Kelola identitas pemilik akun, keamanan, dan preferensi aplikasi." />

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Owner Identity Banner Card */}
        <div className="bg-surface border border-borderCustom rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primaryPink/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-surfaceSecondary border-2 border-primaryPink flex items-center justify-center overflow-hidden text-white text-2xl font-bold shadow-lg">
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <span>{profile.name?.charAt(0) || 'U'}</span>
              )}
            </div>
          </div>

          <div className="flex-1 text-center md:text-left space-y-1">
            <div className="inline-block bg-primaryPink/10 text-primaryPink text-[11px] font-semibold px-3 py-1 rounded-full mb-1">
              Pemilik Akun Utama
            </div>
            <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
            <div className="flex items-center justify-center md:justify-start space-x-2 text-textMuted text-xs">
              <Mail className="w-4 h-4 text-infoBlue" />
              <span>Email Login: <strong className="text-white">{profile.email}</strong></span>
            </div>
            <p className="text-xs text-textSecondary pt-1">
              Akun terverifikasi dan aktif di MoFin Personal Finance.
            </p>
          </div>
        </div>

        {/* Success/Error Alerts */}
        {successMsg && (
          <div className="bg-successGreen/10 border border-successGreen/30 text-successGreen p-4 rounded-xl text-xs flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="bg-errorRed/10 border border-errorRed/30 text-errorRed p-4 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Edit Profile Info */}
          <div className="bg-surface border border-borderCustom rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <User className="w-5 h-5 text-primaryPink" />
              <span>Informasi Profil & Foto</span>
            </h3>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-textSecondary mb-1.5">Nama Lengkap (Pemilik Akun)</label>
                <input
                  type="text"
                  required
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full bg-surfaceSecondary border border-borderCustom rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primaryPink"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-textSecondary mb-1.5">Email Login (Tidak Dapat Diubah)</label>
                <input
                  type="email"
                  disabled
                  value={profile.email}
                  className="w-full bg-surfaceSecondary/50 border border-borderCustom rounded-xl px-4 py-3 text-textMuted text-sm cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-textSecondary mb-1.5">Foto Profil</label>
                <div className="flex items-center space-x-3">
                  <label className="cursor-pointer bg-surfaceSecondary hover:bg-surface border border-borderCustom text-white px-4 py-2.5 rounded-xl text-xs font-medium flex items-center space-x-2 transition-colors">
                    <Camera className="w-4 h-4 text-primaryPink" />
                    <span>Pilih Foto dari Perangkat</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  {profile.avatar && (
                    <button
                      type="button"
                      onClick={() => setProfile({ ...profile, avatar: '' })}
                      className="text-xs text-errorRed hover:underline"
                    >
                      Hapus Foto
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-textMuted mt-1">Pilih file gambar (maks. 2MB) atau biarkan kosong untuk inisial nama.</p>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-primaryPink text-white py-3 rounded-xl font-medium hover:bg-primaryPink/90 shadow-lg shadow-primaryPink/25 transition-colors"
              >
                {saving ? 'Menyimpan...' : 'Simpan Perubahan Profil'}
              </button>
            </form>
          </div>

          {/* Security & Password */}
          <div className="space-y-6">
            <div className="bg-surface border border-borderCustom rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Lock className="w-5 h-5 text-warningYellow" />
                <span>Keamanan & Kata Sandi</span>
              </h3>

              {passMsg && <div className="p-3 bg-successGreen/10 text-successGreen rounded-xl text-xs">{passMsg}</div>}
              {passErr && <div className="p-3 bg-errorRed/10 text-errorRed rounded-xl text-xs">{passErr}</div>}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-textSecondary mb-1.5">Kata Sandi Saat Ini</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-surfaceSecondary border border-borderCustom rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primaryPink"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-textSecondary mb-1.5">Kata Sandi Baru</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-surfaceSecondary border border-borderCustom rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primaryPink"
                    placeholder="Minimal 6 karakter"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-surfaceSecondary border border-borderCustom text-white py-3 rounded-xl font-medium hover:border-primaryPink transition-colors"
                >
                  Ubah Kata Sandi
                </button>
              </form>

              <div className="pt-2 border-t border-borderCustom flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold text-white">Lupa Kata Sandi?</h4>
                  <p className="text-[11px] text-textMuted">Kirim instruksi pemulihan ke email terdaftar.</p>
                </div>
                <button
                  onClick={() => setShowForgotModal(true)}
                  className="px-4 py-2 bg-warningYellow/10 text-warningYellow rounded-xl text-xs font-medium hover:bg-warningYellow/20 transition-colors"
                >
                  Reset Sandi
                </button>
              </div>
            </div>

            {/* Standard Settings & Logout */}
            <div className="bg-surface border border-borderCustom rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Shield className="w-5 h-5 text-infoBlue" />
                <span>Pengaturan Standar & Sesi</span>
              </h3>
              <div className="space-y-3 text-xs text-textSecondary">
                <div className="flex justify-between items-center p-3 bg-surfaceSecondary rounded-xl">
                  <span>Notifikasi Transaksi & Tagihan</span>
                  <span className="text-successGreen font-medium">Aktif</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-surfaceSecondary rounded-xl">
                  <span>Tema Aplikasi</span>
                  <span className="text-white font-medium">Dark Mode (Default)</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 py-3 bg-errorRed/10 text-errorRed rounded-xl font-medium hover:bg-errorRed/25 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar Akun (Logout)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[100]">
          <div className="bg-surface border border-borderCustom rounded-2xl p-6 max-w-md w-full space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <KeyRound className="w-5 h-5 text-warningYellow" />
                <span>Pemulihan Kata Sandi</span>
              </h3>
              <button onClick={() => setShowForgotModal(false)} className="text-textMuted hover:text-white">✕</button>
            </div>
            <p className="text-xs text-textMuted">
              Masukkan email akun Anda. Kami akan mengirimkan tautan pemulihan kata sandi.
            </p>
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-textSecondary mb-1.5">Email Akun</label>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full bg-surfaceSecondary border border-borderCustom rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primaryPink"
                />
              </div>
              {forgotStatus && (
                <div className="p-3 bg-infoBlue/10 text-infoBlue rounded-xl text-xs">{forgotStatus}</div>
              )}
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="flex-1 bg-surfaceSecondary text-textSecondary py-3 rounded-xl font-medium"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primaryPink text-white py-3 rounded-xl font-medium hover:bg-primaryPink/90"
                >
                  Kirim Pemulihan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
