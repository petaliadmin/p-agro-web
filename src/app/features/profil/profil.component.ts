import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/components/shared-components';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="Mon profil" subtitle="Gérez vos informations personnelles"></app-page-header>

    <div class="max-w-2xl space-y-6">
      <!-- Avatar & Info -->
      <div class="card p-6">
        <div class="flex items-center gap-5 mb-6">
          <div class="relative group">
            <div *ngIf="!user?.avatar" class="w-20 h-20 rounded-2xl bg-primary-600 flex items-center justify-center text-white text-2xl font-bold">
              {{ initials }}
            </div>
            <img *ngIf="user?.avatar" [src]="user!.avatar" alt="Avatar" class="w-20 h-20 rounded-2xl object-cover"/>
            <button (click)="avatarInput.click()"
              class="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <span class="material-icons text-white text-[20px]" aria-hidden="true">photo_camera</span>
            </button>
            <input #avatarInput type="file" accept="image/*" (change)="onAvatarChange($event)" class="hidden"/>
          </div>
          <div>
            <h2 class="text-lg font-bold text-gray-900">{{ user?.prenom }} {{ user?.nom }}</h2>
            <p class="text-sm text-gray-500 capitalize">{{ user?.role }}</p>
            <p class="text-xs text-gray-500 mt-1">{{ user?.email }}</p>
          </div>
        </div>
      </div>

      <!-- Formulaire informations -->
      <div class="card p-6">
        <h3 class="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span class="material-icons text-[18px] text-gray-500" aria-hidden="true">person</span>
          Informations personnelles
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
            <input type="text" [(ngModel)]="form.prenom"
              class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"/>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nom</label>
            <input type="text" [(ngModel)]="form.nom"
              class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"/>
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Adresse email</label>
            <input type="email" [(ngModel)]="form.email"
              class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"/>
          </div>
        </div>
        <div class="flex justify-end mt-5">
          <button (click)="saveInfos()" class="btn-primary text-sm flex items-center gap-2">
            <span class="material-icons text-[16px]" aria-hidden="true">save</span> Enregistrer
          </button>
        </div>
      </div>

      <!-- Mot de passe -->
      <div class="card p-6">
        <h3 class="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span class="material-icons text-[18px] text-gray-500" aria-hidden="true">lock</span>
          Changer le mot de passe
        </h3>
        <div class="space-y-4 max-w-md">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
            <input type="password" [(ngModel)]="passwordForm.current"
              class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
              [class.border-red-300]="passwordSubmitted && !passwordForm.current"/>
            <p *ngIf="passwordSubmitted && !passwordForm.current" class="text-xs text-red-500 mt-1">Le mot de passe actuel est requis</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
            <input type="password" [(ngModel)]="passwordForm.newPassword"
              class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
              [class.border-red-300]="passwordSubmitted && passwordForm.newPassword.length > 0 && passwordForm.newPassword.length < 6"/>
            <p *ngIf="passwordSubmitted && passwordForm.newPassword.length > 0 && passwordForm.newPassword.length < 6" class="text-xs text-red-500 mt-1">Minimum 6 caractères</p>
            <!-- Indicateur de force -->
            <div *ngIf="passwordForm.newPassword.length > 0" class="mt-2">
              <div class="flex items-center gap-2">
                <div class="flex-1 bg-gray-100 rounded-full h-1.5">
                  <div class="h-1.5 rounded-full transition-all"
                    [style.width]="passwordStrength.pct + '%'"
                    [class.bg-red-500]="passwordStrength.level === 'faible'"
                    [class.bg-yellow-500]="passwordStrength.level === 'moyen'"
                    [class.bg-green-500]="passwordStrength.level === 'fort'"></div>
                </div>
                <span class="text-xs font-medium"
                  [class.text-red-600]="passwordStrength.level === 'faible'"
                  [class.text-yellow-600]="passwordStrength.level === 'moyen'"
                  [class.text-green-600]="passwordStrength.level === 'fort'">{{ passwordStrength.label }}</span>
              </div>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Confirmer le nouveau mot de passe</label>
            <input type="password" [(ngModel)]="passwordForm.confirm"
              class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
              [class.border-red-300]="passwordForm.confirm && passwordForm.newPassword !== passwordForm.confirm"/>
            <p *ngIf="passwordForm.confirm && passwordForm.newPassword !== passwordForm.confirm" class="text-xs text-red-500 mt-1">
              Les mots de passe ne correspondent pas
            </p>
          </div>
        </div>
        <div class="flex justify-end mt-5">
          <button (click)="changePassword()" class="btn-primary text-sm flex items-center gap-2"
            [disabled]="!passwordForm.current || !passwordForm.newPassword || passwordForm.newPassword !== passwordForm.confirm">
            <span class="material-icons text-[16px]" aria-hidden="true">vpn_key</span> Modifier le mot de passe
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ProfilComponent {
  user: User | null = null;
  form = { prenom: '', nom: '', email: '' };
  passwordForm = { current: '', newPassword: '', confirm: '' };
  passwordSubmitted = false;

  get initials(): string {
    return (this.user?.prenom?.[0] || '') + (this.user?.nom?.[0] || '');
  }

  get passwordStrength(): { level: string; label: string; pct: number } {
    const p = this.passwordForm.newPassword;
    if (!p) return { level: 'faible', label: 'Faible', pct: 0 };
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 2) return { level: 'faible', label: 'Faible', pct: 33 };
    if (score <= 3) return { level: 'moyen', label: 'Moyen', pct: 66 };
    return { level: 'fort', label: 'Fort', pct: 100 };
  }

  constructor(
    private auth: AuthService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {
    this.user = this.auth.getCurrentUser();
    if (this.user) {
      this.form = { prenom: this.user.prenom, nom: this.user.nom, email: this.user.email };
    }
  }

  saveInfos(): void {
    if (!this.form.prenom.trim() || !this.form.nom.trim() || !this.form.email.trim()) {
      this.toast.error('Veuillez remplir tous les champs');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.form.email)) {
      this.toast.error('Adresse email invalide');
      return;
    }
    this.auth.updateProfile({
      prenom: this.form.prenom.trim(),
      nom: this.form.nom.trim(),
      email: this.form.email.trim(),
    });
    this.user = this.auth.getCurrentUser();
    this.toast.success('Profil mis à jour avec succès');
    this.cdr.markForCheck();
  }

  onAvatarChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (file.size > 500_000) {
      this.toast.error('Image trop lourde (max 500 Ko)');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      this.auth.updateProfile({ avatar: base64 });
      this.user = this.auth.getCurrentUser();
      this.toast.success('Avatar mis à jour');
      this.cdr.markForCheck();
    };
    reader.readAsDataURL(file);
  }

  changePassword(): void {
    this.passwordSubmitted = true;
    if (!this.auth.verifyPassword(this.passwordForm.current)) {
      this.toast.error('Mot de passe actuel incorrect');
      return;
    }
    if (this.passwordForm.newPassword.length < 6) {
      this.toast.error('Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }
    if (this.passwordStrength.level === 'faible') {
      this.toast.error('Le mot de passe est trop faible. Ajoutez des majuscules, chiffres ou caractères spéciaux.');
      return;
    }
    if (this.passwordForm.newPassword !== this.passwordForm.confirm) {
      this.toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    this.auth.changePassword(this.passwordForm.newPassword);
    this.toast.success('Mot de passe modifié avec succès');
    this.passwordForm = { current: '', newPassword: '', confirm: '' };
    this.passwordSubmitted = false;
    this.cdr.markForCheck();
  }
}
