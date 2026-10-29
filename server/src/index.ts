import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: any;
  }
}

dotenv.config();

const prisma = new PrismaClient();
const server = Fastify({ logger: true });

async function cleanDb() {
  try {
    await prisma.transaction.deleteMany({});
    await prisma.wallet.deleteMany({});
    await prisma.savingsGoal.deleteMany({});
    await prisma.investmentHolding.deleteMany({});
    console.log('Database successfully cleared of all transactions and records.');
  } catch (e) {
    console.log('Clean db note:', e);
  }
}
cleanDb();

// Seed comprehensive Investment Catalogs (IDX Stocks & Mutual Funds)
async function seedCatalogs() {
  try {
    const existingStocksCount = await prisma.investmentInstrument.count({ where: { assetType: 'STOCK' } });
    if (existingStocksCount < 20) {
      const idxStocks = [
        { symbol: 'BBCA', name: 'PT Bank Central Asia Tbk', assetType: 'STOCK', currentPrice: 10000 },
        { symbol: 'BBRI', name: 'PT Bank Rakyat Indonesia (Persero) Tbk', assetType: 'STOCK', currentPrice: 5200 },
        { symbol: 'BMRI', name: 'PT Bank Mandiri (Persero) Tbk', assetType: 'STOCK', currentPrice: 6500 },
        { symbol: 'TLKM', name: 'PT Telkom Indonesia (Persero) Tbk', assetType: 'STOCK', currentPrice: 3100 },
        { symbol: 'ASII', name: 'PT Astra International Tbk', assetType: 'STOCK', currentPrice: 5100 },
        { symbol: 'BBNI', name: 'PT Bank Negara Indonesia (Persero) Tbk', assetType: 'STOCK', currentPrice: 5400 },
        { symbol: 'ICBP', name: 'PT Indofood CBP Sukses Makmur Tbk', assetType: 'STOCK', currentPrice: 11500 },
        { symbol: 'ANTM', name: 'PT Aneka Tambang Tbk', assetType: 'STOCK', currentPrice: 1600 },
        { symbol: 'GOTO', name: 'PT GoTo Gojek Tokopedia Tbk', assetType: 'STOCK', currentPrice: 68 },
        { symbol: 'ADRO', name: 'PT Adaro Energy Indonesia Tbk', assetType: 'STOCK', currentPrice: 3200 },
        { symbol: 'UNVR', name: 'PT Unilever Indonesia Tbk', assetType: 'STOCK', currentPrice: 2400 },
        { symbol: 'SMGR', name: 'PT Semen Indonesia (Persero) Tbk', assetType: 'STOCK', currentPrice: 3900 },
        { symbol: 'KLBF', name: 'PT Kalbe Farma Tbk', assetType: 'STOCK', currentPrice: 1650 },
        { symbol: 'INDF', name: 'PT Indofood Sukses Makmur Tbk', assetType: 'STOCK', currentPrice: 6400 },
        { symbol: 'PGAS', name: 'PT Perusahaan Gas Negara Tbk', assetType: 'STOCK', currentPrice: 1450 },
        { symbol: 'MDKA', name: 'PT Merdeka Copper Gold Tbk', assetType: 'STOCK', currentPrice: 2600 },
        { symbol: 'BRPT', name: 'PT Barito Pacific Tbk', assetType: 'STOCK', currentPrice: 1100 },
        { symbol: 'CPIN', name: 'PT Charoen Pokphand Indonesia Tbk', assetType: 'STOCK', currentPrice: 5100 },
        { symbol: 'INKP', name: 'PT Indah Kiat Pulp & Paper Tbk', assetType: 'STOCK', currentPrice: 8500 },
        { symbol: 'MAPI', name: 'PT Mitra Adiperkasa Tbk', assetType: 'STOCK', currentPrice: 1800 },
      ];

      for (const stk of idxStocks) {
        await prisma.investmentInstrument.upsert({
          where: { symbol: stk.symbol },
          update: { currentPrice: stk.currentPrice },
          create: {
            symbol: stk.symbol,
            name: stk.name,
            assetType: 'STOCK',
            currentPrice: stk.currentPrice,
            source: 'IDX_CATALOG',
          },
        });
      }
      console.log('Successfully seeded IDX Stock catalog.');
    }

    // Fetch or seed Mutual Funds
    const existingMfCount = await prisma.investmentInstrument.count({ where: { assetType: 'MUTUAL_FUND' } });
    if (existingMfCount < 5) {
      try {
        const res = await fetch('https://reksadana.risanb.com/api/');
        if (res.ok) {
          const data: any = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            for (const mf of data.slice(0, 100)) {
              if (mf.id && mf.name) {
                await prisma.investmentInstrument.upsert({
                  where: { symbol: mf.id },
                  update: { currentPrice: mf.nav || 1000 },
                  create: {
                    symbol: mf.id,
                    name: mf.name,
                    assetType: 'MUTUAL_FUND',
                    currentPrice: mf.nav || 1000,
                    source: 'RISANB_API',
                  },
                });
              }
            }
            console.log('Successfully synced Mutual Fund catalog from risanb.com API.');
          }
        }
      } catch (apiErr) {
        console.log('External mutual fund API offline, using rich local fallback seed.');
        const fallbackMf = [
          { symbol: 'SC001', name: 'Sucorinvest Money Market Fund', currentPrice: 1450.25 },
          { symbol: 'MN002', name: 'Manulife Pendapatan Tetap Indonesia', currentPrice: 2150.10 },
          { symbol: 'SC003', name: 'Sucorinvest Equity Fund', currentPrice: 3400.50 },
          { symbol: 'SCH04', name: 'Schroder Dana Prestasi Plus', currentPrice: 7800.00 },
          { symbol: 'BBN05', name: 'BNP Paribas Pesona Syariah', currentPrice: 2900.00 },
          { symbol: 'TR006', name: 'Trimegah Reksa Kas Pendapatan', currentPrice: 1250.00 },
        ];
        for (const mf of fallbackMf) {
          await prisma.investmentInstrument.upsert({
            where: { symbol: mf.symbol },
            update: { currentPrice: mf.currentPrice },
            create: {
              symbol: mf.symbol,
              name: mf.name,
              assetType: 'MUTUAL_FUND',
              currentPrice: mf.currentPrice,
              source: 'LOCAL_FALLBACK',
            },
          });
        }
      }
    }
  } catch (e) {
    console.log('Catalog seeding note:', e);
  }
}
seedCatalogs();

server.register(cors, {
  origin: true,
  credentials: true,
});

server.register(jwt, {
  secret: process.env.JWT_SECRET || 'mofin-super-secret-jwt-key-2026',
});

server.decorate('authenticate', async (request: any, reply: any) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.code(401).send({ error: 'Unauthorized' });
  }
});

server.get('/api/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString(), app: 'MoFin API' };
});

// Auth Routes
server.post('/api/auth/register', async (request, reply) => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string(),
  });

  const result = schema.safeParse(request.body);
  if (!result.success) {
    return reply.code(400).send({ error: result.error.format() });
  }

  const { email, password, name } = result.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return reply.code(400).send({ error: 'Email already registered' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash, name },
  });

  const defaultCategories = [
    { name: 'Gaji', type: 'INCOME', icon: 'briefcase', color: '#86EFAC' },
    { name: 'Freelance', type: 'INCOME', icon: 'laptop', color: '#93C5FD' },
    { name: 'Dividen', type: 'INCOME', icon: 'trending-up', color: '#FCD34D' },
    { name: 'Makanan & Minuman', type: 'EXPENSE', icon: 'utensils', color: '#FCA5A5' },
    { name: 'Transportasi', type: 'EXPENSE', icon: 'car', color: '#F9A8D4' },
    { name: 'Belanja', type: 'EXPENSE', icon: 'shopping-bag', color: '#F044A5' },
    { name: 'Tagihan & Utilitas', type: 'EXPENSE', icon: 'zap', color: '#FCD34D' },
    { name: 'Hiburan', type: 'EXPENSE', icon: 'film', color: '#93C5FD' },
  ];

  for (const cat of defaultCategories) {
    await prisma.category.create({
      data: { userId: user.id, name: cat.name, type: cat.type, icon: cat.icon, color: cat.color },
    });
  }

  const token = server.jwt.sign({ id: user.id, email: user.email });
  return { token, user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar, currency: user.currency } };
});

server.post('/api/auth/login', async (request, reply) => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string(),
  });

  const result = schema.safeParse(request.body);
  if (!result.success) {
    return reply.code(400).send({ error: result.error.format() });
  }

  const { email, password } = result.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return reply.code(401).send({ error: 'Invalid email or password' });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return reply.code(401).send({ error: 'Invalid email or password' });
  }

  const token = server.jwt.sign({ id: user.id, email: user.email });
  return { token, user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar, currency: user.currency } };
});

server.get('/api/auth/me', { preValidation: [server.authenticate] }, async (request: any, reply) => {
  const user = await prisma.user.findUnique({ where: { id: request.user.id } });
  if (!user) return reply.code(404).send({ error: 'User not found' });
  return { id: user.id, email: user.email, name: user.name, avatar: user.avatar, currency: user.currency, timezone: user.timezone };
});

server.put('/api/auth/profile', { preValidation: [server.authenticate] }, async (request: any, reply) => {
  const schema = z.object({
    name: z.string().optional(),
    avatar: z.string().optional(),
    currency: z.string().optional(),
    timezone: z.string().optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().min(6).optional(),
  });

  const result = schema.safeParse(request.body);
  if (!result.success) return reply.code(400).send({ error: result.error.format() });

  const data = result.data;
  const user = await prisma.user.findUnique({ where: { id: request.user.id } });
  if (!user) return reply.code(404).send({ error: 'User not found' });

  let passwordHash = user.passwordHash;
  if (data.currentPassword && data.newPassword) {
    const valid = await bcrypt.compare(data.currentPassword, user.passwordHash);
    if (!valid) return reply.code(400).send({ error: 'Password lama salah' });
    passwordHash = await bcrypt.hash(data.newPassword, 10);
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      name: data.name !== undefined ? data.name : user.name,
      avatar: data.avatar !== undefined ? data.avatar : user.avatar,
      currency: data.currency !== undefined ? data.currency : user.currency,
      timezone: data.timezone !== undefined ? data.timezone : user.timezone,
      passwordHash,
    },
  });

  return { id: updated.id, email: updated.email, name: updated.name, avatar: updated.avatar, currency: updated.currency, timezone: updated.timezone };
});

server.post('/api/auth/forgot-password', async (request: any, reply) => {
  const schema = z.object({
    email: z.string().email(),
  });
  const result = schema.safeParse(request.body);
  if (!result.success) return reply.code(400).send({ error: result.error.format() });

  return { message: 'Instruksi pemulihan kata sandi telah dikirim ke email Anda jika terdaftar.' };
});

// Wallets Routes
server.get('/api/wallets', { preValidation: [server.authenticate] }, async (request: any) => {
  const wallets = await prisma.wallet.findMany({ where: { userId: request.user.id } });
  const transactions = await prisma.transaction.findMany({ where: { userId: request.user.id } });

  return wallets.map((w) => {
    let balance = Number(w.initialBalance);
    transactions.forEach((t) => {
      if (t.walletId === w.id) {
        if (t.type === 'INCOME' || t.type === 'REFUND') balance += Number(t.amount);
        if (t.type === 'EXPENSE') balance -= Number(t.amount) + Number(t.fee || 0);
        if (t.type === 'TRANSFER') balance -= Number(t.amount) + Number(t.fee || 0);
      }
      if (t.targetWalletId === w.id && t.type === 'TRANSFER') {
        balance += Number(t.amount);
      }
    });
    return { ...w, currentBalance: balance };
  });
});

server.get('/api/wallets/:id', { preValidation: [server.authenticate] }, async (request: any, reply) => {
  const { id } = request.params;
  const wallet = await prisma.wallet.findFirst({ where: { id, userId: request.user.id } });
  if (!wallet) return reply.code(404).send({ error: 'Wallet not found' });

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: request.user.id,
      OR: [{ walletId: id }, { targetWalletId: id }],
    },
    include: { wallet: true, targetWallet: true, category: true },
    orderBy: { date: 'desc' },
  });

  const allUserTxs = await prisma.transaction.findMany({ where: { userId: request.user.id } });
  let balance = Number(wallet.initialBalance);
  allUserTxs.forEach((t) => {
    if (t.walletId === id) {
      if (t.type === 'INCOME' || t.type === 'REFUND') balance += Number(t.amount);
      if (t.type === 'EXPENSE') balance -= Number(t.amount) + Number(t.fee || 0);
      if (t.type === 'TRANSFER') balance -= Number(t.amount) + Number(t.fee || 0);
    }
    if (t.targetWalletId === id && t.type === 'TRANSFER') {
      balance += Number(t.amount);
    }
  });

  const txsWithMutasi = transactions.map((t) => {
    const isOut = t.walletId === id;
    return {
      ...t,
      tags: JSON.parse(t.tags || '[]'),
      isOut,
    };
  });

  return { ...wallet, currentBalance: balance, transactions: txsWithMutasi };
});

server.post('/api/wallets', { preValidation: [server.authenticate] }, async (request: any, reply) => {
  const schema = z.object({
    name: z.string(),
    type: z.enum(['BANK', 'DIGITAL_BANK', 'E_WALLET', 'CASH', 'SAVINGS', 'CUSTOM']),
    institution: z.string().optional(),
    currency: z.string().default('IDR'),
    initialBalance: z.number().default(0),
    icon: z.string().optional(),
    color: z.string().optional(),
  });

  const result = schema.safeParse(request.body);
  if (!result.success) return reply.code(400).send({ error: result.error.format() });

  const wallet = await prisma.wallet.create({
    data: {
      userId: request.user.id,
      ...result.data,
      initialBalance: result.data.initialBalance,
    },
  });
  return wallet;
});

// Categories Routes
server.get('/api/categories', { preValidation: [server.authenticate] }, async (request: any) => {
  return prisma.category.findMany({
    where: {
      OR: [{ userId: request.user.id }, { userId: null }],
    },
  });
});

// Transactions Routes
server.get('/api/transactions', { preValidation: [server.authenticate] }, async (request: any) => {
  const txs = await prisma.transaction.findMany({
    where: { userId: request.user.id },
    include: { wallet: true, targetWallet: true, category: true },
    orderBy: { date: 'desc' },
  });
  return txs.map((t) => ({ ...t, tags: JSON.parse(t.tags || '[]') }));
});

server.post('/api/transactions', { preValidation: [server.authenticate] }, async (request: any, reply) => {
  const schema = z.object({
    walletId: z.string(),
    targetWalletId: z.string().optional(),
    categoryId: z.string().optional(),
    type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER', 'REFUND', 'ADJUSTMENT']),
    amount: z.number().positive(),
    fee: z.number().default(0),
    currency: z.string().default('IDR'),
    date: z.string().datetime().optional(),
    notes: z.string().optional(),
    payee: z.string().optional(),
    tags: z.array(z.string()).default([]),
    idempotencyKey: z.string().optional(),
  });

  const result = schema.safeParse(request.body);
  if (!result.success) return reply.code(400).send({ error: result.error.format() });

  const data = result.data;

  if (data.idempotencyKey) {
    const existing = await prisma.transaction.findUnique({
      where: { idempotencyKey: data.idempotencyKey },
    });
    if (existing) return { ...existing, tags: JSON.parse(existing.tags || '[]') };
  }

  const tx = await prisma.$transaction(async (txClient) => {
    const transaction = await txClient.transaction.create({
      data: {
        userId: request.user.id,
        walletId: data.walletId,
        targetWalletId: data.targetWalletId,
        categoryId: data.categoryId,
        type: data.type,
        amount: data.amount,
        fee: data.fee,
        currency: data.currency,
        date: data.date ? new Date(data.date) : new Date(),
        notes: data.notes,
        payee: data.payee,
        tags: JSON.stringify(data.tags),
        idempotencyKey: data.idempotencyKey,
        syncStatus: 'SYNCED',
      },
      include: { wallet: true, targetWallet: true, category: true },
    });
    return transaction;
  });

  return { ...tx, tags: JSON.parse(tx.tags || '[]') };
});

// Investments Routes & Catalogs (Database-backed server-side search)
server.get('/api/investments', { preValidation: [server.authenticate] }, async (request: any) => {
  return prisma.investmentHolding.findMany({
    where: { userId: request.user.id },
    include: { instrument: true, transactions: true },
  });
});

server.get('/api/investments/catalog/stocks', { preValidation: [server.authenticate] }, async (request: any) => {
  const query = request.query.q || '';
  return prisma.investmentInstrument.findMany({
    where: {
      assetType: 'STOCK',
      OR: [
        { symbol: { contains: query } },
        { name: { contains: query } },
      ],
    },
    take: 50,
  });
});

server.get('/api/investments/catalog/mutual-funds', { preValidation: [server.authenticate] }, async (request: any) => {
  const query = request.query.q || '';
  return prisma.investmentInstrument.findMany({
    where: {
      assetType: 'MUTUAL_FUND',
      OR: [
        { symbol: { contains: query } },
        { name: { contains: query } },
      ],
    },
    take: 100,
  });
});

server.post('/api/investments/buy', { preValidation: [server.authenticate] }, async (request: any, reply) => {
  const schema = z.object({
    assetType: z.enum(['STOCK', 'MUTUAL_FUND', 'GOLD', 'COMMODITY']),
    symbol: z.string(),
    name: z.string(),
    units: z.number().positive(),
    pricePerUnit: z.number().positive(),
    totalAmount: z.number().positive(),
    fee: z.number().default(0),
    walletId: z.string(),
    platform: z.string().optional(),
    notes: z.string().optional(),
  });

  const result = schema.safeParse(request.body);
  if (!result.success) return reply.code(400).send({ error: result.error.format() });

  const data = result.data;

  const tx = await prisma.$transaction(async (txClient) => {
    let instrument = await txClient.investmentInstrument.findUnique({ where: { symbol: data.symbol } });
    if (!instrument) {
      instrument = await txClient.investmentInstrument.create({
        data: {
          symbol: data.symbol,
          name: data.name,
          assetType: data.assetType as any,
          currentPrice: data.pricePerUnit,
          source: data.platform || 'MANUAL',
        },
      });
    }

    let holding = await txClient.investmentHolding.findFirst({
      where: { userId: request.user.id, instrumentId: instrument.id },
    });

    if (!holding) {
      holding = await txClient.investmentHolding.create({
        data: {
          userId: request.user.id,
          instrumentId: instrument.id,
          units: data.units,
          averageBuyPrice: data.pricePerUnit,
        },
      });
    } else {
      const currentUnits = Number(holding.units);
      const currentAvgPrice = Number(holding.averageBuyPrice);
      const newUnits = data.units;
      const newPrice = data.pricePerUnit;

      const totalUnits = currentUnits + newUnits;
      const totalCost = (currentUnits * currentAvgPrice) + (newUnits * newPrice) + data.fee;
      const weightedAvgPrice = totalCost / totalUnits;

      holding = await txClient.investmentHolding.update({
        where: { id: holding.id },
        data: {
          units: totalUnits,
          averageBuyPrice: weightedAvgPrice,
        },
      });
    }

    const invTx = await txClient.investmentTransaction.create({
      data: {
        userId: request.user.id,
        holdingId: holding.id,
        type: 'BUY',
        units: data.units,
        pricePerUnit: data.pricePerUnit,
        totalAmount: data.totalAmount,
        fee: data.fee,
        notes: data.notes ? `${data.platform ? '[' + data.platform + '] ' : ''}${data.notes}` : data.platform,
      },
    });

    // Deduct cash from wallet
    await txClient.transaction.create({
      data: {
        userId: request.user.id,
        walletId: data.walletId,
        type: 'EXPENSE',
        amount: data.totalAmount,
        fee: data.fee,
        notes: `Pembelian Investasi ${data.name} (${data.units} unit)`,
        date: new Date(),
        syncStatus: 'SYNCED',
      },
    });

    return { holding, invTx };
  });

  return tx;
});

// Goals
server.get('/api/goals', { preValidation: [server.authenticate] }, async (request: any) => {
  return prisma.savingsGoal.findMany({ where: { userId: request.user.id } });
});

server.post('/api/goals', { preValidation: [server.authenticate] }, async (request: any, reply) => {
  const schema = z.object({
    name: z.string(),
    targetAmount: z.number().positive(),
    currentAmount: z.number().default(0),
    targetDate: z.string().datetime().optional(),
    icon: z.string().optional(),
    color: z.string().optional(),
  });
  const result = schema.safeParse(request.body);
  if (!result.success) return reply.code(400).send({ error: result.error.format() });

  return prisma.savingsGoal.create({
    data: {
      userId: request.user.id,
      ...result.data,
      targetDate: result.data.targetDate ? new Date(result.data.targetDate) : undefined,
    },
  });
});

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 4000;

server.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
  console.log(`MoFin Backend server running at ${address}`);
});
