
import { Injectable, signal } from '@angular/core';
import { User, Role } from '../models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private initialUsers: User[] = [
    { username: 'admin', password: 'admin123', role: 'Admin', name: 'ຜູ້ດູແລລະບົບ' },
    { username: 'finance', password: 'finance123', role: 'Finance', name: 'ເຈົ້າໜ້າທີ່ການເງິນ' },
    { username: 'staff', password: 'staff123', role: 'GeneralStaff', name: 'ພະນັກງານທົ່ວໄປ' },
  ];

  users = signal<User[]>(this.initialUsers);
  currentUser = signal<User | null>(null);

  login(username: string, password: string): boolean {
    const user = this.users().find(u => u.username === username && u.password === password);
    if (user) {
      this.currentUser.set(user);
      return true;
    }
    return false;
  }

  logout() {
    this.currentUser.set(null);
  }

  addUser(user: User) {
    if (this.users().find(u => u.username === user.username)) {
        // Simple validation to prevent duplicate usernames
        console.error("User already exists");
        return false;
    }
    this.users.update(users => [...users, user]);
    return true;
  }

  deleteUser(username: string) {
    this.users.update(users => users.filter(user => user.username !== username));
  }

  hasPermission(action: 'approve' | 'view_all_transactions' | 'view_settings'): boolean {
    const user = this.currentUser();
    if (!user) return false;
    if (user.role === 'Admin') return true;

    switch (action) {
      case 'approve':
      case 'view_all_transactions':
        return user.role === 'Finance';
      case 'view_settings':
        return false; // Only admin
      default:
        return false;
    }
  }
}
