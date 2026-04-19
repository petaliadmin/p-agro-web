import { Injectable } from '@angular/core';
import { Parcelle, CultureType } from '../models/parcelle.model';
import { Visite } from '../models/visite.model';
import { Intervention, INTERVENTION_LABELS, STATUT_LABELS } from '../models/intervention.model';
import { Campagne } from '../models/campagne.model';
import { NdviData } from '../models/ndvi.model';
import { Irrigation, EvenementClimatique, BilanHydrique } from '../models/irrigation.model';

export interface ParcelleReportData {
  parcelle: Parcelle;
  visites: Visite[];
  activeCampagne?: Campagne;
  campagnesTerminees: Campagne[];
  interventions: Intervention[];
  ndviLatest?: NdviData;
  ndviHistory: NdviData[];
  irrigations: Irrigation[];
  evenementsClimatiques: EvenementClimatique[];
  bilanHydrique?: BilanHydrique;
  mouvementsParcelle: { intrantNom: string; quantite: number; unite: string; date: Date; type: string; motif?: string; coutUnitaire?: number }[];
  mapElement?: HTMLElement;
  ndviMapElement?: HTMLElement;
  rendementChartCanvas?: HTMLCanvasElement;
  ndviChartCanvas?: HTMLCanvasElement;
}

interface SectionPageEntry {
  title: string;
  page: number;
}

/**
 * Service générant un rapport PDF complet et professionnel par parcelle.
 * Layout A4 portrait, palette verte agriculture, sections magazine.
 */
@Injectable({ providedIn: 'root' })
export class PdfReportService {
  // Palette
  private readonly GREEN_DARK: [number, number, number] = [26, 122, 74];      // #1A7A4A
  private readonly GREEN_LIGHT: [number, number, number] = [34, 197, 94];    // #22c55e
  private readonly GREY_DARK: [number, number, number] = [30, 41, 59];       // #1e293b
  private readonly GREY_MID: [number, number, number] = [100, 116, 139];     // #64748b
  private readonly GREY_LIGHT: [number, number, number] = [203, 213, 225];   // #cbd5e1
  private readonly BG_SOFT: [number, number, number] = [248, 250, 252];      // #f8fafc

  // Layout
  private readonly PAGE_WIDTH = 210;
  private readonly PAGE_HEIGHT = 297;
  private readonly MARGIN_X = 14;
  private readonly CONTENT_W = 210 - 14 * 2; // 182
  private readonly HEADER_H = 24;
  private readonly FOOTER_H = 12;
  private readonly TOP_Y = 24 + 8;
  private readonly BOTTOM_Y = 297 - 12 - 4;

  async generateParcelleReport(data: ParcelleReportData): Promise<void> {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

    const sections: SectionPageEntry[] = [];

    // ── Page de garde ──
    this.drawCoverPage(doc, data);

    // ── Sommaire (page 2, dessiné à la fin) ──
    doc.addPage();
    const tocPage = doc.getNumberOfPages();

    // ── Sections ──
    let y = this.startNewContentPage(doc, data.parcelle);
    sections.push({ title: '1. Fiche d\'identité', page: doc.getNumberOfPages() });
    y = this.drawIdentitySection(doc, data.parcelle, y);

    y = this.ensureSpace(doc, y, 70, data.parcelle);
    sections.push({ title: '2. Carte de localisation', page: doc.getNumberOfPages() });
    y = await this.drawLocationMap(doc, data, y);

    y = this.ensureSpace(doc, y, 70, data.parcelle);
    sections.push({ title: '3. Santé végétale (NDVI)', page: doc.getNumberOfPages() });
    y = await this.drawNdviSection(doc, data, y);

    y = this.ensureSpace(doc, y, 60, data.parcelle);
    sections.push({ title: '4. Évolution NDVI', page: doc.getNumberOfPages() });
    y = await this.drawNdviEvolution(doc, data, y);

    y = this.ensureSpace(doc, y, 50, data.parcelle);
    sections.push({ title: '5. Campagne en cours', page: doc.getNumberOfPages() });
    y = this.drawCampagneSection(doc, data, y);

    y = this.ensureSpace(doc, y, 50, data.parcelle);
    sections.push({ title: '6. Interventions', page: doc.getNumberOfPages() });
    y = this.drawInterventionsSection(doc, data, y);

    y = this.ensureSpace(doc, y, 60, data.parcelle);
    sections.push({ title: '7. Bilan hydrique & irrigation', page: doc.getNumberOfPages() });
    y = this.drawHydriqueSection(doc, data, y);

    y = this.ensureSpace(doc, y, 50, data.parcelle);
    sections.push({ title: '8. Visites terrain', page: doc.getNumberOfPages() });
    y = this.drawVisitesSection(doc, data, y);

    y = this.ensureSpace(doc, y, 40, data.parcelle);
    sections.push({ title: '9. Intrants utilisés', page: doc.getNumberOfPages() });
    y = this.drawIntrantsSection(doc, data, y);

    y = this.ensureSpace(doc, y, 60, data.parcelle);
    sections.push({ title: '10. Rendement & performance', page: doc.getNumberOfPages() });
    y = await this.drawRendementSection(doc, data, y);

    y = this.ensureSpace(doc, y, 70, data.parcelle);
    sections.push({ title: '11. Répartition des coûts', page: doc.getNumberOfPages() });
    y = this.drawCostDistribution(doc, data, y);

    y = this.ensureSpace(doc, y, 70, data.parcelle);
    sections.push({ title: '12. Comparatif rendements', page: doc.getNumberOfPages() });
    this.drawRendementBarChart(doc, data, y);

    // ── Sommaire rempli ──
    doc.setPage(tocPage);
    this.drawSummaryPage(doc, data.parcelle, sections);

    // ── Footers sur toutes les pages ──
    const total = doc.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
      doc.setPage(i);
      this.drawFooter(doc, i, total);
      if (i > 1) {
        // Header léger sur pages internes (hors page de garde)
        this.drawMiniHeader(doc, data.parcelle);
      }
    }

    // ── Téléchargement ──
    const safeName = (data.parcelle.code || data.parcelle.nom || 'parcelle').replace(/[^a-zA-Z0-9_-]/g, '_');
    const dateStr = new Date().toISOString().slice(0, 10);
    doc.save(`Rapport_${safeName}_${dateStr}.pdf`);
  }

  // ───────────────────────── Helpers de mise en page ─────────────────────────

  private setColor(doc: any, rgb: [number, number, number], ctx: 'text' | 'fill' | 'draw' = 'text'): void {
    if (ctx === 'text') doc.setTextColor(rgb[0], rgb[1], rgb[2]);
    else if (ctx === 'fill') doc.setFillColor(rgb[0], rgb[1], rgb[2]);
    else doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
  }

  private ensureSpace(doc: any, y: number, needed: number, parcelle: Parcelle): number {
    if (y + needed > this.BOTTOM_Y) {
      return this.startNewContentPage(doc, parcelle);
    }
    return y;
  }

  private startNewContentPage(doc: any, _parcelle: Parcelle): number {
    doc.addPage();
    return this.TOP_Y;
  }

  private drawMiniHeader(doc: any, parcelle: Parcelle): void {
    // Bandeau vert haut (6mm)
    this.setColor(doc, this.GREEN_DARK, 'fill');
    doc.rect(0, 0, this.PAGE_WIDTH, 6, 'F');

    // Logo + titre
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    this.setColor(doc, this.GREEN_DARK);
    doc.text('Petalia Farm OS', this.MARGIN_X, 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    this.setColor(doc, this.GREY_MID);
    const headerRight = `${parcelle.nom}${parcelle.code ? '  ·  ' + parcelle.code : ''}`;
    const textW = doc.getTextWidth(headerRight);
    doc.text(headerRight, this.PAGE_WIDTH - this.MARGIN_X - textW, 14);

    this.setColor(doc, this.GREY_LIGHT, 'draw');
    doc.setLineWidth(0.3);
    doc.line(this.MARGIN_X, 18, this.PAGE_WIDTH - this.MARGIN_X, 18);
  }

  private drawFooter(doc: any, page: number, total: number): void {
    const y = this.PAGE_HEIGHT - 10;
    this.setColor(doc, this.GREEN_DARK, 'draw');
    doc.setLineWidth(0.5);
    doc.line(this.MARGIN_X, y - 4, this.PAGE_WIDTH - this.MARGIN_X, y - 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    this.setColor(doc, this.GREY_MID);
    doc.text('Généré par Petalia Farm OS', this.MARGIN_X, y);

    const dateStr = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const mid = `${dateStr}`;
    const midW = doc.getTextWidth(mid);
    doc.text(mid, (this.PAGE_WIDTH - midW) / 2, y);

    const pageStr = `Page ${page} / ${total}`;
    const pw = doc.getTextWidth(pageStr);
    doc.text(pageStr, this.PAGE_WIDTH - this.MARGIN_X - pw, y);
  }

  private drawSectionTitle(doc: any, title: string, y: number): number {
    this.setColor(doc, this.GREEN_DARK, 'fill');
    doc.rect(this.MARGIN_X, y - 4, 3, 7, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    this.setColor(doc, this.GREY_DARK);
    doc.text(title, this.MARGIN_X + 6, y + 1);

    this.setColor(doc, this.GREY_LIGHT, 'draw');
    doc.setLineWidth(0.2);
    doc.line(this.MARGIN_X + 6, y + 3.5, this.PAGE_WIDTH - this.MARGIN_X, y + 3.5);

    return y + 10;
  }

  private drawKeyValueRow(doc: any, label: string, value: string, x: number, y: number, width: number): void {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    this.setColor(doc, this.GREY_MID);
    doc.text(label, x, y);
    doc.setFont('helvetica', 'bold');
    this.setColor(doc, this.GREY_DARK);
    const txt = value && value.trim() ? value : '—';
    const lines = doc.splitTextToSize(txt, width - 40);
    doc.text(lines, x + 40, y);
  }

  private drawEmptyPlaceholder(doc: any, y: number, message = 'Aucune donnée disponible'): number {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    this.setColor(doc, this.GREY_MID);
    doc.text(message, this.MARGIN_X + 6, y);
    return y + 8;
  }

  /** Fallback quand la capture Leaflet échoue (souvent canvas tainté par tiles cross-origin). */
  private drawMapFallback(doc: any, parcelle: Parcelle, y: number, w: number, h: number): number {
    // Fond
    this.setColor(doc, this.BG_SOFT, 'fill');
    doc.rect(this.MARGIN_X, y, w, h, 'F');

    // Polygone si disponible, sinon cercle au centre
    const geom = parcelle.geometry;
    this.setColor(doc, this.GREEN_LIGHT, 'draw');
    doc.setLineWidth(0.6);
    this.setColor(doc, [220, 252, 231], 'fill'); // vert très clair

    if (geom && geom.length >= 3) {
      const lats = geom.map(c => c.lat);
      const lngs = geom.map(c => c.lng);
      const minLat = Math.min(...lats), maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
      const dLat = (maxLat - minLat) || 1e-6;
      const dLng = (maxLng - minLng) || 1e-6;

      const padMm = 10;
      const innerW = w - padMm * 2;
      const innerH = h - padMm * 2;
      const scale = Math.min(innerW / dLng, innerH / dLat);
      const offsetX = this.MARGIN_X + padMm + (innerW - dLng * scale) / 2;
      const offsetY = y + padMm + (innerH - dLat * scale) / 2;

      const pts = geom.map(c => ({
        x: offsetX + (c.lng - minLng) * scale,
        y: offsetY + (maxLat - c.lat) * scale,
      }));

      // jsPDF lines() prend un tableau de deltas
      const origin: [number, number] = [pts[0].x, pts[0].y];
      const deltas: [number, number][] = [];
      for (let i = 1; i < pts.length; i++) {
        deltas.push([pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y]);
      }
      deltas.push([pts[0].x - pts[pts.length - 1].x, pts[0].y - pts[pts.length - 1].y]);
      doc.lines(deltas, origin[0], origin[1], [1, 1], 'FD', true);
    } else {
      // Cercle simple au centre
      this.setColor(doc, this.GREEN_LIGHT, 'draw');
      this.setColor(doc, [220, 252, 231], 'fill');
      doc.circle(this.MARGIN_X + w / 2, y + h / 2, 12, 'FD');
    }

    // Coords en bas
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    this.setColor(doc, this.GREY_MID);
    const coordStr = `GPS : ${parcelle.coordonnees.lat.toFixed(4)}, ${parcelle.coordonnees.lng.toFixed(4)}`;
    doc.text(coordStr, this.MARGIN_X + 4, y + h - 3);

    // Cadre
    this.setColor(doc, this.GREY_LIGHT, 'draw');
    doc.setLineWidth(0.3);
    doc.rect(this.MARGIN_X, y, w, h);

    return y + h + 4;
  }

  private drawTable(
    doc: any,
    headers: string[],
    rows: string[][],
    colWidths: number[],
    startY: number,
    parcelle: Parcelle
  ): number {
    const x0 = this.MARGIN_X;
    const rowH = 7;
    const headerH = 8;

    // Header
    this.setColor(doc, this.GREEN_DARK, 'fill');
    doc.rect(x0, startY, this.CONTENT_W, headerH, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    let cx = x0;
    headers.forEach((h, i) => {
      doc.text(h, cx + 2, startY + 5.5);
      cx += colWidths[i];
    });

    let y = startY + headerH;

    // Rows
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    rows.forEach((row, idx) => {
      if (y + rowH > this.BOTTOM_Y) {
        y = this.startNewContentPage(doc, parcelle);
        // Redraw header
        this.setColor(doc, this.GREEN_DARK, 'fill');
        doc.rect(x0, y, this.CONTENT_W, headerH, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(255, 255, 255);
        cx = x0;
        headers.forEach((h, i) => {
          doc.text(h, cx + 2, y + 5.5);
          cx += colWidths[i];
        });
        y += headerH;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
      }

      if (idx % 2 === 1) {
        this.setColor(doc, this.BG_SOFT, 'fill');
        doc.rect(x0, y, this.CONTENT_W, rowH, 'F');
      }

      this.setColor(doc, this.GREY_DARK);
      cx = x0;
      row.forEach((cell, i) => {
        const maxW = colWidths[i] - 4;
        const txt = cell ?? '';
        const clipped = doc.splitTextToSize(txt, maxW)[0] || '';
        doc.text(clipped, cx + 2, y + 5);
        cx += colWidths[i];
      });
      y += rowH;
    });

    // Border bottom
    this.setColor(doc, this.GREY_LIGHT, 'draw');
    doc.setLineWidth(0.2);
    doc.line(x0, y, x0 + this.CONTENT_W, y);

    return y + 4;
  }

  // ───────────────────────── Sections ─────────────────────────

  private drawCoverPage(doc: any, data: ParcelleReportData): void {
    const { parcelle } = data;

    // Bandeau vert haut (grand)
    this.setColor(doc, this.GREEN_DARK, 'fill');
    doc.rect(0, 0, this.PAGE_WIDTH, 80, 'F');

    this.setColor(doc, this.GREEN_LIGHT, 'fill');
    doc.rect(0, 76, this.PAGE_WIDTH, 4, 'F');

    // Logo
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(255, 255, 255);
    doc.text('Petalia Farm OS', this.MARGIN_X, 28);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text('Plateforme de supervision agronomique', this.MARGIN_X, 36);

    // Titre rapport
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('Rapport de parcelle', this.MARGIN_X, 60);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    const dateStr = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
    doc.text(`Édité le ${dateStr}`, this.MARGIN_X, 70);

    // Bloc infos parcelle (carte grise)
    const boxY = 100;
    this.setColor(doc, this.BG_SOFT, 'fill');
    doc.roundedRect(this.MARGIN_X, boxY, this.CONTENT_W, 90, 3, 3, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    this.setColor(doc, this.GREEN_DARK);
    doc.text(parcelle.nom || 'Parcelle', this.MARGIN_X + 8, boxY + 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    this.setColor(doc, this.GREY_MID);
    doc.text(`Code : ${parcelle.code || '—'}`, this.MARGIN_X + 8, boxY + 22);

    // Grille 2 colonnes
    const colL = this.MARGIN_X + 8;
    const colR = this.MARGIN_X + this.CONTENT_W / 2 + 4;
    let yy = boxY + 35;

    const rows: [string, string, string, string][] = [
      ['Culture', this.labelCulture(parcelle.culture), 'Superficie', `${parcelle.superficie} ha`],
      ['Stade', parcelle.stade || '—', 'Statut', parcelle.statut || '—'],
      ['Zone', parcelle.zone || '—', 'Localité', parcelle.localite || '—'],
      ['Producteur', parcelle.producteurNom || '—', 'Variété', parcelle.variete || '—'],
      ['Type de sol', parcelle.typeSol || parcelle.typesSol || '—', 'Source d\'eau', parcelle.sourceEau || '—'],
    ];

    rows.forEach(([l1, v1, l2, v2]) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      this.setColor(doc, this.GREY_MID);
      doc.text(l1, colL, yy);
      doc.text(l2, colR, yy);

      doc.setFont('helvetica', 'bold');
      this.setColor(doc, this.GREY_DARK);
      doc.text(String(v1), colL + 28, yy);
      doc.text(String(v2), colR + 28, yy);
      yy += 8;
    });

    // Footer cover
    this.setColor(doc, this.GREEN_DARK, 'fill');
    doc.rect(0, this.PAGE_HEIGHT - 20, this.PAGE_WIDTH, 20, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text('Rapport généré automatiquement · Données à usage agronomique interne',
      this.MARGIN_X, this.PAGE_HEIGHT - 8);
  }

  private drawSummaryPage(doc: any, parcelle: Parcelle, sections: SectionPageEntry[]): void {
    let y = this.TOP_Y;
    y = this.drawSectionTitle(doc, 'Sommaire', y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);

    sections.forEach(s => {
      if (y + 9 > this.BOTTOM_Y) return;
      this.setColor(doc, this.GREY_DARK);
      doc.text(s.title, this.MARGIN_X + 6, y);

      // Dots
      const titleW = doc.getTextWidth(s.title);
      const pageStr = String(s.page);
      const pageW = doc.getTextWidth(pageStr);
      const dotsStart = this.MARGIN_X + 6 + titleW + 3;
      const dotsEnd = this.PAGE_WIDTH - this.MARGIN_X - pageW - 3;
      this.setColor(doc, this.GREY_LIGHT);
      if (dotsEnd > dotsStart) {
        const dots = '. '.repeat(Math.max(1, Math.floor((dotsEnd - dotsStart) / 1.6)));
        doc.text(dots, dotsStart, y);
      }

      this.setColor(doc, this.GREEN_DARK);
      doc.setFont('helvetica', 'bold');
      doc.text(pageStr, this.PAGE_WIDTH - this.MARGIN_X - pageW, y);
      doc.setFont('helvetica', 'normal');

      y += 9;
    });
  }

  private drawIdentitySection(doc: any, parcelle: Parcelle, y: number): number {
    y = this.drawSectionTitle(doc, '1. Fiche d\'identité de la parcelle', y);

    const colW = (this.CONTENT_W - 6) / 2;
    const xL = this.MARGIN_X + 6;
    const xR = xL + colW;

    let yL = y;
    let yR = y;
    const line = 7;

    const leftRows: [string, string][] = [
      ['Nom', parcelle.nom],
      ['Code', parcelle.code],
      ['Culture', this.labelCulture(parcelle.culture)],
      ['Variété', parcelle.variete || '—'],
      ['Stade', parcelle.stade],
      ['Statut', parcelle.statut],
      ['Type de campagne', parcelle.typeCampagne || '—'],
      ['Date de semis', this.formatDate(parcelle.dateSemis)],
      ['Densité', parcelle.densite || '—'],
    ];

    const rightRows: [string, string][] = [
      ['Superficie', `${parcelle.superficie} ha`],
      ['Zone', parcelle.zone],
      ['Localité', parcelle.localite || '—'],
      ['Zone agroécologique', parcelle.zoneAgroecologique || '—'],
      ['Type de sol', parcelle.typeSol || parcelle.typesSol || '—'],
      ['Mode d\'accès', parcelle.modeAccesTerre || '—'],
      ['Source d\'eau', parcelle.sourceEau || '—'],
      ['Producteur', parcelle.producteurNom || '—'],
      ['Coord. GPS', `${parcelle.coordonnees.lat.toFixed(4)}, ${parcelle.coordonnees.lng.toFixed(4)}`],
    ];

    leftRows.forEach(r => { this.drawKeyValueRow(doc, r[0], r[1], xL, yL, colW); yL += line; });
    rightRows.forEach(r => { this.drawKeyValueRow(doc, r[0], r[1], xR, yR, colW); yR += line; });

    return Math.max(yL, yR) + 4;
  }

  private async drawLocationMap(doc: any, data: ParcelleReportData, y: number): Promise<number> {
    y = this.drawSectionTitle(doc, '2. Carte de localisation', y);

    if (data.mapElement) {
      const img = await this.captureElementAsImage(data.mapElement);
      const w = this.CONTENT_W;
      const h = 85;
      const added = img ? this.safeAddImage(doc, img, this.MARGIN_X, y, w, h) : false;
      if (added) {
        // Cadre
        this.setColor(doc, this.GREY_LIGHT, 'draw');
        doc.setLineWidth(0.3);
        doc.rect(this.MARGIN_X, y, w, h);
        y += h + 4;
      } else {
        y = this.drawMapFallback(doc, data.parcelle, y, w, h);
      }
    } else {
      y = this.drawMapFallback(doc, data.parcelle, y, this.CONTENT_W, 60);
    }

    // Légende simple
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    this.setColor(doc, this.GREY_MID);
    doc.text('Polygone : contour de la parcelle · Fond : imagerie satellite', this.MARGIN_X + 6, y);
    return y + 6;
  }

  private async drawNdviSection(doc: any, data: ParcelleReportData, y: number): Promise<number> {
    y = this.drawSectionTitle(doc, '3. Santé végétale (NDVI)', y);

    if (!data.ndviLatest) {
      return this.drawEmptyPlaceholder(doc, y, 'Aucune donnée NDVI disponible');
    }

    const n = data.ndviLatest;

    // KPIs ligne
    const kpis: [string, string][] = [
      ['NDVI moyen', n.ndviMoyen.toFixed(2)],
      ['NDVI min', n.ndviMin.toFixed(2)],
      ['NDVI max', n.ndviMax.toFixed(2)],
      ['Résolution', `${n.resolution} m`],
      ['Source', n.source],
    ];

    const cardW = (this.CONTENT_W - 4 * 3) / 5;
    const cardH = 18;
    let cx = this.MARGIN_X;
    kpis.forEach(([label, value]) => {
      this.setColor(doc, this.BG_SOFT, 'fill');
      doc.roundedRect(cx, y, cardW, cardH, 1.5, 1.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      this.setColor(doc, this.GREEN_DARK);
      doc.text(value, cx + cardW / 2, y + 8, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      this.setColor(doc, this.GREY_MID);
      doc.text(label, cx + cardW / 2, y + 14, { align: 'center' });
      cx += cardW + 3;
    });
    y += cardH + 5;

    // Carte NDVI
    if (data.ndviMapElement) {
      const img = await this.captureElementAsImage(data.ndviMapElement);
      const w = this.CONTENT_W;
      const h = 70;
      const added = img ? this.safeAddImage(doc, img, this.MARGIN_X, y, w, h) : false;
      if (added) {
        this.setColor(doc, this.GREY_LIGHT, 'draw');
        doc.setLineWidth(0.3);
        doc.rect(this.MARGIN_X, y, w, h);
        y += h + 3;
      }
    }

    // Légende gradient
    y = this.drawNdviLegend(doc, y);

    // Interprétation
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    this.setColor(doc, this.GREY_DARK);
    const interp = this.ndviInterpretation(n.ndviMoyen);
    const lines = doc.splitTextToSize(`Interprétation : ${interp}`, this.CONTENT_W - 6);
    doc.text(lines, this.MARGIN_X + 6, y);
    y += lines.length * 5 + 3;

    return y;
  }

  private drawNdviLegend(doc: any, y: number): number {
    const w = this.CONTENT_W;
    const h = 4;
    const stops: [number, number, number][] = [
      [220, 38, 38], [249, 115, 22], [234, 179, 8], [132, 204, 22], [22, 163, 74],
    ];
    // Approximation gradient : 40 bandes
    const bands = 40;
    const bw = w / bands;
    for (let i = 0; i < bands; i++) {
      const t = (i / (bands - 1));
      const idx = t * (stops.length - 1);
      const lo = Math.floor(idx);
      const hi = Math.min(lo + 1, stops.length - 1);
      const tt = idx - lo;
      const r = Math.round(stops[lo][0] + (stops[hi][0] - stops[lo][0]) * tt);
      const g = Math.round(stops[lo][1] + (stops[hi][1] - stops[lo][1]) * tt);
      const b = Math.round(stops[lo][2] + (stops[hi][2] - stops[lo][2]) * tt);
      doc.setFillColor(r, g, b);
      doc.rect(this.MARGIN_X + i * bw, y, bw + 0.2, h, 'F');
    }
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    this.setColor(doc, this.GREY_MID);
    doc.text('0.0 Stress', this.MARGIN_X, y + 8);
    doc.text('0.5', this.MARGIN_X + w / 2, y + 8, { align: 'center' });
    doc.text('1.0 Sain', this.MARGIN_X + w, y + 8, { align: 'right' });
    return y + 12;
  }

  private async drawNdviEvolution(doc: any, data: ParcelleReportData, y: number): Promise<number> {
    y = this.drawSectionTitle(doc, '4. Évolution du NDVI', y);

    if (!data.ndviHistory.length) {
      return this.drawEmptyPlaceholder(doc, y, 'Aucun historique NDVI');
    }

    let addedChart = false;
    if (data.ndviChartCanvas) {
      const img = this.canvasToImage(data.ndviChartCanvas);
      const w = this.CONTENT_W;
      const h = 55;
      addedChart = img ? this.safeAddImage(doc, img, this.MARGIN_X, y, w, h) : false;
      if (addedChart) y += h + 4;
    }
    if (!addedChart) {
      // Mini-graph sparkline fallback
      y = this.drawSparkline(doc, data.ndviHistory.map(n => n.ndviMoyen), y, this.CONTENT_W);
    }

    // Table
    const rows = data.ndviHistory.slice(-8).map(n => [
      this.formatDate(n.date),
      n.ndviMoyen.toFixed(2),
      n.ndviMin.toFixed(2),
      n.ndviMax.toFixed(2),
      n.source,
    ]);

    return this.drawTable(
      doc,
      ['Date', 'Moyen', 'Min', 'Max', 'Source'],
      rows,
      [36, 32, 32, 32, 50],
      y,
      data.parcelle,
    );
  }

  private drawCampagneSection(doc: any, data: ParcelleReportData, y: number): number {
    y = this.drawSectionTitle(doc, '5. Campagne en cours', y);

    const camp = data.activeCampagne;
    if (!camp) {
      return this.drawEmptyPlaceholder(doc, y, 'Aucune campagne active');
    }

    const colW = (this.CONTENT_W - 6) / 2;
    const xL = this.MARGIN_X + 6;
    const xR = xL + colW;

    const leftRows: [string, string][] = [
      ['Culture', this.labelCulture(camp.culture)],
      ['Variété', camp.variete || '—'],
      ['Type', camp.typeCampagne],
    ];
    const rightRows: [string, string][] = [
      ['Date début', this.formatDate(camp.dateDebut)],
      ['Date fin prévue', this.formatDate(camp.dateFin)],
      ['Progression', `${camp.progressionPct}%`],
    ];

    let yL = y;
    let yR = y;
    leftRows.forEach(r => { this.drawKeyValueRow(doc, r[0], r[1], xL, yL, colW); yL += 7; });
    rightRows.forEach(r => { this.drawKeyValueRow(doc, r[0], r[1], xR, yR, colW); yR += 7; });
    y = Math.max(yL, yR) + 2;

    // Barre progression
    const barX = this.MARGIN_X + 6;
    const barW = this.CONTENT_W - 12;
    const barH = 6;
    this.setColor(doc, this.GREY_LIGHT, 'fill');
    doc.roundedRect(barX, y, barW, barH, 1, 1, 'F');
    const pct = Math.max(0, Math.min(100, camp.progressionPct)) / 100;
    this.setColor(doc, this.GREEN_LIGHT, 'fill');
    doc.roundedRect(barX, y, barW * pct, barH, 1, 1, 'F');
    y += barH + 5;

    // Étapes
    if (camp.etapes?.length) {
      const rows = camp.etapes.map(e => [
        String(e.ordre),
        e.label,
        e.typeTache,
        `${e.dureeEstimee} j`,
        e.delaiJoursApresSemis >= 0 ? `J+${e.delaiJoursApresSemis}` : `J${e.delaiJoursApresSemis}`,
      ]);
      y = this.drawTable(
        doc,
        ['#', 'Étape', 'Type', 'Durée', 'Timing'],
        rows,
        [10, 78, 36, 22, 36],
        y,
        data.parcelle,
      );
    }

    return y;
  }

  private drawInterventionsSection(doc: any, data: ParcelleReportData, y: number): number {
    y = this.drawSectionTitle(doc, '6. Interventions', y);

    if (!data.interventions.length) {
      return this.drawEmptyPlaceholder(doc, y, 'Aucune intervention');
    }

    const sorted = [...data.interventions].sort((a, b) =>
      new Date(a.datePrevue).getTime() - new Date(b.datePrevue).getTime()
    );

    const rows = sorted.map(iv => [
      INTERVENTION_LABELS[iv.type] || iv.type,
      this.formatDate(iv.datePrevue),
      this.formatDate(iv.dateRealisee),
      STATUT_LABELS[iv.statut] || iv.statut,
      iv.produitUtilise || '—',
      this.formatFCFA(iv.coutEstime),
      this.formatFCFA(iv.coutReel),
    ]);

    y = this.drawTable(
      doc,
      ['Type', 'Prévue', 'Réalisée', 'Statut', 'Produit', 'Est. (FCFA)', 'Réel (FCFA)'],
      rows,
      [34, 22, 22, 22, 32, 25, 25],
      y,
      data.parcelle,
    );

    const totalEst = sorted.reduce((s, iv) => s + (iv.coutEstime || 0), 0);
    const totalReel = sorted.reduce((s, iv) => s + (iv.coutReel || 0), 0);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    this.setColor(doc, this.GREEN_DARK);
    doc.text(`Total estimé : ${this.formatFCFA(totalEst)} FCFA`, this.MARGIN_X + 6, y + 4);
    doc.text(`Total réel : ${this.formatFCFA(totalReel)} FCFA`,
      this.PAGE_WIDTH - this.MARGIN_X, y + 4, { align: 'right' });

    return y + 10;
  }

  private drawHydriqueSection(doc: any, data: ParcelleReportData, y: number): number {
    y = this.drawSectionTitle(doc, '7. Bilan hydrique & irrigation', y);

    const bh = data.bilanHydrique;
    if (bh) {
      const kpis: [string, string][] = [
        ['Pluviométrie 30j', `${bh.pluviometrie30j} mm`],
        ['Stress', bh.stressHydrique ? `Oui (${bh.niveauStress})` : 'Non'],
        ['Dernier arrosage', this.formatDate(bh.dernierArrosage)],
        ['Prochaine irrigation', this.formatDate(bh.prochaineIrrigation)],
      ];
      const cardW = (this.CONTENT_W - 3 * 3) / 4;
      let cx = this.MARGIN_X;
      kpis.forEach(([l, v]) => {
        this.setColor(doc, this.BG_SOFT, 'fill');
        doc.roundedRect(cx, y, cardW, 18, 1.5, 1.5, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        this.setColor(doc, this.GREEN_DARK);
        doc.text(v, cx + cardW / 2, y + 8, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        this.setColor(doc, this.GREY_MID);
        doc.text(l, cx + cardW / 2, y + 14, { align: 'center' });
        cx += cardW + 3;
      });
      y += 22;
    }

    // Table irrigations
    if (data.irrigations.length) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      this.setColor(doc, this.GREY_DARK);
      doc.text('Historique des irrigations', this.MARGIN_X + 6, y);
      y += 5;

      const rows = data.irrigations.slice(0, 10).map(i => [
        this.formatDate(i.date),
        i.type,
        i.frequence,
        `${i.quantiteEstimee} mm`,
        i.dureeMinutes ? `${i.dureeMinutes} min` : '—',
      ]);
      y = this.drawTable(
        doc,
        ['Date', 'Type', 'Fréquence', 'Quantité', 'Durée'],
        rows,
        [30, 40, 42, 30, 40],
        y,
        data.parcelle,
      );
    } else {
      y = this.drawEmptyPlaceholder(doc, y, 'Aucune irrigation enregistrée');
    }

    // Evénements climatiques
    if (data.evenementsClimatiques.length) {
      y = this.ensureSpace(doc, y, 40, data.parcelle);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      this.setColor(doc, this.GREY_DARK);
      doc.text('Événements climatiques', this.MARGIN_X + 6, y);
      y += 5;

      const rows = data.evenementsClimatiques.slice(0, 8).map(e => [
        this.formatDate(e.date),
        e.type,
        e.impact,
        e.description || '—',
      ]);
      y = this.drawTable(
        doc,
        ['Date', 'Type', 'Impact', 'Description'],
        rows,
        [28, 30, 24, 100],
        y,
        data.parcelle,
      );
    }

    return y;
  }

  private drawVisitesSection(doc: any, data: ParcelleReportData, y: number): number {
    y = this.drawSectionTitle(doc, '8. Visites terrain', y);

    if (!data.visites.length) {
      return this.drawEmptyPlaceholder(doc, y, 'Aucune visite enregistrée');
    }

    const sorted = [...data.visites].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const rows = sorted.slice(0, 15).map(v => {
      const obs = v.observations;
      const etoiles = obs?.etatGeneral ? '★'.repeat(obs.etatGeneral) + '☆'.repeat(5 - obs.etatGeneral) : '—';
      const mal = obs?.maladiesDetectees?.length ? obs.maladiesDetectees.join(', ') : '—';
      const rav = obs?.ravageursDetectes?.length ? obs.ravageursDetectes.join(', ') : '—';
      return [
        this.formatDate(v.date),
        v.statut,
        etoiles,
        `${obs?.tauxCouverture ?? '—'}%`,
        `${obs?.hauteurPlantes ?? '—'} cm`,
        mal.length > 20 ? mal.slice(0, 20) + '…' : mal,
        rav.length > 20 ? rav.slice(0, 20) + '…' : rav,
      ];
    });

    y = this.drawTable(
      doc,
      ['Date', 'Statut', 'État', 'Couv.', 'Haut.', 'Maladies', 'Ravageurs'],
      rows,
      [24, 24, 22, 18, 18, 38, 38],
      y,
      data.parcelle,
    );

    // Dernière synthèse
    const last = sorted[0];
    if (last?.rapport) {
      y = this.ensureSpace(doc, y, 20, data.parcelle);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      this.setColor(doc, this.GREY_DARK);
      doc.text('Synthèse dernière visite', this.MARGIN_X + 6, y);
      y += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      this.setColor(doc, this.GREY_MID);
      const lines = doc.splitTextToSize(last.rapport, this.CONTENT_W - 12);
      doc.text(lines, this.MARGIN_X + 6, y);
      y += lines.length * 5 + 3;
    }

    return y;
  }

  private drawIntrantsSection(doc: any, data: ParcelleReportData, y: number): number {
    y = this.drawSectionTitle(doc, '9. Intrants utilisés', y);

    if (!data.mouvementsParcelle.length) {
      return this.drawEmptyPlaceholder(doc, y, 'Aucun mouvement d\'intrant enregistré');
    }

    const rows = data.mouvementsParcelle.slice(0, 20).map(m => [
      this.formatDate(m.date),
      m.intrantNom,
      `${m.quantite} ${m.unite}`,
      m.type,
      m.motif || '—',
    ]);

    y = this.drawTable(
      doc,
      ['Date', 'Intrant', 'Quantité', 'Type', 'Motif'],
      rows,
      [28, 50, 28, 24, 52],
      y,
      data.parcelle,
    );

    const totalCout = data.mouvementsParcelle.reduce(
      (s, m) => s + (m.quantite || 0) * (m.coutUnitaire || 0), 0
    );
    if (totalCout > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      this.setColor(doc, this.GREEN_DARK);
      doc.text(`Coût total intrants : ${this.formatFCFA(totalCout)} FCFA`,
        this.PAGE_WIDTH - this.MARGIN_X, y + 4, { align: 'right' });
      y += 10;
    }

    return y;
  }

  private async drawRendementSection(doc: any, data: ParcelleReportData, y: number): Promise<number> {
    y = this.drawSectionTitle(doc, '10. Rendement & performance', y);

    // KPI rendement précédent
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    this.setColor(doc, this.GREY_MID);
    doc.text(`Rendement précédent : ${data.parcelle.rendementPrecedent || 0} t/ha`,
      this.MARGIN_X + 6, y);
    y += 6;

    if (data.rendementChartCanvas) {
      const img = this.canvasToImage(data.rendementChartCanvas);
      const w = this.CONTENT_W;
      const h = 50;
      if (img && this.safeAddImage(doc, img, this.MARGIN_X, y, w, h)) {
        y += h + 4;
      }
    }

    // Historique campagnes terminées
    if (data.campagnesTerminees.length) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      this.setColor(doc, this.GREY_DARK);
      doc.text('Campagnes passées', this.MARGIN_X + 6, y);
      y += 5;

      const rows = data.campagnesTerminees.slice(0, 10).map(c => [
        this.labelCulture(c.culture),
        c.variete || '—',
        this.formatDate(c.dateDebut),
        this.formatDate(c.dateFin),
        c.rendementFinal != null ? `${c.rendementFinal} t/ha` : '—',
      ]);
      y = this.drawTable(
        doc,
        ['Culture', 'Variété', 'Début', 'Fin', 'Rendement'],
        rows,
        [32, 36, 28, 28, 58],
        y,
        data.parcelle,
      );
    } else {
      y = this.drawEmptyPlaceholder(doc, y, 'Aucune campagne passée disponible');
    }

    return y;
  }

  private drawCostDistribution(doc: any, data: ParcelleReportData, y: number): number {
    y = this.drawSectionTitle(doc, '11. Répartition des coûts', y);

    // Agrégation
    const coutIntrants = data.mouvementsParcelle.reduce(
      (s, m) => s + (m.quantite || 0) * (m.coutUnitaire || 0), 0
    );
    const coutMainOeuvre = data.interventions
      .filter(iv => iv.type !== 'traitement_phyto' && iv.type !== 'fertilisation')
      .reduce((s, iv) => s + (iv.coutReel || iv.coutEstime || 0), 0);
    const coutTraitements = data.interventions
      .filter(iv => iv.type === 'traitement_phyto' || iv.type === 'fertilisation')
      .reduce((s, iv) => s + (iv.coutReel || iv.coutEstime || 0), 0);
    const coutIrrigation = data.interventions
      .filter(iv => iv.type === 'irrigation')
      .reduce((s, iv) => s + (iv.coutReel || iv.coutEstime || 0), 0);

    const buckets = [
      { label: 'Intrants', value: coutIntrants, color: [34, 197, 94] as [number, number, number] },
      { label: 'Main-d\'œuvre', value: coutMainOeuvre, color: [59, 130, 246] as [number, number, number] },
      { label: 'Traitements / Fertilisation', value: coutTraitements, color: [234, 179, 8] as [number, number, number] },
      { label: 'Irrigation', value: coutIrrigation, color: [14, 165, 233] as [number, number, number] },
    ].filter(b => b.value > 0);

    const total = buckets.reduce((s, b) => s + b.value, 0);
    if (total === 0) {
      return this.drawEmptyPlaceholder(doc, y, 'Pas de données financières');
    }

    // Génère un camembert via canvas offscreen
    const pieImg = this.buildPieChart(buckets, total);
    if (pieImg) {
      this.safeAddImage(doc, pieImg, this.MARGIN_X + 6, y, 60, 60);
    }

    // Légende + valeurs (à droite)
    const legX = this.MARGIN_X + 76;
    let legY = y + 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    this.setColor(doc, this.GREY_DARK);
    doc.text(`Total : ${this.formatFCFA(total)} FCFA`, legX, legY);
    legY += 8;

    buckets.forEach(b => {
      doc.setFillColor(b.color[0], b.color[1], b.color[2]);
      doc.rect(legX, legY - 3, 4, 4, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      this.setColor(doc, this.GREY_DARK);
      const pct = ((b.value / total) * 100).toFixed(0);
      doc.text(`${b.label}`, legX + 7, legY);
      doc.setFont('helvetica', 'bold');
      this.setColor(doc, this.GREEN_DARK);
      doc.text(`${this.formatFCFA(b.value)} FCFA (${pct}%)`, legX + 7, legY + 4.5);
      legY += 11;
    });

    return y + 65;
  }

  private drawRendementBarChart(doc: any, data: ParcelleReportData, y: number): number {
    y = this.drawSectionTitle(doc, '12. Comparatif rendements par campagne', y);

    const items = data.campagnesTerminees
      .filter(c => c.rendementFinal != null)
      .slice(0, 8)
      .map(c => ({
        label: `${this.labelCulture(c.culture)} ${new Date(c.dateDebut).getFullYear()}`,
        value: c.rendementFinal as number,
      }));

    if (!items.length) {
      return this.drawEmptyPlaceholder(doc, y, 'Pas d\'historique de rendement');
    }

    const img = this.buildBarChart(items);
    if (img) {
      const w = this.CONTENT_W;
      const h = 70;
      if (this.safeAddImage(doc, img, this.MARGIN_X, y, w, h)) {
        y += h + 4;
      }
    }

    return y;
  }

  // ───────────────────────── Graphes via Canvas ─────────────────────────

  private buildPieChart(
    buckets: { label: string; value: number; color: [number, number, number] }[],
    total: number
  ): string | null {
    try {
      const size = 400;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);

      let start = -Math.PI / 2;
      const cx = size / 2;
      const cy = size / 2;
      const r = size * 0.42;

      buckets.forEach(b => {
        const slice = (b.value / total) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, start, start + slice);
        ctx.closePath();
        ctx.fillStyle = `rgb(${b.color[0]},${b.color[1]},${b.color[2]})`;
        ctx.fill();
        start += slice;
      });

      // Anneau blanc central
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      return canvas.toDataURL('image/png');
    } catch {
      return null;
    }
  }

  private buildBarChart(items: { label: string; value: number }[]): string | null {
    try {
      const W = 800;
      const H = 360;
      const padL = 60;
      const padR = 20;
      const padT = 30;
      const padB = 70;

      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, W, H);

      const maxVal = Math.max(...items.map(i => i.value)) * 1.15 || 1;
      const gridH = H - padT - padB;
      const gridW = W - padL - padR;

      // Grille
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      ctx.fillStyle = '#64748b';
      ctx.font = '14px Helvetica';
      for (let g = 0; g <= 5; g++) {
        const yy = padT + (gridH / 5) * g;
        ctx.beginPath();
        ctx.moveTo(padL, yy);
        ctx.lineTo(W - padR, yy);
        ctx.stroke();
        const val = maxVal * (1 - g / 5);
        ctx.fillText(val.toFixed(1), 8, yy + 4);
      }

      // Axes
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(padL, padT);
      ctx.lineTo(padL, padT + gridH);
      ctx.lineTo(W - padR, padT + gridH);
      ctx.stroke();

      // Barres
      const n = items.length;
      const slot = gridW / n;
      const barW = slot * 0.6;
      items.forEach((it, i) => {
        const bx = padL + slot * i + (slot - barW) / 2;
        const bh = (it.value / maxVal) * gridH;
        const by = padT + gridH - bh;

        const grad = ctx.createLinearGradient(0, by, 0, by + bh);
        grad.addColorStop(0, '#22c55e');
        grad.addColorStop(1, '#1A7A4A');
        ctx.fillStyle = grad;
        ctx.fillRect(bx, by, barW, bh);

        // Valeur
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 13px Helvetica';
        ctx.textAlign = 'center';
        ctx.fillText(it.value.toFixed(1), bx + barW / 2, by - 6);

        // Label X
        ctx.fillStyle = '#64748b';
        ctx.font = '12px Helvetica';
        ctx.save();
        ctx.translate(bx + barW / 2, padT + gridH + 14);
        ctx.rotate(-Math.PI / 8);
        ctx.textAlign = 'right';
        ctx.fillText(it.label, 0, 10);
        ctx.restore();
      });

      // Titre Y
      ctx.save();
      ctx.translate(18, H / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 13px Helvetica';
      ctx.textAlign = 'center';
      ctx.fillText('Rendement (t/ha)', 0, 0);
      ctx.restore();

      return canvas.toDataURL('image/png');
    } catch {
      return null;
    }
  }

  private drawSparkline(doc: any, values: number[], y: number, width: number): number {
    if (!values.length) return y;
    const h = 25;
    const x0 = this.MARGIN_X + 6;
    const w = (width || this.CONTENT_W) - 6;

    this.setColor(doc, this.BG_SOFT, 'fill');
    doc.roundedRect(x0, y, w, h, 1.5, 1.5, 'F');

    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    this.setColor(doc, this.GREEN_DARK, 'draw');
    doc.setLineWidth(0.6);
    for (let i = 1; i < values.length; i++) {
      const x1 = x0 + ((i - 1) / (values.length - 1)) * w;
      const y1 = y + h - ((values[i - 1] - min) / range) * (h - 4) - 2;
      const x2 = x0 + (i / (values.length - 1)) * w;
      const y2 = y + h - ((values[i] - min) / range) * (h - 4) - 2;
      doc.line(x1, y1, x2, y2);
    }

    return y + h + 3;
  }

  // ───────────────────────── Captures DOM ─────────────────────────

  async captureElementAsImage(el: HTMLElement): Promise<string | null> {
    try {
      const mod = await import('html2canvas');
      const html2canvas = (mod as any).default || mod;
      const canvas = await html2canvas(el, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        scale: 2,
      });
      const url = canvas.toDataURL('image/png');
      return this.isValidPngDataUrl(url) ? url : null;
    } catch (err) {
      console.warn('[PdfReport] capture failed', err);
      return null;
    }
  }

  private canvasToImage(canvas: HTMLCanvasElement): string | null {
    try {
      const url = canvas.toDataURL('image/png');
      return this.isValidPngDataUrl(url) ? url : null;
    } catch {
      return null;
    }
  }

  /** Vérifie qu'on a bien un data URL PNG non vide. */
  private isValidPngDataUrl(url: string | null | undefined): boolean {
    if (!url || typeof url !== 'string') return false;
    // Une canvas vide retourne une URL très courte ("data:,"). jsPDF exige une vraie PNG.
    return url.startsWith('data:image/png;base64,') && url.length > 200;
  }

  /** Ajoute une image au PDF en gérant les erreurs jsPDF (PNG invalide, canvas tainté). */
  private safeAddImage(doc: any, dataUrl: string, x: number, y: number, w: number, h: number): boolean {
    if (!this.isValidPngDataUrl(dataUrl)) return false;
    try {
      doc.addImage(dataUrl, 'PNG', x, y, w, h);
      return true;
    } catch (err) {
      console.warn('[PdfReport] addImage failed', err);
      return false;
    }
  }

  // ───────────────────────── Utils ─────────────────────────

  private formatDate(d: Date | string | undefined): string {
    if (!d) return '—';
    try {
      const date = d instanceof Date ? d : new Date(d);
      if (isNaN(date.getTime())) return '—';
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return '—';
    }
  }

  private formatFCFA(v: number | undefined | null): string {
    if (v == null || isNaN(v)) return '—';
    const rounded = Math.round(v);
    const sign = rounded < 0 ? '-' : '';
    const abs = Math.abs(rounded).toString();
    // Séparateur milliers = espace simple (ASCII) pour compatibilité Helvetica/jsPDF
    return sign + abs.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  private labelCulture(c: CultureType | string | undefined): string {
    if (!c) return '—';
    return c.charAt(0).toUpperCase() + c.slice(1);
  }

  private ndviInterpretation(v: number): string {
    if (v < 0.2) return 'Sol nu ou végétation quasi-absente. Action corrective urgente recommandée.';
    if (v < 0.4) return 'Végétation clairsemée, stress probable. Vérifier l\'irrigation et la fertilisation.';
    if (v < 0.6) return 'Végétation modérée. Poursuivre le suivi et ajuster les apports.';
    if (v < 0.8) return 'Végétation dense et saine. Maintenir les pratiques actuelles.';
    return 'Végétation très dense et vigoureuse. Excellente performance végétative.';
  }
}
