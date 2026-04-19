import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative" [class]="widthClass">
      <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-[16px]" aria-hidden="true">search</span>
      <input
        type="text"
        [value]="value"
        (input)="onInput($event)"
        [placeholder]="placeholder"
        [attr.aria-label]="placeholder"
        class="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all duration-150"
      />
      <button
        *ngIf="value"
        (click)="clear()"
        class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 w-5 h-5 flex items-center justify-center"
        aria-label="Effacer la recherche">
        <span class="material-icons text-[14px]" aria-hidden="true">close</span>
      </button>
    </div>
  `,
})
export class SearchInputComponent implements OnInit, OnDestroy {
  @Input() value = '';
  @Input() placeholder = 'Rechercher…';
  @Input() debounce = 300;
  @Input() widthClass = 'flex-1 min-w-48';
  @Output() valueChange = new EventEmitter<string>();
  @Output() search = new EventEmitter<string>();

  private input$ = new Subject<string>();
  private sub?: Subscription;

  ngOnInit(): void {
    this.sub = this.input$.pipe(
      debounceTime(this.debounce),
      distinctUntilChanged(),
    ).subscribe(val => {
      this.search.emit(val);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  onInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.value = val;
    this.valueChange.emit(val);
    this.input$.next(val);
  }

  clear(): void {
    this.value = '';
    this.valueChange.emit('');
    this.input$.next('');
    this.search.emit('');
  }
}
