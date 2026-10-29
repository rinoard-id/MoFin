import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { Dashboard } from './pages/Dashboard';
import { Wallets } from './pages/Wallets';
import { WalletDetail } from './pages/WalletDetail';
import { Transactions } from './pages/Transactions';
import { Investments } from './pages/Investments';
import { Goals } from './pages/Goals';
import { Reports } from './pages/Reports';
import { Profile } from './pages/Profile';
import { Login } from './pages/Login';
import { getToken } from './api';

export function App() {
  const token = getToken();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            token ? (
              <div className="flex min-h-screen bg-bgMain">
                <Sidebar />
                <main className="flex-1 overflow-y-auto">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/wallets" element={<Wallets />} />
                    <Route path="/wallets/:id" element={<WalletDetail />} />
                    <Route path="/transactions" element={<Transactions />} />
                    <Route path="/investments" element={<Investments />} />
                    <Route path="/goals" element={<Goals />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
                <MobileNav />
              </div>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
