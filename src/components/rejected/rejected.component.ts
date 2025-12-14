
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { ExpenseItem } from '../../models';

@Component({
  selector: 'app-rejected',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rejected.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RejectedComponent {
  dataService = inject(DataService);

  getTransactionItems(itemsJson?: string): ExpenseItem[] {
    if (itemsJson) {
      try {
        return JSON.parse(itemsJson);
      } catch (e) {
        return [];
      }
    }
    return [];
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('lo-LA').format(amount) + ' ₭';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('lo-LA');
  }
}
