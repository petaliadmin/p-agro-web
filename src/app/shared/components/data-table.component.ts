import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, TrackByFunction } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingSkeletonComponent } from './shared-components';

export interface DataTableColumn {
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, LoadingSkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card overflow-hidden">
      <!-- Header -->
      <div *ngIf="title" class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="text-sm font-semibold text-gray-900">{{ title }}</h3>
        <span *ngIf="subtitle" class="text-xs text-gray-500">{{ subtitle }}</span>
      </div>

      <!-- Loading -->
      <app-loading-skeleton *ngIf="loading" [rows]="skeletonRows"></app-loading-skeleton>

      <!-- Table -->
      <div *ngIf="!loading && sortedData.length" class="relative overflow-x-auto scrollbar-thin"
           (scroll)="onTableScroll($event)">
        <div *ngIf="showScrollHint" class="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none z-10 md:hidden"></div>
      <table class="w-full min-w-[600px]">
        <thead>
          <tr class="bg-gray-50">
            <th *ngFor="let col of columns" class="table-header"
              [style.width]="col.width || 'auto'"
              [style.text-align]="col.align || 'left'"
              [class.cursor-pointer]="col.sortable !== false"
              [class.select-none]="col.sortable !== false"
              [attr.aria-sort]="sortKey === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : null"
              (click)="col.sortable !== false ? toggleSort(col.key) : null">
              <span class="inline-flex items-center gap-1">
                {{ col.label }}
                <span *ngIf="col.sortable !== false" class="material-icons text-[14px] text-gray-400" aria-hidden="true">
                  {{ sortKey === col.key ? (sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more' }}
                </span>
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let row of sortedData; trackBy: trackByFn; let i = index"
            class="table-row"
            [class.cursor-pointer]="clickable"
            (click)="rowClick.emit(row)">
            <td *ngFor="let col of columns" class="table-cell"
              [style.text-align]="col.align || 'left'">
              {{ row[col.key] }}
            </td>
          </tr>
        </tbody>
      </table>

      </div>

      <!-- Empty state -->
      <div *ngIf="!loading && !sortedData.length" class="py-12 text-center">
        <span class="material-icons text-gray-300 text-[32px] block mb-2" aria-hidden="true">{{ emptyIcon }}</span>
        <p class="text-sm text-gray-500">{{ emptyMessage }}</p>
      </div>
    </div>
  `,
})
export class DataTableComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() columns: DataTableColumn[] = [];
  @Input() data: any[] = [];
  @Input() loading = false;
  @Input() clickable = false;
  @Input() skeletonRows = 5;
  @Input() emptyIcon = 'inbox';
  @Input() emptyMessage = 'Aucun élément à afficher.';
  @Input() trackByFn: TrackByFunction<any> = (i: number) => i;
  @Output() rowClick = new EventEmitter<any>();
  @Output() sortChange = new EventEmitter<{ key: string; dir: 'asc' | 'desc' }>();

  sortKey = '';
  sortDir: 'asc' | 'desc' = 'asc';
  showScrollHint = true;

  get sortedData(): any[] {
    if (!this.sortKey) return this.data;
    return [...this.data].sort((a, b) => {
      const valA = a[this.sortKey];
      const valB = b[this.sortKey];
      let cmp = 0;
      if (valA == null && valB == null) cmp = 0;
      else if (valA == null) cmp = -1;
      else if (valB == null) cmp = 1;
      else if (typeof valA === 'number' && typeof valB === 'number') cmp = valA - valB;
      else cmp = String(valA).localeCompare(String(valB), 'fr', { numeric: true });
      return this.sortDir === 'asc' ? cmp : -cmp;
    });
  }

  onTableScroll(event: Event): void {
    const el = event.target as HTMLElement;
    this.showScrollHint = el.scrollLeft < (el.scrollWidth - el.clientWidth - 10);
  }

  toggleSort(key: string): void {
    if (this.sortKey === key) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDir = 'asc';
    }
    this.sortChange.emit({ key: this.sortKey, dir: this.sortDir });
  }
}
