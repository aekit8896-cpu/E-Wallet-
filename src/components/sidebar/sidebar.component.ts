
import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User, View, Role } from '../../models';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  currentUser = input.required<User>();
  currentView = input.required<View>();
  pendingCount = input.required<number>();

  viewChange = output<View>();
  logout = output<void>();

  menuItems: { id: View; icon: string; label: string; roles: Role[] }[] = [
    { id: 'dashboard', icon: 'home', label: 'ໜ້າຫຼັກ', roles: ['Admin', 'Finance', 'GeneralStaff'] },
    { id: 'income', icon: 'arrow_upward', label: 'ບັນທຶກລາຍຮັບ', roles: ['Admin', 'Finance', 'GeneralStaff'] },
    { id: 'expense', icon: 'arrow_downward', label: 'ບັນທຶກລາຍຈ່າຍ', roles: ['Admin', 'Finance', 'GeneralStaff'] },
    { id: 'transactions', icon: 'receipt_long', label: 'ທຸລະກຳທັງໝົດ', roles: ['Admin', 'Finance'] },
    { id: 'approvals', icon: 'pending_actions', label: 'ລໍຖ້າອະນຸມັດ', roles: ['Admin', 'Finance', 'GeneralStaff'] },
    { id: 'rejected', icon: 'thumb_down', label: 'ລາຍການປະຕິເສດ', roles: ['Admin', 'Finance', 'GeneralStaff'] },
    { id: 'settings', icon: 'settings', label: 'ຕັ້ງຄ່າ', roles: ['Admin'] },
  ];
  
  filteredMenuItems() {
    const userRole = this.currentUser().role;
    return this.menuItems.filter(item => item.roles.includes(userRole));
  }
}
