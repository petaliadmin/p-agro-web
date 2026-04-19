import { Directive, ElementRef, EventEmitter, OnInit, OnDestroy, Output, NgZone } from '@angular/core';

@Directive({
  selector: '[appPullToRefresh]',
  standalone: true,
})
export class PullToRefreshDirective implements OnInit, OnDestroy {
  @Output() appPullToRefresh = new EventEmitter<void>();

  private startY = 0;
  private currentY = 0;
  private pulling = false;
  private threshold = 80;
  private indicator: HTMLElement | null = null;
  private boundTouchStart = this.onTouchStart.bind(this);
  private boundTouchMove = this.onTouchMove.bind(this);
  private boundTouchEnd = this.onTouchEnd.bind(this);

  constructor(private el: ElementRef<HTMLElement>, private zone: NgZone) {}

  ngOnInit(): void {
    this.createIndicator();
    this.zone.runOutsideAngular(() => {
      this.el.nativeElement.addEventListener('touchstart', this.boundTouchStart, { passive: true });
      this.el.nativeElement.addEventListener('touchmove', this.boundTouchMove, { passive: false });
      this.el.nativeElement.addEventListener('touchend', this.boundTouchEnd, { passive: true });
    });
  }

  ngOnDestroy(): void {
    this.el.nativeElement.removeEventListener('touchstart', this.boundTouchStart);
    this.el.nativeElement.removeEventListener('touchmove', this.boundTouchMove);
    this.el.nativeElement.removeEventListener('touchend', this.boundTouchEnd);
    this.indicator?.remove();
  }

  private createIndicator(): void {
    this.indicator = document.createElement('div');
    this.indicator.className = 'pull-refresh-indicator';
    this.indicator.innerHTML = `
      <span class="material-icons text-primary-600 dark:text-primary-400" style="font-size:24px;">arrow_downward</span>
    `;
    Object.assign(this.indicator.style, {
      position: 'fixed',
      top: '-50px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '44px',
      height: '44px',
      borderRadius: '50%',
      background: 'var(--pull-bg, #fff)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'top 0.2s ease, transform 0.2s ease',
      zIndex: '9998',
      pointerEvents: 'none',
    });
    document.body.appendChild(this.indicator);
  }

  private onTouchStart(e: TouchEvent): void {
    if (window.scrollY <= 0) {
      this.startY = e.touches[0].clientY;
      this.pulling = true;
    }
  }

  private onTouchMove(e: TouchEvent): void {
    if (!this.pulling || !this.indicator) return;
    this.currentY = e.touches[0].clientY;
    const distance = Math.max(0, this.currentY - this.startY);

    if (distance > 10 && window.scrollY <= 0) {
      e.preventDefault();
      const progress = Math.min(distance / this.threshold, 1);
      const top = Math.min(distance * 0.5, 60);
      this.indicator.style.top = `${top}px`;
      this.indicator.style.opacity = `${progress}`;
      const rotation = progress >= 1 ? 180 : 0;
      this.indicator.querySelector('span')!.style.transform = `rotate(${rotation}deg)`;
    }
  }

  private onTouchEnd(): void {
    if (!this.pulling || !this.indicator) return;
    const distance = this.currentY - this.startY;

    if (distance >= this.threshold) {
      this.indicator.innerHTML = `
        <span class="material-icons text-primary-600 dark:text-primary-400 animate-spin" style="font-size:24px;">refresh</span>
      `;
      this.zone.run(() => this.appPullToRefresh.emit());
      setTimeout(() => this.resetIndicator(), 1000);
    } else {
      this.resetIndicator();
    }

    this.pulling = false;
    this.startY = 0;
    this.currentY = 0;
  }

  private resetIndicator(): void {
    if (!this.indicator) return;
    this.indicator.style.top = '-50px';
    this.indicator.style.opacity = '0';
    this.indicator.innerHTML = `
      <span class="material-icons text-primary-600 dark:text-primary-400" style="font-size:24px;">arrow_downward</span>
    `;
  }
}
