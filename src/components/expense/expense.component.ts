
import { Component, ChangeDetectionStrategy, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { ExpenseItem } from '../../models';

@Component({
  selector: 'app-expense',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './expense.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseComponent {
  dataService = inject(DataService);
  authService = inject(AuthService);
  fb = inject(FormBuilder);

  isSubmitting = signal(false);
  showSuccess = signal(false);
  qrImagePreview = signal<string | null>(null);
  billImagePreview = signal<string | null>(null);

  expenseForm = this.fb.group({
    date: [new Date().toISOString().split('T')[0], Validators.required],
    category: ['', Validators.required],
    items: this.fb.array([this.createItem()]),
    qrImage: [''],
    billImage: [''],
  });

  constructor() {
    effect(() => {
      this.totalAmount(); // Recalculate on items change
    });
  }

  get items() {
    return this.expenseForm.get('items') as FormArray;
  }

  createItem() {
    return this.fb.group({
      name: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      price: [null, [Validators.required, Validators.min(0)]],
    });
  }

  addItem() {
    this.items.push(this.createItem());
  }

  removeItem(index: number) {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    }
  }
  
  totalAmount = computed(() => {
    return this.items.controls.reduce((sum, control) => {
        const item = control.value;
        return sum + (item.quantity * item.price);
    }, 0);
  });

  handleFileInput(event: Event, type: 'qr' | 'bill') {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        if (type === 'qr') {
          this.expenseForm.patchValue({ qrImage: base64String });
          this.qrImagePreview.set(base64String);
        } else {
          this.expenseForm.patchValue({ billImage: base64String });
          this.billImagePreview.set(base64String);
        }
      };
      reader.readAsDataURL(file);
    }
  }

  clearImage(type: 'qr' | 'bill') {
    if (type === 'qr') {
      this.expenseForm.patchValue({ qrImage: '' });
      this.qrImagePreview.set(null);
    } else {
      this.expenseForm.patchValue({ billImage: '' });
      this.billImagePreview.set(null);
    }
  }

  onSubmit() {
    if (this.expenseForm.invalid) {
      this.expenseForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const formValue = this.expenseForm.value;
    
    const newTransaction = {
      type: 'expense' as const,
      date: formValue.date!,
      amount: this.totalAmount(),
      category: formValue.category!,
      items: JSON.stringify(formValue.items),
      qrImage: formValue.qrImage || undefined,
      billImage: formValue.billImage || undefined,
      status: 'pending' as const,
    };

    this.dataService.addTransaction(newTransaction, this.authService.currentUser()!.name);
    
    this.expenseForm.reset({ date: new Date().toISOString().split('T')[0] });
    this.items.clear();
    this.addItem();
    this.clearImage('qr');
    this.clearImage('bill');

    this.isSubmitting.set(false);
    this.showSuccess.set(true);
    setTimeout(() => this.showSuccess.set(false), 3000);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('lo-LA').format(amount) + ' ₭';
  }
}
