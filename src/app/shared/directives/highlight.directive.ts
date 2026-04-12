import { Directive, ElementRef, Input, OnChanges, Renderer2 } from '@angular/core';

/**
 * Directive [appHighlight] — colore le fond d'un élément
 * selon un statut ou une valeur seuil.
 *
 * Usage :
 *   <tr [appHighlight]="parcelle.statut"></tr>
 *   <td [appHighlight]="stock" [threshold]="seuilAlerte"></td>
 */
@Directive({
  selector: '[appHighlight]',
  standalone: true,
})
export class HighlightDirective implements OnChanges {
  @Input('appHighlight') value: string | number = '';
  @Input() threshold?: number;

  private readonly statusColors: Record<string, string> = {
    urgent:    'rgba(239,68,68,0.06)',
    attention: 'rgba(245,158,11,0.06)',
    sain:      'transparent',
    recolte:   'rgba(168,85,247,0.06)',
  };

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnChanges(): void {
    this.applyHighlight();
  }

  private applyHighlight(): void {
    let bg = 'transparent';

    if (typeof this.value === 'string' && this.statusColors[this.value]) {
      bg = this.statusColors[this.value];
    } else if (typeof this.value === 'number' && this.threshold !== undefined) {
      if (this.value <= this.threshold) {
        bg = 'rgba(239,68,68,0.06)'; // stock bas → fond rouge léger
      }
    }

    this.renderer.setStyle(this.el.nativeElement, 'background-color', bg);
  }
}
