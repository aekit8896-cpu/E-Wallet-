
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { Role, User } from '../../models';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
  dataService = inject(DataService);
  authService = inject(AuthService);
  fb = inject(FormBuilder);

  bankForm = this.fb.group({
    name: ['', Validators.required],
    number: ['', Validators.required],
  });

  userForm = this.fb.group({
    name: ['', Validators.required],
    username: ['', Validators.required],
    password: ['', Validators.required],
    role: ['GeneralStaff' as Role, Validators.required],
  });
  
  addBankAccount() {
    if (this.bankForm.valid) {
      this.dataService.addBankAccount(this.bankForm.value as any);
      this.bankForm.reset();
    }
  }
  
  deleteBankAccount(id: string) {
    if (confirm('ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບບັນຊີນີ້?')) {
      this.dataService.deleteBankAccount(id);
    }
  }

  addUser() {
    if (this.userForm.valid) {
      this.authService.addUser(this.userForm.value as User);
      this.userForm.reset({ role: 'GeneralStaff' });
    }
  }
  
  deleteUser(username: string) {
    if (confirm('ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບຜູ້ໃຊ້ນີ້?')) {
      this.authService.deleteUser(username);
    }
  }
}
