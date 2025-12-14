
import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { Transaction } from '../../models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  dataService = inject(DataService);

  recentTransactions = computed(() => this.dataService.transactions().slice(0, 5));
  
  netProfit = computed(() => this.dataService.monthIncome() - this.dataService.monthExpense());

  monthlyChartData = computed(() => {
    const months: { [key: string]: { income: number; expense: number } } = {};
    this.dataService.approvedTransactions().forEach(t => {
      const month = t.date.slice(0, 7);
      if (!months[month]) {
        months[month] = { income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        months[month].income += t.amount;
      } else {
        months[month].expense += t.amount;
      }
    });

    const sortedMonths = Object.keys(months).sort().slice(-6);
    const data = sortedMonths.map(month => ({
      month,
      monthLabel: new Date(month + '-02').toLocaleDateString('lo-LA', { month: 'short' }),
      income: months[month].income,
      expense: months[month].expense
    }));
    
    const maxValue = Math.max(...data.map(d => Math.max(d.income, d.expense)), 1);

    return data.map(d => ({
        ...d,
        incomeHeight: (d.income / maxValue * 100),
        expenseHeight: (d.expense / maxValue * 100)
    }));
  });

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('lo-LA').format(amount) + ' ₭';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('lo-LA');
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
