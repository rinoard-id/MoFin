# MoFin — Personal Finance Web Application

MoFin adalah platform manajemen keuangan pribadi modern, responsif, aman, dan berstandar profesional dengan konsep **Offline-First**, dibangun menggunakan tumpukan teknologi modern.

## Fitur Utama

1. **Autentikasi & Akun Aman**: Registrasi, login dengan hashing password (bcrypt), dan isolasi data per pengguna.
2. **Dashboard Komprehensif**: Total kekayaan bersih, saldo dompet, nilai investasi, pemasukan, pengeluaran, serta grafik arus kas (Recharts).
3. **Manajemen Dompet & Mutasi Rekening**: Mendukung Bank Konvensional, Bank Digital, E-Wallet, dan Tunai dengan ikon berbeda serta laporan mutasi layaknya perbankan.
4. **Pencatatan Transaksi & Offline-First**: Mendukung pemasukan, pengeluaran, dan transfer antar dompet dengan pemotongan saldo otomatis. Dilengkapi penyimpanan lokal (Dexie.js / IndexedDB) dan antrean sinkronisasi otomatis.
5. **Investasi & Target Tabungan**: Pelacakan portofolio aset dan target tabungan dengan progress bar interaktif.
6. **Desain Premium**: Tema gelap elegan dengan aksen pink utama (`#F044A5`) dan permukaan kartu bernuansa `#201C23`.

---

## Prasyarat

- Node.js (v18+)
- npm / yarn / pnpm

---

## Instalasi & Menjalankan Aplikasi

### 1. Konfigurasi Backend (`server/`)
```bash
cd server
npm install
npx prisma db push
npm run dev
```

### 2. Konfigurasi Frontend (`client/`)
```bash
cd client
npm install
npm run dev
```
