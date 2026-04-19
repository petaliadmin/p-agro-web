import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig).catch(err => console.error(err));

// Web Vitals — mesure LCP, FID (INP), CLS
import('web-vitals').then(({ onCLS, onINP, onLCP }) => {
  const log = (metric: { name: string; value: number; rating: string }) => {
    console.log(`[Web Vitals] ${metric.name}: ${metric.value.toFixed(2)} (${metric.rating})`);
  };
  onCLS(log);
  onINP(log);
  onLCP(log);
}).catch(() => { /* non-critical */ });
