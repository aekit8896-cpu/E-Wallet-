
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { DataService } from './services/data.service';
import { View } from './models';

// Import Components
import { LoginComponent } from './components/login/login.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { IncomeComponent } from './components/income/income.component';
import { ExpenseComponent } from './components/expense/expense.component';
import { TransactionsComponent } from './components/transactions/transactions.component';
import { ApprovalsComponent } from './components/approvals/approvals.component';
import { RejectedComponent } from './components/rejected/rejected.component';
import { SettingsComponent } from './components/settings/settings.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    LoginComponent,
    SidebarComponent,
    HeaderComponent,
    DashboardComponent,
    IncomeComponent,
    ExpenseComponent,
    TransactionsComponent,
    ApprovalsComponent,
    RejectedComponent,
    SettingsComponent,
  ],
})
export class AppComponent {
  authService = inject(AuthService);
  dataService = inject(DataService);
  
  currentView = signal<View>('dashboard');

  onViewChange(view: View): void {
    this.currentView.set(view);
  }

  onLogout(): void {
    this.authService.logout();
    this.currentView.set('dashboard');
  }
}
