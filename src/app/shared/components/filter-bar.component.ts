import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card p-4 lg:p-5 mb-6">
      <!-- Mobile toggle -->
      <button (click)="expanded = !expanded"
        class="flex items-center justify-between w-full text-sm font-medium text-gray-700 dark:text-gray-200 md:hidden"
        [attr.aria-expanded]="expanded">
        <span class="flex items-center gap-2">
          <span class="material-icons text-[16px]" aria-hidden="true">filter_list</span>
          Filtres
          <span *ngIf="activeCount" class="bg-primary-600 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">{{ activeCount }}</span>
        </span>
        <span class="material-icons text-[18px] transition-transform duration-200" [class.rotate-180]="expanded" aria-hidden="true">expand_more</span>
      </button>
      <!-- Filters content: hidden on mobile unless expanded, always visible on md+ -->
      <div class="flex flex-col gap-3 md:flex md:flex-row md:flex-wrap md:items-center"
        [class.hidden]="!expanded" [class.mt-3]="expanded"
        [class.md:flex]="true">
        <ng-content></ng-content>
      </div>
    </div>
  `,
})
export class FilterBarComponent {
  @Input() activeCount = 0;
  expanded = false;
}
