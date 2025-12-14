
import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { Transaction } from '../../models';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transactions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionsComponent {
  dataService = inject(DataService);

  incomeTransactions = computed(() => this.dataService.transactions().filter(t => t.type === 'income'));
  expenseTransactions = computed(() => this.dataService.transactions().filter(t => t.type === 'expense'));

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('lo-LA').format(amount) + ' ₭';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('lo-LA', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'approved': return 'bg-cyan-100 text-cyan-800';
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'rejected': return 'bg-rose-100 text-rose-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'approved': return 'ອະນຸມັດແລ້ວ';
      case 'pending': return 'ລໍຖ້າ';
      case 'rejected': return 'ປະຕິເສດ';
      default: return '';
    }
  }
}
