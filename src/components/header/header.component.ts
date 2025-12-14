
import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { View } from '../../models';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  view = input.required<View>();
  totalBalance = input.required<number>();

  today = new Date();

  viewTitle = computed(() => {
    const titles: { [key in View]: string } = {
      dashboard: 'ໜ້າຫຼັກ',
      income: 'ບັນທຶກລາຍຮັບ',
      expense: 'ບັນທຶກລາຍຈ່າຍ',
      transactions: 'ທຸລະກຳທັງໝົດ',
      approvals: 'ລໍຖ້າອະນຸມັດ',
      rejected: 'ລາຍການປະຕິເສດ',
      settings: 'ຕັ້ງຄ່າ',
    };
    return titles[this.view()];
  });
  
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('lo-LA').format(amount) + ' ₭';
  }

  formatDate(date: Date): string {
      return date.toLocaleDateString('lo-LA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }
}
