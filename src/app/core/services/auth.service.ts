import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, tap } from 'rxjs';
import { Router } from '@angular/router';
import { User, AuthCredentials } from '../models/user.model';
import { MOCK_USERS } from '../../../assets/mock-data/intrants.mock';
import { environment, API_ENDPOINTS } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private currentUser = signal<User | null>(null);
  private apiUrl = environment.apiUrl;

  constructor(private router: Router) {
    const stored = localStorage.getItem('agroassist_user');
    if (stored) {
      this.currentUser.set(JSON.parse(stored));
    }
  }

  login(credentials: AuthCredentials): Observable<{ success: boolean; user?: User; error?: string }> {
    if (!environment.mock) {
      return this.http.post<{ success: boolean; user?: User; error?: string }>(
        this.apiUrl + API_ENDPOINTS.auth.login,
        credentials
      ).pipe(
        tap(res => {
          if (res.success && res.user) {
            this.currentUser.set(res.user);
            localStorage.setItem('agroassist_user', JSON.stringify(res.user));
            localStorage.setItem('agroassist_role', res.user.role);
          }
        })
      );
    }
    const user = MOCK_USERS.find(u => u.email === credentials.email);
    if (user && credentials.password === 'password') {
      const authUser = { ...user, token: 'mock-jwt-' + Date.now() };
      this.currentUser.set(authUser);
      localStorage.setItem('agroassist_user', JSON.stringify(authUser));
      localStorage.setItem('agroassist_role', authUser.role);
      return of({ success: true, user: authUser }).pipe(delay(800));
    }
    return of({ success: false, error: 'Email ou mot de passe incorrect' }).pipe(delay(600));
  }

  logout(): void {
    if (!environment.mock) {
      this.http.post(this.apiUrl + API_ENDPOINTS.auth.logout, {}).subscribe();
    }
    this.currentUser.set(null);
    localStorage.removeItem('agroassist_user');
    localStorage.removeItem('agroassist_role');
    this.router.navigate(['/login']);
  }

  getCurrentUser(): User | null {
    return this.currentUser();
  }

  isAuthenticated(): boolean {
    return !!this.currentUser();
  }

  getRole(): string {
    return this.currentUser()?.role ?? '';
  }

  updateProfile(changes: Partial<User>): void {
    const user = this.currentUser();
    if (!user) return;
    const updated = { ...user, ...changes };
    this.currentUser.set(updated);
    localStorage.setItem('agroassist_user', JSON.stringify(updated));
  }

  verifyPassword(password: string): boolean {
    const stored = localStorage.getItem('agroassist_password');
    return password === (stored || 'password');
  }

  changePassword(newPassword: string): void {
    localStorage.setItem('agroassist_password', newPassword);
  }
}
