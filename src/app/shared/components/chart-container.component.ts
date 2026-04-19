import {
  Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef,
  ElementRef, ViewChild, AfterViewInit, OnDestroy, effect, untracked, Injector, afterNextRender
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../core/services/theme.service';
import { Chart, ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-chart-container',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card p-5">
      <h3 *ngIf="title" class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">{{ title }}</h3>

      <!-- Loading skeleton -->
      <div *ngIf="loading" class="space-y-2">
        <div class="skeleton h-4 w-1/3"></div>
        <div class="skeleton h-32 w-full rounded-lg"></div>
      </div>

      <!-- Error state -->
      <div *ngIf="!loading && hasError" class="flex items-center justify-center h-32 text-sm text-gray-500">
        <span class="material-icons text-gray-400 mr-2" aria-hidden="true">error_outline</span>
        {{ errorMessage }}
        <button *ngIf="retryable" (click)="retry.emit()" class="ml-3 text-primary-600 hover:text-primary-800 text-xs font-medium">
          Réessayer
        </button>
      </div>

      <!-- Chart canvas -->
      <div *ngIf="!loading && !hasError" [style.height]="height">
        <canvas #chartCanvas [attr.role]="'img'" [attr.aria-label]="ariaLabel"></canvas>
      </div>
    </div>
  `,
})
export class ChartContainerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  @Input() title?: string;
  @Input() loading = false;
  @Input() hasError = false;
  @Input() errorMessage = 'Impossible de charger le graphique';
  @Input() retryable = false;
  @Input() ariaLabel = 'Graphique';
  @Input() height = 'auto';

  @Input() set config(val: ChartConfiguration | null) {
    this._config = val;
    if (this._initialized && val) {
      this.rebuildChart();
    }
  }

  @Output() retry = new EventEmitter<void>();
  @Output() chartInstance = new EventEmitter<Chart>();

  private _config: ChartConfiguration | null = null;
  private _chart?: Chart;
  private _initialized = false;

  constructor(
    private themeService: ThemeService,
    private cdr: ChangeDetectorRef,
    private injector: Injector,
  ) {
    // Re-render chart when theme changes
    effect(() => {
      this.themeService.isDark();
      untracked(() => {
        if (this._initialized && this._config) {
          this.rebuildChart();
        }
      });
    });
  }

  ngAfterViewInit(): void {
    this._initialized = true;
    if (this._config) {
      afterNextRender(() => this.rebuildChart(), { injector: this.injector });
    }
  }

  ngOnDestroy(): void {
    this._chart?.destroy();
  }

  private rebuildChart(): void {
    this._chart?.destroy();
    this._chart = undefined;

    const ctx = this.canvasRef?.nativeElement?.getContext('2d');
    if (!ctx || !this._config) return;

    try {
      this._chart = new Chart(ctx, this._config);
      this.chartInstance.emit(this._chart);
    } catch {
      this.hasError = true;
      this.cdr.markForCheck();
    }
  }

  /** Get current chart colors from CSS custom properties */
  static getChartColors(): { grid: string; text: string; primary: string; secondary: string } {
    const style = getComputedStyle(document.documentElement);
    return {
      grid: style.getPropertyValue('--chart-grid').trim() || '#f3f4f6',
      text: style.getPropertyValue('--chart-text').trim() || '#374151',
      primary: style.getPropertyValue('--chart-primary').trim() || '#1A7A4A',
      secondary: style.getPropertyValue('--chart-secondary').trim() || '#d1d5db',
    };
  }
}
