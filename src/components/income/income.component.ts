
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-income',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './income.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncomeComponent {
  dataService = inject(DataService);
  authService = inject(AuthService);
  fb = inject(FormBuilder);

  isSubmitting = signal(false);
  showSuccess = signal(false);

  incomeForm = this.fb.group({
    date: [new Date().toISOString().split('T')[0], Validators.required],
    amount: [null, [Validators.required, Validators.min(1)]],
    source: ['', Validators.required],
    bankAccount: ['', Validators.required],
    reference: [''],
    note: [''],
  });

  onSubmit() {
    if (this.incomeForm.invalid) {
      return;
    }

    this.isSubmitting.set(true);
    const formValue = this.incomeForm.value;
    
    const newTransaction = {
      type: 'income' as const,
      date: formValue.date!,
      amount: formValue.amount!,
      source: formValue.source!,
      bankAccount: formValue.bankAccount!,
      reference: formValue.reference || undefined,
      note: formValue.note || undefined,
      status: 'approved' as const,
    };

    this.dataService.addTransaction(newTransaction, this.authService.currentUser()!.name);
    
    this.incomeForm.reset({
      date: new Date().toISOString().split('T')[0],
      amount: null,
      source: '',
      bankAccount: '',
      reference: '',
      note: ''
    });

    this.isSubmitting.set(false);
    this.showSuccess.set(true);
    setTimeout(() => this.showSuccess.set(false), 3000);
  }
}
