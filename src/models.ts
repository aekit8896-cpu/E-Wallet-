
export type Role = 'Admin' | 'Finance' | 'GeneralStaff';
export type View = 'dashboard' | 'income' | 'expense' | 'transactions' | 'approvals' | 'rejected' | 'settings';
export type TransactionStatus = 'pending' | 'approved' | 'rejected';
export type TransactionType = 'income' | 'expense';

export interface User {
  username: string;
  password?: string;
  role: Role;
  name: string;
}

export interface BankAccount {
  id: string;
  name: string;
  number: string;
}

export interface ExpenseItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  date: string; // YYYY-MM-DD
  amount: number;
  status: TransactionStatus;
  createdBy: string;
  createdAt: string; // ISO string

  // Income specific
  source?: string;
  bankAccount?: string;
  reference?: string;
  note?: string;

  // Expense specific
  category?: string;
  items?: string; // JSON string of ExpenseItem[]
  qrImage?: string; // base64
  billImage?: string; // base64
  approvedBy?: string;
  rejectedBy?: string;
  rejectionReason?: string;
}
