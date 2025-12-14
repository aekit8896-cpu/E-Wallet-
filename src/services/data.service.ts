
import { Injectable, signal, computed, WritableSignal } from '@angular/core';
import { Transaction, BankAccount } from '../models';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private initialBankAccounts: BankAccount[] = [
      { id: '1', name: 'BCEL - ບັນຊີຫຼັກ', number: '0001234567' },
      { id: '2', name: 'LDB - ບັນຊີສຳຮອງ', number: '0009876543' }
  ];

  transactions: WritableSignal<Transaction[]> = signal<Transaction[]>([]);
  bankAccounts: WritableSignal<BankAccount[]> = signal<BankAccount[]>(this.initialBankAccounts);

  // Computed signals for dashboard stats
  approvedTransactions = computed(() => this.transactions().filter(t => t.status === 'approved'));
  pendingTransactions = computed(() => this.transactions().filter(t => t.status === 'pending'));
  rejectedTransactions = computed(() => this.transactions().filter(t => t.status === 'rejected'));
  
  totalBalance = computed(() => {
    return this.approvedTransactions().reduce((acc, t) => {
      return t.type === 'income' ? acc + t.amount : acc - t.amount;
    }, 0);
  });
  
  todayIncome = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    return this.approvedTransactions()
      .filter(t => t.type === 'income' && t.date === today)
      .reduce((sum, t) => sum + t.amount, 0);
  });
  
  monthIncome = computed(() => {
    const thisMonth = new Date().toISOString().slice(0, 7);
    return this.approvedTransactions()
      .filter(t => t.type === 'income' && t.date.startsWith(thisMonth))
      .reduce((sum, t) => sum + t.amount, 0);
  });
  
  monthExpense = computed(() => {
    const thisMonth = new Date().toISOString().slice(0, 7);
    return this.approvedTransactions()
      .filter(t => t.type === 'expense' && t.date.startsWith(thisMonth))
      .reduce((sum, t) => sum + t.amount, 0);
  });

  constructor() {
    this.transactions.set(this.getMockTransactions());
  }

  addTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>, createdBy: string) {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      createdBy,
    };
    this.transactions.update(transactions => [...transactions, newTransaction]);
  }

  updateTransaction(updatedTransaction: Transaction) {
    this.transactions.update(transactions => 
      transactions.map(t => t.id === updatedTransaction.id ? updatedTransaction : t)
    );
  }

  addBankAccount(account: Omit<BankAccount, 'id'>) {
    const newAccount: BankAccount = {
      ...account,
      id: Date.now().toString()
    };
    this.bankAccounts.update(accounts => [...accounts, newAccount]);
  }

  deleteBankAccount(id: string) {
    this.bankAccounts.update(accounts => accounts.filter(acc => acc.id !== id));
  }
  
  // Helper for mock data
  private getMockTransactions(): Transaction[] {
    const today = new Date();
    const mockData: Transaction[] = [];

    for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        
        // Mock Income
        mockData.push({
            id: `inc-${i}`,
            type: 'income',
            date: dateString,
            amount: Math.floor(Math.random() * 2000000) + 500000,
            status: 'approved',
            createdBy: 'ເຈົ້າໜ້າທີ່ການເງິນ',
            createdAt: date.toISOString(),
            source: `ລູກຄ້າ ${i+1}`,
            bankAccount: 'BCEL - ບັນຊີຫຼັກ'
        });

        // Mock Expense
        if (i % 2 === 0) {
            mockData.push({
                id: `exp-${i}`,
                type: 'expense',
                date: dateString,
                amount: Math.floor(Math.random() * 500000) + 100000,
                status: 'approved',
                createdBy: 'ພະນັກງານທົ່ວໄປ',
                createdAt: date.toISOString(),
                category: 'ຄ່າໃຊ້ຈ່າຍ',
                items: JSON.stringify([{id: 1, name: 'ຄ່າອຸປະກອນຫ້ອງການ', quantity: 1, price: Math.floor(Math.random() * 500000) + 100000}])
            });
        }
    }

    mockData.push({
      id: 'pending-1',
      type: 'expense',
      date: today.toISOString().split('T')[0],
      amount: 1250000,
      status: 'pending',
      createdBy: 'ພະນັກງານທົ່ວໄປ',
      createdAt: new Date().toISOString(),
      category: 'ການຕະຫຼາດ',
      items: JSON.stringify([
          {id: 1, name: 'ຄ່າໂຄສະນາ Facebook', quantity: 1, price: 1250000}
      ])
    });

    mockData.push({
      id: 'rejected-1',
      type: 'expense',
      date: new Date(today.setDate(today.getDate() - 1)).toISOString().split('T')[0],
      amount: 75000,
      status: 'rejected',
      createdBy: 'ພະນັກງານທົ່ວໄປ',
      createdAt: new Date().toISOString(),
      category: 'ອື່ນໆ',
      items: JSON.stringify([{id: 1, name: 'ຄ່າກາເຟ', quantity: 3, price: 25000}]),
      rejectionReason: 'ບໍ່ແມ່ນລາຍຈ່າຍຂອງບໍລິສັດ',
      rejectedBy: 'ຜູ້ດູແລລະບົບ'
    });
    
    return mockData.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}
