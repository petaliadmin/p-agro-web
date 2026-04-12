import {
  Component, OnInit, AfterViewInit, HostListener, ChangeDetectionStrategy,
  ChangeDetectorRef, ViewChild, ViewContainerRef, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';
import { LoadingBarComponent } from '../../shared/components/loading-bar.component';
import { DialogService } from '../../core/services/dialog.service';
import { NotificationService } from '../../core/services/notification.service';
import { routeAnimation } from '../../core/animations/route.animations';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, TopbarComponent, LoadingBarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [routeAnimation],
  template: `
    <!-- Mobile overlay -->
    <div
      *ngIf="isMobile && !sidebarCollapsed"
      (click)="closeMobileSidebar()"
      (keydown.escape)="closeMobileSidebar()"
      class="fixed inset-0 bg-black/40 z-30 md:hidden"
      aria-hidden="true"
    ></div>

    <!-- Sidebar -->
    <app-sidebar
      [collapsed]="sidebarCollapsed"
      (collapsedChange)="onSidebarChange($event)"
    ></app-sidebar>

    <!-- Topbar -->
    <app-topbar
      [sidebarWidth]="effectiveSidebarWidth"
      [isMobile]="isMobile"
      (menuToggle)="toggleMobileSidebar()"
    ></app-topbar>

    <!-- Dialog host -->
    <ng-container #dialogHost></ng-container>

    <!-- Loading bar -->
    <app-loading-bar></app-loading-bar>

    <!-- Main content -->
    <main
      class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-all duration-300"
      [style.padding-left]="effectiveSidebarWidth + 'px'"
      style="padding-top: 64px;"
    >
      <div class="p-3 sm:p-4 lg:p-6" [@routeAnimation]="getRouteAnimationData(outlet)">
        <router-outlet #outlet="outlet"></router-outlet>
      </div>
    </main>
  `,
})
export class ShellComponent implements OnInit, AfterViewInit {
  @ViewChild('dialogHost', { read: ViewContainerRef }) dialogHost!: ViewContainerRef;

  sidebarCollapsed = false;
  isMobile = false;
  private userToggledSidebar = false;

  constructor(public cdr: ChangeDetectorRef, private dialogService: DialogService, private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.checkViewport();
    this.notificationService.startSimulation();
  }

  ngAfterViewInit(): void {
    this.dialogService.registerViewContainer(this.dialogHost);
  }

  @HostListener('window:resize')
  checkViewport(): void {
    const w = window.innerWidth;
    const wasMobile = this.isMobile;
    this.isMobile = w < 768;

    // Ne pas écraser le choix de l'utilisateur sauf si on change de catégorie de viewport
    const changedCategory = wasMobile !== this.isMobile ||
      (!wasMobile && ((w >= 1280) !== (this.sidebarCollapsed === false && !this.userToggledSidebar)));

    if (!this.userToggledSidebar || (wasMobile !== this.isMobile)) {
      if (w >= 768 && w < 1280) {
        this.sidebarCollapsed = true;
      } else if (w >= 1280) {
        this.sidebarCollapsed = false;
      }
      // Reset le flag quand on change de catégorie de viewport
      if (wasMobile !== this.isMobile) {
        this.userToggledSidebar = false;
      }
    }
    this.updateBodyOverflow();
    this.cdr.markForCheck();
  }

  get effectiveSidebarWidth(): number {
    if (this.isMobile && this.sidebarCollapsed) return 0;
    return this.sidebarCollapsed ? 64 : 256;
  }

  onSidebarChange(collapsed: boolean): void {
    this.userToggledSidebar = true;
    this.sidebarCollapsed = collapsed;
    this.updateBodyOverflow();
    this.cdr.markForCheck();
  }

  toggleMobileSidebar(): void {
    this.userToggledSidebar = true;
    this.sidebarCollapsed = !this.sidebarCollapsed;
    this.updateBodyOverflow();
    this.cdr.markForCheck();
  }

  closeMobileSidebar(): void {
    this.sidebarCollapsed = true;
    this.updateBodyOverflow();
    this.cdr.markForCheck();
  }

  private updateBodyOverflow(): void {
    if (this.isMobile && !this.sidebarCollapsed) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  }

  getRouteAnimationData(outlet: RouterOutlet): string {
    return outlet?.isActivated ? (outlet.activatedRouteData?.['animation'] || outlet.activatedRoute?.routeConfig?.path || '') : '';
  }
}
