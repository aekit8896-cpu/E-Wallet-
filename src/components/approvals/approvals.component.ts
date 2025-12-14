
import { Component, ChangeDetectionStrategy, inject, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { Transaction, ExpenseItem } from '../../models';

@Component({
  selector: 'app-approvals',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './approvals.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApprovalsComponent {
  dataService = inject(DataService);
  authService = inject(AuthService);
  fb = inject(FormBuilder);
  
  selectedTransaction: WritableSignal<Transaction | null> = signal(null);
  showApprovalModal = signal(false);
  showRejectionModal = signal(false);

  rejectionForm = this.fb.group({
    reason: ['', Validators.required]
  });

  get transactionItems(): ExpenseItem[] {
    const transaction = this.selectedTransaction();
    if (transaction && transaction.items) {
      try {
        return JSON.parse(transaction.items);
      } catch (e) {
        return [];
      }
    }
    return [];
  }
  
  openApprovalModal(transaction: Transaction) {
    this.selectedTransaction.set(transaction);
    this.showApprovalModal.set(true);
  }

  openRejectionModal(transaction: Transaction) {
    this.selectedTransaction.set(transaction);
    this.rejectionForm.reset();
    this.showRejectionModal.set(true);
  }

  closeModals() {
    this.showApprovalModal.set(false);
    this.showRejectionModal.set(false);
    this.selectedTransaction.set(null);
  }

  confirmApproval() {
    const transaction = this.selectedTransaction();
    if (!transaction) return;

    const updatedTransaction = {
      ...transaction,
      status: 'approved' as const,
      approvedBy: this.authService.currentUser()!.name,
    };
    this.dataService.updateTransaction(updatedTransaction);
    this.closeModals();
  }

  confirmRejection() {
    if (this.rejectionForm.invalid) return;
    
    const transaction = this.selectedTransaction();
    if (!transaction) return;

    const updatedTransaction = {
      ...transaction,
      status: 'rejected' as const,
      rejectedBy: this.authService.currentUser()!.name,
      rejectionReason: this.rejectionForm.value.reason!,
    };
    this.dataService.updateTransaction(updatedTransaction);
    this.closeModals();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('lo-LA').format(amount) + ' ₭';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('lo-LA');
  }
}
