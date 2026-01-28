
export enum PigStatus {
  RAISING = 'RAISING',
  SOLD = 'SOLD',
  DECEASED = 'DECEASED'
}

export interface Pig {
  id: string;
  tagId: string;
  dateOfBirth: string;
  initialWeight: number; // in kg
  purchaseCost?: number; // Optional purchase cost in PHP
  status: PigStatus;
  notes?: string;
}

export interface FeedRecord {
  id: string;
  pigId?: string; // Optional if feeding a group
  datePurchased: string;
  cost: number; // PHP
  amountKg: number;
  feedType: string;
}

export interface SaleRecord {
  id: string;
  pigId: string;
  saleDate: string;
  saleWeight: number;
  salePricePerKg: number;
  totalRevenue: number;
}

export interface MiscRecord {
  id: string;
  date: string;
  item: string;
  cost: number;
  category: string;
}

export interface AppData {
  pigs: Pig[];
  feedRecords: FeedRecord[];
  saleRecords: SaleRecord[];
  miscRecords: MiscRecord[];
}
