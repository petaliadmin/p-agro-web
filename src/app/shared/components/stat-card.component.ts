import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card p-5 flex items-start gap-4">
      <div
        class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        [class.bg-green-100]="color === 'green'"
        [class.bg-red-100]="color === 'red'"
        [class.bg-yellow-100]="color === 'yellow'"
        [class.bg-blue-100]="color === 'blue'"
        [class.bg-purple-100]="color === 'purple'"
      >
        <span
          class="material-icons text-[22px]" aria-hidden="true"
          [class.text-green-600]="color === 'green'"
          [class.text-red-600]="color === 'red'"
          [class.text-yellow-600]="color === 'yellow'"
          [class.text-blue-600]="color === 'blue'"
          [class.text-purple-600]="color === 'purple'"
        >{{ icon }}</span>
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm text-gray-500 font-medium">{{ label }}</p>
        <p class="text-2xl font-bold text-gray-900 mt-0.5">{{ value }}</p>
        <div *ngIf="trend" class="flex items-center gap-1 mt-1">
          <span
            class="material-icons text-[14px]" aria-hidden="true"
            [class.text-green-600]="trend.direction === 'up'"
            [class.text-red-600]="trend.direction === 'down'"
          >{{ trend.direction === 'up' ? 'trending_up' : 'trending_down' }}</span>
          <span
            class="text-xs font-medium"
            [class.text-green-600]="trend.direction === 'up'"
            [class.text-red-600]="trend.direction === 'down'"
          >{{ trend.value > 0 ? '+' : '' }}{{ trend.value }}% vs hier</span>
        </div>
        <p *ngIf="subtitle" class="text-xs text-gray-500 mt-1">{{ subtitle }}</p>
      </div>
    </div>
  `,
})
export class StatCardComponent {
  @Input() label = '';
  @Input() value: string | number = 0;
  @Input() icon = 'info';
  @Input() color: 'green' | 'red' | 'yellow' | 'blue' | 'purple' = 'green';
  @Input() trend?: { value: number; direction: 'up' | 'down' };
  @Input() subtitle?: string;
}
