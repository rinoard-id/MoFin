import Dexie, { Table } from 'dexie';

export interface LocalTransaction {
  id: string;
  walletId: string;
  targetWalletId?: string;
  categoryId?: string;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER' | 'REFUND' | 'ADJUSTMENT';
  amount: number;
  fee?: number;
  currency: string;
  date: string;
  notes?: string;
  payee?: string;
  tags: string[];
  syncStatus: 'PENDING' | 'SYNCED' | 'FAILED';
  clientTimestamp: string;
}

export interface SyncQueueItem {
  id?: number;
  operationId: string;
  entityType: string;
  entityId: string;
  action: string;
  payload: any;
  clientTimestamp: string;
}

class FnansialOfflineDB extends Dexie {
  transactions!: Table<LocalTransaction, string>;
  syncQueue!: Table<SyncQueueItem, number>;

  constructor() {
    super('FnansialOfflineDB');
    this.version(1).stores({
      transactions: 'id, walletId, type, date, syncStatus',
      syncQueue: '++id, operationId, entityType, status',
    });
  }
}

export const db = new FnansialOfflineDB();
