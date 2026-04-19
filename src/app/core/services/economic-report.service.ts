import { Injectable } from '@angular/core';
import {
  BilanCampagne,
  BilanParcelle,
  ComparaisonParcelles,
  ComparaisonCampagnes,
} from './rapport-technico-economique.service';

export interface EconomicReportData {
  bilan: BilanCampagne;
  comparaisonParcelles?: ComparaisonParcelles | null;
  comparaisonCampagnes?: ComparaisonCampagnes | null;
}

export interface ParcelleEconomicReportData {
  bilanParcelle: BilanParcelle;
  periode?: string;
  // Rang de la parcelle parmi la campagne (optionnel)
  ranking?: {
    rangRentabilite: number;
    rangRendement: number;
    totalParcelles: number;
    moyenneRentabilite: number;
    moyenneRendement: number;
    moyenneMargeParHa: number;
  } | null;
}

interface SectionPageEntry {
  title: string;
  page: number;
}

/**
 * Génère un rapport PDF technico-économique professionnel (A4 portrait).
 * Même approche que `PdfReportService` : page de garde verte, sommaire auto,
 * sections avec tableaux alternés, graphiques générés en canvas offscreen,
 * header/footer paginé, placeholders pour données absentes.
 */
@Injectable({ providedIn: 'root' })
export class EconomicReportService {
  // Palette
  private readonly GREEN_DARK: [number, number, number] = [26, 122, 74];
  private readonly GREEN_LIGHT: [number, number, number] = [34, 197, 94];
  private readonly RED: [number, number, number] = [220, 38, 38];
  private readonly GREY_DARK: [number, number, number] = [30, 41, 59];
  private readonly GREY_MID: [number, number, number] = [100, 116, 139];
  private readonly GREY_LIGHT: [number, number, number] = [203, 213, 225];
  private readonly BG_SOFT: [number, number, number] = [248, 250, 252];

  // Layout
  private readonly PAGE_WIDTH = 210;
  private readonly PAGE_HEIGHT = 297;
  private readonly MARGIN_X = 14;
  private readonly CONTENT_W = 210 - 14 * 2;
  private readonly TOP_Y = 32;
  private readonly BOTTOM_Y = 297 - 16;

  async generateEconomicReport(data: EconomicReportData): Promise<void> {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    const sections: SectionPageEntry[] = [];

    // ── Page de garde ──
    this.drawCoverPage(doc, data.bilan);

    // ── Sommaire (à remplir à la fin) ──
    doc.addPage();
    const tocPage = doc.getNumberOfPages();

    // ── Sections ──
    let y = this.startNewPage(doc);
    sections.push({ title: '1. Résumé exécutif', page: doc.getNumberOfPages() });
    y = this.drawResumeExecutif(doc, data.bilan, y);

    y = this.ensureSpace(doc, y, 80);
    sections.push({ title: '2. Indicateurs clés', page: doc.getNumberOfPages() });
    y = this.drawKpiSection(doc, data.bilan, y);

    y = this.ensureSpace(doc, y, 80);
    sections.push({ title: '3. Répartition des coûts', page: doc.getNumberOfPages() });
    y = this.drawCostDistribution(doc, data.bilan, y);

    y = this.ensureSpace(doc, y, 60);
    sections.push({ title: '4. Détail par parcelle', page: doc.getNumberOfPages() });
    y = this.drawBilansParParcelle(doc, data.bilan, y);

    y = this.ensureSpace(doc, y, 70);
    sections.push({ title: '5. Classement des parcelles', page: doc.getNumberOfPages() });
    y = this.drawRankingSection(doc, data.bilan, y);

    if (data.comparaisonParcelles) {
      y = this.ensureSpace(doc, y, 50);
      sections.push({ title: '6. Meilleures performances', page: doc.getNumberOfPages() });
      y = this.drawComparaisonParcelles(doc, data.comparaisonParcelles, y);
    }

    if (data.comparaisonCampagnes) {
      y = this.ensureSpace(doc, y, 70);
      sections.push({ title: '7. Évolution N vs N-1', page: doc.getNumberOfPages() });
      y = this.drawComparaisonCampagnes(doc, data.comparaisonCampagnes, y);
    }

    y = this.ensureSpace(doc, y, 80);
    sections.push({ title: '8. Rentabilité par parcelle', page: doc.getNumberOfPages() });
    y = this.drawRentabiliteChart(doc, data.bilan, y);

    // ── Sommaire ──
    doc.setPage(tocPage);
    this.drawSummaryPage(doc, data.bilan, sections);

    // ── Header/footer global ──
    const total = doc.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
      doc.setPage(i);
      this.drawFooter(doc, i, total);
      if (i > 1) this.drawMiniHeader(doc, data.bilan);
    }

    const dateStr = new Date().toISOString().slice(0, 10);
    const label = (data.bilan.label || 'bilan').replace(/[^a-zA-Z0-9_-]/g, '_');
    doc.save(`Bilan_Technico_Economique_${label}_${dateStr}.pdf`);
  }

  /**
   * Génère un rapport PDF économique dédié à une seule parcelle.
   * Même charte graphique : page de garde verte, sommaire auto, sections,
   * graphiques offscreen (pie coûts, bar KPIs), comparatif à la moyenne,
   * header/footer paginé.
   */
  async generateParcelleEconomicReport(data: ParcelleEconomicReportData): Promise<void> {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    const sections: SectionPageEntry[] = [];
    const bp = data.bilanParcelle;
    const periode = data.periode || new Date().getFullYear().toString();

    // ── Page de garde ──
    this.drawParcelleCoverPage(doc, bp, periode);

    // ── Sommaire (à remplir à la fin) ──
    doc.addPage();
    const tocPage = doc.getNumberOfPages();

    // ── Sections ──
    let y = this.startNewPage(doc);
    sections.push({ title: '1. Fiche parcelle', page: doc.getNumberOfPages() });
    y = this.drawParcelleIdentity(doc, bp, periode, y);

    y = this.ensureSpace(doc, y, 80);
    sections.push({ title: '2. Indicateurs économiques', page: doc.getNumberOfPages() });
    y = this.drawParcelleKpiSection(doc, bp, y);

    y = this.ensureSpace(doc, y, 80);
    sections.push({ title: '3. Répartition des investissements', page: doc.getNumberOfPages() });
    y = this.drawParcelleCostDistribution(doc, bp, y);

    y = this.ensureSpace(doc, y, 70);
    sections.push({ title: '4. Synthèse financière', page: doc.getNumberOfPages() });
    y = this.drawParcelleFinancialSummary(doc, bp, y);

    y = this.ensureSpace(doc, y, 70);
    sections.push({ title: '5. Performance de production', page: doc.getNumberOfPages() });
    y = this.drawParcelleProductionSection(doc, bp, y);

    if (data.ranking) {
      y = this.ensureSpace(doc, y, 80);
      sections.push({ title: '6. Comparaison à la campagne', page: doc.getNumberOfPages() });
      y = this.drawParcelleRankingSection(doc, bp, data.ranking, y);
    }

    y = this.ensureSpace(doc, y, 30);
    sections.push({ title: `${data.ranking ? '7' : '6'}. Conclusion`, page: doc.getNumberOfPages() });
    y = this.drawParcelleConclusion(doc, bp, y);

    // ── Sommaire ──
    doc.setPage(tocPage);
    this.drawParcelleSummaryPage(doc, bp, periode, sections);

    // ── Header/footer global ──
    const total = doc.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
      doc.setPage(i);
      this.drawFooter(doc, i, total);
      if (i > 1) this.drawParcelleMiniHeader(doc, bp, periode);
    }

    const dateStr = new Date().toISOString().slice(0, 10);
    const label = (bp.parcelleNom || 'parcelle').replace(/[^a-zA-Z0-9_-]/g, '_');
    doc.save(`Bilan_Parcelle_${label}_${dateStr}.pdf`);
  }

  // ───────────────── Sections parcelle ─────────────────

  private drawParcelleCoverPage(doc: any, bp: BilanParcelle, periode: string): void {
    // Bandeau vert
    this.setColor(doc, this.GREEN_DARK, 'fill');
    doc.rect(0, 0, this.PAGE_WIDTH, 80, 'F');
    this.setColor(doc, this.GREEN_LIGHT, 'fill');
    doc.rect(0, 76, this.PAGE_WIDTH, 4, 'F');

    // Logo + tagline
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(255, 255, 255);
    doc.text('Petalia Farm OS', this.MARGIN_X, 28);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text('Plateforme de supervision agronomique', this.MARGIN_X, 36);

    // Titre
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('Bilan économique parcelle', this.MARGIN_X, 60);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    const dateStr = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
    doc.text(`Édité le ${dateStr}`, this.MARGIN_X, 70);

    // Carte résumé
    const boxY = 100;
    this.setColor(doc, this.BG_SOFT, 'fill');
    doc.roundedRect(this.MARGIN_X, boxY, this.CONTENT_W, 110, 3, 3, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    this.setColor(doc, this.GREEN_DARK);
    doc.text(bp.parcelleNom || 'Parcelle', this.MARGIN_X + 8, boxY + 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    this.setColor(doc, this.GREY_MID);
    doc.text(`${this.labelCulture(bp.culture)} · ${bp.superficie} ha · Campagne ${periode}`, this.MARGIN_X + 8, boxY + 22);

    const margeColor: [number, number, number] = bp.margeBrute >= 0 ? this.GREEN_DARK : this.RED;
    const rentColor: [number, number, number] = bp.rentabilite >= 0 ? this.GREEN_DARK : this.RED;

    const colL = this.MARGIN_X + 8;
    const colR = this.MARGIN_X + this.CONTENT_W / 2 + 4;
    const rows: [string, string, [number, number, number] | null, string, string, [number, number, number] | null][] = [
      ['Investissement', `${this.formatFCFA(bp.investissementTotal)} FCFA`, null, 'Revenu brut', `${this.formatFCFA(bp.revenuBrut)} FCFA`, this.GREEN_DARK],
      ['Marge brute', `${this.formatFCFA(bp.margeBrute)} FCFA`, margeColor, 'Rentabilité', `${bp.rentabilite}%`, rentColor],
      ['Rendement', `${bp.rendement} t/ha`, null, 'Taux de pertes', `${bp.tauxPerte}%`, bp.tauxPerte > 15 ? this.RED : null],
      ['Coût/kg', `${this.formatFCFA(bp.coutParKg)} FCFA`, null, 'Marge/ha', `${this.formatFCFA(bp.margeParHa)} FCFA`, bp.margeParHa >= 0 ? this.GREEN_DARK : this.RED],
      ['Récolte', `${this.formatFCFA(bp.quantiteRecoltee)} kg`, null, 'Qualité', bp.qualite || '—', null],
    ];

    let yy = boxY + 38;
    rows.forEach(r => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      this.setColor(doc, this.GREY_MID);
      doc.text(r[0], colL, yy);
      doc.text(r[3], colR, yy);

      doc.setFont('helvetica', 'bold');
      this.setColor(doc, r[2] || this.GREY_DARK);
      doc.text(r[1], colL + 32, yy);
      this.setColor(doc, r[5] || this.GREY_DARK);
      doc.text(r[4], colR + 32, yy);
      yy += 9;
    });

    // Footer cover
    this.setColor(doc, this.GREEN_DARK, 'fill');
    doc.rect(0, this.PAGE_HEIGHT - 20, this.PAGE_WIDTH, 20, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text('Rapport économique dédié à la parcelle — usage agronomique et financier interne',
      this.MARGIN_X, this.PAGE_HEIGHT - 8);
  }

  private drawParcelleMiniHeader(doc: any, bp: BilanParcelle, periode: string): void {
    this.setColor(doc, this.GREEN_DARK, 'fill');
    doc.rect(0, 0, this.PAGE_WIDTH, 6, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    this.setColor(doc, this.GREEN_DARK);
    doc.text('Petalia Farm OS', this.MARGIN_X, 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    this.setColor(doc, this.GREY_MID);
    const right = `Bilan parcelle · ${bp.parcelleNom} · ${periode}`;
    const w = doc.getTextWidth(right);
    doc.text(right, this.PAGE_WIDTH - this.MARGIN_X - w, 14);

    this.setColor(doc, this.GREY_LIGHT, 'draw');
    doc.setLineWidth(0.3);
    doc.line(this.MARGIN_X, 18, this.PAGE_WIDTH - this.MARGIN_X, 18);
  }

  private drawParcelleSummaryPage(doc: any, bp: BilanParcelle, periode: string, sections: SectionPageEntry[]): void {
    let y = this.TOP_Y;
    y = this.drawSectionTitle(doc, 'Sommaire', y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);

    sections.forEach(s => {
      if (y + 9 > this.BOTTOM_Y) return;
      this.setColor(doc, this.GREY_DARK);
      doc.text(s.title, this.MARGIN_X + 6, y);

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

    y = Math.max(y + 10, this.TOP_Y + 120);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    this.setColor(doc, this.GREY_MID);
    const tagline = `Ce rapport détaille la situation économique de la parcelle "${bp.parcelleNom}" (${this.labelCulture(bp.culture)}, ${bp.superficie} ha) sur la campagne ${periode}.`;
    const lines = doc.splitTextToSize(tagline, this.CONTENT_W - 12);
    doc.text(lines, this.MARGIN_X + 6, y);
  }

  private drawParcelleIdentity(doc: any, bp: BilanParcelle, periode: string, y: number): number {
    y = this.drawSectionTitle(doc, '1. Fiche parcelle', y);

    const rows: string[][] = [
      ['Nom de la parcelle', bp.parcelleNom || '—'],
      ['Culture', this.labelCulture(bp.culture)],
      ['Superficie', `${bp.superficie} ha`],
      ['Campagne', periode],
      ['Quantité récoltée', `${this.formatFCFA(bp.quantiteRecoltee)} kg`],
      ['Qualité', bp.qualite || '—'],
    ];

    return this.drawTable(
      doc,
      ['Caractéristique', 'Valeur'],
      rows,
      [80, this.CONTENT_W - 80],
      y,
      ['left', 'left'],
    );
  }

  private drawParcelleKpiSection(doc: any, bp: BilanParcelle, y: number): number {
    y = this.drawSectionTitle(doc, '2. Indicateurs économiques', y);

    const margeColor = bp.margeBrute >= 0 ? this.GREEN_DARK : this.RED;
    const rentColor = bp.rentabilite >= 0 ? this.GREEN_DARK : this.RED;

    const kpis: { label: string; value: string; color?: [number, number, number] }[] = [
      { label: 'Investissement', value: `${this.formatFCFA(bp.investissementTotal)} FCFA` },
      { label: 'Revenu brut', value: `${this.formatFCFA(bp.revenuBrut)} FCFA`, color: this.GREEN_DARK },
      { label: 'Marge brute', value: `${this.formatFCFA(bp.margeBrute)} FCFA`, color: margeColor },
      { label: 'Rentabilité', value: `${bp.rentabilite}%`, color: rentColor },
      { label: 'Coût par kg', value: `${this.formatFCFA(bp.coutParKg)} FCFA` },
      { label: 'Marge par ha', value: `${this.formatFCFA(bp.margeParHa)} FCFA`, color: bp.margeParHa >= 0 ? this.GREEN_DARK : this.RED },
      { label: 'Rendement', value: `${bp.rendement} t/ha` },
      { label: 'Pertes post-récolte', value: `${bp.tauxPerte}%`, color: bp.tauxPerte > 15 ? this.RED : this.GREY_DARK },
    ];

    const perRow = 4;
    const gap = 3;
    const cardW = (this.CONTENT_W - gap * (perRow - 1)) / perRow;
    const cardH = 22;

    kpis.forEach((k, i) => {
      const col = i % perRow;
      const row = Math.floor(i / perRow);
      const cx = this.MARGIN_X + col * (cardW + gap);
      const cy = y + row * (cardH + gap);

      this.setColor(doc, this.BG_SOFT, 'fill');
      doc.roundedRect(cx, cy, cardW, cardH, 1.5, 1.5, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      this.setColor(doc, k.color || this.GREEN_DARK);
      doc.text(k.value, cx + cardW / 2, cy + 10, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      this.setColor(doc, this.GREY_MID);
      doc.text(k.label, cx + cardW / 2, cy + 17, { align: 'center' });
    });

    const nbRows = Math.ceil(kpis.length / perRow);
    return y + nbRows * (cardH + gap) + 2;
  }

  private drawParcelleCostDistribution(doc: any, bp: BilanParcelle, y: number): number {
    y = this.drawSectionTitle(doc, '3. Répartition des investissements', y);

    const buckets = [
      { label: 'Intrants', value: bp.coutIntrants, color: [34, 197, 94] as [number, number, number] },
      { label: 'Main-d\'œuvre', value: bp.coutMainOeuvre, color: [59, 130, 246] as [number, number, number] },
      { label: 'Transport', value: bp.coutTransport, color: [234, 179, 8] as [number, number, number] },
    ].filter(b => b.value > 0);

    const total = buckets.reduce((s, b) => s + b.value, 0);
    if (total === 0) {
      return this.drawEmptyPlaceholder(doc, y, 'Aucun coût enregistré pour cette parcelle');
    }

    const pieImg = this.buildPieChart(buckets, total);
    if (pieImg && this.isValidPng(pieImg)) {
      try { doc.addImage(pieImg, 'PNG', this.MARGIN_X + 6, y, 60, 60); } catch { /* noop */ }
    }

    const legX = this.MARGIN_X + 76;
    let legY = y + 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    this.setColor(doc, this.GREY_DARK);
    doc.text(`Total investissement : ${this.formatFCFA(total)} FCFA`, legX, legY);
    legY += 8;

    buckets.forEach(b => {
      doc.setFillColor(b.color[0], b.color[1], b.color[2]);
      doc.rect(legX, legY - 3, 4, 4, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      this.setColor(doc, this.GREY_DARK);
      const pct = ((b.value / total) * 100).toFixed(0);
      doc.text(b.label, legX + 7, legY);
      doc.setFont('helvetica', 'bold');
      this.setColor(doc, this.GREEN_DARK);
      doc.text(`${this.formatFCFA(b.value)} FCFA (${pct}%)`, legX + 7, legY + 4.5);
      legY += 11;
    });

    return y + 66;
  }

  private drawParcelleFinancialSummary(doc: any, bp: BilanParcelle, y: number): number {
    y = this.drawSectionTitle(doc, '4. Synthèse financière', y);

    const rows: string[][] = [
      ['Coût intrants', `${this.formatFCFA(bp.coutIntrants)} FCFA`],
      ['Coût main-d\'œuvre', `${this.formatFCFA(bp.coutMainOeuvre)} FCFA`],
      ['Coût transport / logistique', `${this.formatFCFA(bp.coutTransport)} FCFA`],
      ['Investissement total', `${this.formatFCFA(bp.investissementTotal)} FCFA`],
      ['Revenu brut', `${this.formatFCFA(bp.revenuBrut)} FCFA`],
      ['Marge brute', `${this.formatFCFA(bp.margeBrute)} FCFA`],
      ['Rentabilité', `${bp.rentabilite}%`],
    ];

    return this.drawTable(
      doc,
      ['Poste', 'Montant'],
      rows,
      [110, this.CONTENT_W - 110],
      y,
      ['left', 'right'],
    );
  }

  private drawParcelleProductionSection(doc: any, bp: BilanParcelle, y: number): number {
    y = this.drawSectionTitle(doc, '5. Performance de production', y);

    const rows: string[][] = [
      ['Quantité récoltée', `${this.formatFCFA(bp.quantiteRecoltee)} kg`],
      ['Rendement', `${bp.rendement} t/ha`],
      ['Taux de pertes post-récolte', `${bp.tauxPerte}%`],
      ['Coût par kg produit', `${this.formatFCFA(bp.coutParKg)} FCFA`],
      ['Marge par hectare', `${this.formatFCFA(bp.margeParHa)} FCFA`],
      ['Qualité', bp.qualite || '—'],
    ];

    return this.drawTable(
      doc,
      ['Indicateur', 'Valeur'],
      rows,
      [110, this.CONTENT_W - 110],
      y,
      ['left', 'right'],
    );
  }

  private drawParcelleRankingSection(
    doc: any,
    bp: BilanParcelle,
    ranking: NonNullable<ParcelleEconomicReportData['ranking']>,
    y: number,
  ): number {
    y = this.drawSectionTitle(doc, '6. Comparaison à la campagne', y);

    const diffRent = bp.rentabilite - ranking.moyenneRentabilite;
    const diffRend = bp.rendement - ranking.moyenneRendement;
    const diffMargeHa = bp.margeParHa - ranking.moyenneMargeParHa;

    const rows: string[][] = [
      ['Rentabilité', `${bp.rentabilite}%`, `${ranking.moyenneRentabilite}%`, this.formatDelta(diffRent, '%')],
      ['Rendement', `${bp.rendement} t/ha`, `${ranking.moyenneRendement} t/ha`, this.formatDelta(diffRend, ' t/ha')],
      ['Marge/ha', `${this.formatFCFA(bp.margeParHa)} F`, `${this.formatFCFA(ranking.moyenneMargeParHa)} F`, this.formatDelta(diffMargeHa, ' F')],
    ];

    y = this.drawTable(
      doc,
      ['Indicateur', 'Parcelle', 'Moyenne campagne', 'Écart'],
      rows,
      [48, 44, 50, 40],
      y,
      ['left', 'right', 'right', 'right'],
    );

    // Encadré rang
    y += 2;
    this.setColor(doc, this.BG_SOFT, 'fill');
    doc.roundedRect(this.MARGIN_X, y, this.CONTENT_W, 18, 2, 2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    this.setColor(doc, this.GREEN_DARK);
    doc.text(
      `Rang rentabilité : #${ranking.rangRentabilite} / ${ranking.totalParcelles}`,
      this.MARGIN_X + 8, y + 8,
    );
    doc.text(
      `Rang rendement : #${ranking.rangRendement} / ${ranking.totalParcelles}`,
      this.MARGIN_X + 8, y + 14,
    );

    return y + 22;
  }

  private drawParcelleConclusion(doc: any, bp: BilanParcelle, y: number): number {
    y = this.drawSectionTitle(doc, 'Conclusion', y);

    const margeSigne = bp.margeBrute >= 0 ? 'bénéficiaire' : 'déficitaire';
    const rentSigne = bp.rentabilite >= 0 ? 'positive' : 'négative';
    const pertesMsg = bp.tauxPerte > 15
      ? `Le taux de pertes post-récolte (${bp.tauxPerte}%) reste élevé et mérite un plan d'action dédié (logistique, stockage).`
      : `Le taux de pertes post-récolte (${bp.tauxPerte}%) est maîtrisé.`;

    const text = [
      `La parcelle "${bp.parcelleNom}" (${this.labelCulture(bp.culture)}, ${bp.superficie} ha) présente un bilan ${margeSigne} avec une marge brute de ${this.formatFCFA(bp.margeBrute)} FCFA.`,
      `Sur un investissement total de ${this.formatFCFA(bp.investissementTotal)} FCFA, la rentabilité est ${rentSigne} à ${bp.rentabilite}% et le coût de production ressort à ${this.formatFCFA(bp.coutParKg)} FCFA par kilogramme.`,
      pertesMsg,
    ].join(' ');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    this.setColor(doc, this.GREY_DARK);
    const lines = doc.splitTextToSize(text, this.CONTENT_W - 12);
    doc.text(lines, this.MARGIN_X + 6, y);
    return y + lines.length * 5 + 6;
  }

  private formatDelta(v: number, unit: string): string {
    const arrow = v > 0 ? '↑' : v < 0 ? '↓' : '→';
    const sign = v > 0 ? '+' : '';
    const formatted = Math.abs(v) >= 1000
      ? this.formatFCFA(v)
      : (Math.round(v * 100) / 100).toString();
    return `${arrow} ${sign}${formatted}${unit}`;
  }

  // ───────────────── Layout helpers ─────────────────

  private setColor(doc: any, rgb: [number, number, number], ctx: 'text' | 'fill' | 'draw' = 'text'): void {
    if (ctx === 'text') doc.setTextColor(rgb[0], rgb[1], rgb[2]);
    else if (ctx === 'fill') doc.setFillColor(rgb[0], rgb[1], rgb[2]);
    else doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
  }

  private startNewPage(doc: any): number {
    doc.addPage();
    return this.TOP_Y;
  }

  private ensureSpace(doc: any, y: number, needed: number): number {
    if (y + needed > this.BOTTOM_Y) return this.startNewPage(doc);
    return y;
  }

  private drawMiniHeader(doc: any, bilan: BilanCampagne): void {
    this.setColor(doc, this.GREEN_DARK, 'fill');
    doc.rect(0, 0, this.PAGE_WIDTH, 6, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    this.setColor(doc, this.GREEN_DARK);
    doc.text('Petalia Farm OS', this.MARGIN_X, 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    this.setColor(doc, this.GREY_MID);
    const right = `Bilan technico-économique · ${bilan.label || ''}`;
    const w = doc.getTextWidth(right);
    doc.text(right, this.PAGE_WIDTH - this.MARGIN_X - w, 14);

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
    const midW = doc.getTextWidth(dateStr);
    doc.text(dateStr, (this.PAGE_WIDTH - midW) / 2, y);

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

  private drawEmptyPlaceholder(doc: any, y: number, message = 'Aucune donnée disponible'): number {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    this.setColor(doc, this.GREY_MID);
    doc.text(message, this.MARGIN_X + 6, y);
    return y + 8;
  }

  private drawTable(
    doc: any,
    headers: string[],
    rows: string[][],
    colWidths: number[],
    startY: number,
    aligns: ('left' | 'right')[] = [],
  ): number {
    const x0 = this.MARGIN_X;
    const rowH = 7;
    const headerH = 8;

    const drawHeader = (yy: number) => {
      this.setColor(doc, this.GREEN_DARK, 'fill');
      doc.rect(x0, yy, this.CONTENT_W, headerH, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      let cx = x0;
      headers.forEach((h, i) => {
        const align = aligns[i] || 'left';
        if (align === 'right') {
          doc.text(h, cx + colWidths[i] - 2, yy + 5.5, { align: 'right' });
        } else {
          doc.text(h, cx + 2, yy + 5.5);
        }
        cx += colWidths[i];
      });
    };

    drawHeader(startY);
    let y = startY + headerH;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    rows.forEach((row, idx) => {
      if (y + rowH > this.BOTTOM_Y) {
        y = this.startNewPage(doc);
        drawHeader(y);
        y += headerH;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
      }
      if (idx % 2 === 1) {
        this.setColor(doc, this.BG_SOFT, 'fill');
        doc.rect(x0, y, this.CONTENT_W, rowH, 'F');
      }
      this.setColor(doc, this.GREY_DARK);
      let cx = x0;
      row.forEach((cell, i) => {
        const maxW = colWidths[i] - 4;
        const clipped = doc.splitTextToSize(cell ?? '', maxW)[0] || '';
        const align = aligns[i] || 'left';
        if (align === 'right') {
          doc.text(clipped, cx + colWidths[i] - 2, y + 5, { align: 'right' });
        } else {
          doc.text(clipped, cx + 2, y + 5);
        }
        cx += colWidths[i];
      });
      y += rowH;
    });

    this.setColor(doc, this.GREY_LIGHT, 'draw');
    doc.setLineWidth(0.2);
    doc.line(x0, y, x0 + this.CONTENT_W, y);

    return y + 4;
  }

  // ───────────────── Sections ─────────────────

  private drawCoverPage(doc: any, bilan: BilanCampagne): void {
    // Bandeau vert
    this.setColor(doc, this.GREEN_DARK, 'fill');
    doc.rect(0, 0, this.PAGE_WIDTH, 80, 'F');
    this.setColor(doc, this.GREEN_LIGHT, 'fill');
    doc.rect(0, 76, this.PAGE_WIDTH, 4, 'F');

    // Logo + tagline
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(255, 255, 255);
    doc.text('Petalia Farm OS', this.MARGIN_X, 28);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text('Plateforme de supervision agronomique', this.MARGIN_X, 36);

    // Titre
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('Bilan technico-économique', this.MARGIN_X, 60);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    const dateStr = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
    doc.text(`Édité le ${dateStr}`, this.MARGIN_X, 70);

    // Carte résumé
    const boxY = 100;
    this.setColor(doc, this.BG_SOFT, 'fill');
    doc.roundedRect(this.MARGIN_X, boxY, this.CONTENT_W, 100, 3, 3, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    this.setColor(doc, this.GREEN_DARK);
    doc.text(bilan.label || 'Bilan', this.MARGIN_X + 8, boxY + 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    this.setColor(doc, this.GREY_MID);
    doc.text(`Période : ${bilan.periode}`, this.MARGIN_X + 8, boxY + 22);

    const margeColor: [number, number, number] = bilan.margeTotale >= 0 ? this.GREEN_DARK : this.RED;

    // Grille 2 col
    const colL = this.MARGIN_X + 8;
    const colR = this.MARGIN_X + this.CONTENT_W / 2 + 4;
    const rows: [string, string, [number, number, number] | null, string, string, [number, number, number] | null][] = [
      ['Parcelles', String(bilan.nbParcelles), null, 'Superficie', `${bilan.superficieTotale} ha`, null],
      ['Investissement', `${this.formatFCFA(bilan.investissementTotal)} FCFA`, null, 'Revenu total', `${this.formatFCFA(bilan.revenuTotal)} FCFA`, this.GREEN_DARK],
      ['Marge totale', `${this.formatFCFA(bilan.margeTotale)} FCFA`, margeColor, 'Rentabilité moy.', `${bilan.rentabiliteMoyenne}%`, null],
      ['Rendement moy.', `${bilan.rendementMoyen} t/ha`, null, 'Pertes moy.', `${bilan.tauxPerteMoyen}%`, null],
    ];

    let yy = boxY + 38;
    rows.forEach(r => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      this.setColor(doc, this.GREY_MID);
      doc.text(r[0], colL, yy);
      doc.text(r[3], colR, yy);

      doc.setFont('helvetica', 'bold');
      this.setColor(doc, r[2] || this.GREY_DARK);
      doc.text(r[1], colL + 32, yy);
      this.setColor(doc, r[5] || this.GREY_DARK);
      doc.text(r[4], colR + 32, yy);
      yy += 9;
    });

    // Footer cover
    this.setColor(doc, this.GREEN_DARK, 'fill');
    doc.rect(0, this.PAGE_HEIGHT - 20, this.PAGE_WIDTH, 20, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text('Document à usage agronomique et financier interne',
      this.MARGIN_X, this.PAGE_HEIGHT - 8);
  }

  private drawSummaryPage(doc: any, bilan: BilanCampagne, sections: SectionPageEntry[]): void {
    let y = this.TOP_Y;
    y = this.drawSectionTitle(doc, 'Sommaire', y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);

    sections.forEach(s => {
      if (y + 9 > this.BOTTOM_Y) return;
      this.setColor(doc, this.GREY_DARK);
      doc.text(s.title, this.MARGIN_X + 6, y);

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

    // Petit rappel en bas
    y = Math.max(y + 10, this.TOP_Y + 120);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    this.setColor(doc, this.GREY_MID);
    const tagline = `Ce rapport synthétise les investissements, rendements et marges de ${bilan.nbParcelles} parcelle(s) sur la période ${bilan.periode}.`;
    const lines = doc.splitTextToSize(tagline, this.CONTENT_W - 12);
    doc.text(lines, this.MARGIN_X + 6, y);
  }

  private drawResumeExecutif(doc: any, bilan: BilanCampagne, y: number): number {
    y = this.drawSectionTitle(doc, '1. Résumé exécutif', y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    this.setColor(doc, this.GREY_DARK);

    const margeSigne = bilan.margeTotale >= 0 ? 'bénéficiaire' : 'déficitaire';
    const rentSigne = bilan.rentabiliteMoyenne >= 0 ? 'positive' : 'négative';
    const text = [
      `Ce bilan porte sur ${bilan.nbParcelles} parcelle(s) représentant ${bilan.superficieTotale} ha de surface cultivée sur la période ${bilan.periode}.`,
      `L'investissement total s'élève à ${this.formatFCFA(bilan.investissementTotal)} FCFA pour un revenu brut de ${this.formatFCFA(bilan.revenuTotal)} FCFA, soit une marge ${margeSigne} de ${this.formatFCFA(bilan.margeTotale)} FCFA.`,
      `La rentabilité moyenne est ${rentSigne} (${bilan.rentabiliteMoyenne}%) avec un rendement moyen de ${bilan.rendementMoyen} t/ha et un taux de pertes post-récolte de ${bilan.tauxPerteMoyen}%.`,
    ].join(' ');

    const lines = doc.splitTextToSize(text, this.CONTENT_W - 12);
    doc.text(lines, this.MARGIN_X + 6, y);
    y += lines.length * 5 + 6;

    return y;
  }

  private drawKpiSection(doc: any, bilan: BilanCampagne, y: number): number {
    y = this.drawSectionTitle(doc, '2. Indicateurs clés de la campagne', y);

    const kpis: { label: string; value: string; color?: [number, number, number] }[] = [
      { label: 'Investissement', value: `${this.formatFCFA(bilan.investissementTotal)} FCFA` },
      { label: 'Revenu total', value: `${this.formatFCFA(bilan.revenuTotal)} FCFA`, color: this.GREEN_DARK },
      { label: 'Marge totale', value: `${this.formatFCFA(bilan.margeTotale)} FCFA`, color: bilan.margeTotale >= 0 ? this.GREEN_DARK : this.RED },
      { label: 'Rentabilité moy.', value: `${bilan.rentabiliteMoyenne}%`, color: bilan.rentabiliteMoyenne >= 0 ? this.GREEN_DARK : this.RED },
      { label: 'Rendement moy.', value: `${bilan.rendementMoyen} t/ha` },
      { label: 'Pertes moy.', value: `${bilan.tauxPerteMoyen}%`, color: bilan.tauxPerteMoyen > 15 ? this.RED : this.GREY_DARK },
      { label: 'Parcelles', value: String(bilan.nbParcelles) },
      { label: 'Superficie', value: `${bilan.superficieTotale} ha` },
    ];

    const perRow = 4;
    const gap = 3;
    const cardW = (this.CONTENT_W - gap * (perRow - 1)) / perRow;
    const cardH = 22;

    kpis.forEach((k, i) => {
      const col = i % perRow;
      const row = Math.floor(i / perRow);
      const cx = this.MARGIN_X + col * (cardW + gap);
      const cy = y + row * (cardH + gap);

      this.setColor(doc, this.BG_SOFT, 'fill');
      doc.roundedRect(cx, cy, cardW, cardH, 1.5, 1.5, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      this.setColor(doc, k.color || this.GREEN_DARK);
      doc.text(k.value, cx + cardW / 2, cy + 10, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      this.setColor(doc, this.GREY_MID);
      doc.text(k.label, cx + cardW / 2, cy + 17, { align: 'center' });
    });

    const nbRows = Math.ceil(kpis.length / perRow);
    return y + nbRows * (cardH + gap) + 2;
  }

  private drawCostDistribution(doc: any, bilan: BilanCampagne, y: number): number {
    y = this.drawSectionTitle(doc, '3. Répartition des coûts', y);

    const totalIntrants = bilan.bilansParParcelle.reduce((s, b) => s + b.coutIntrants, 0);
    const totalMO = bilan.bilansParParcelle.reduce((s, b) => s + b.coutMainOeuvre, 0);
    const totalTransport = bilan.bilansParParcelle.reduce((s, b) => s + b.coutTransport, 0);

    const buckets = [
      { label: 'Intrants', value: totalIntrants, color: [34, 197, 94] as [number, number, number] },
      { label: 'Main-d\'œuvre', value: totalMO, color: [59, 130, 246] as [number, number, number] },
      { label: 'Transport', value: totalTransport, color: [234, 179, 8] as [number, number, number] },
    ].filter(b => b.value > 0);

    const total = buckets.reduce((s, b) => s + b.value, 0);
    if (total === 0) {
      return this.drawEmptyPlaceholder(doc, y, 'Pas de données de coûts disponibles');
    }

    const pieImg = this.buildPieChart(buckets, total);
    if (pieImg && this.isValidPng(pieImg)) {
      try { doc.addImage(pieImg, 'PNG', this.MARGIN_X + 6, y, 60, 60); } catch { /* noop */ }
    }

    // Légende à droite
    const legX = this.MARGIN_X + 76;
    let legY = y + 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    this.setColor(doc, this.GREY_DARK);
    doc.text(`Total investissement : ${this.formatFCFA(total)} FCFA`, legX, legY);
    legY += 8;

    buckets.forEach(b => {
      doc.setFillColor(b.color[0], b.color[1], b.color[2]);
      doc.rect(legX, legY - 3, 4, 4, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      this.setColor(doc, this.GREY_DARK);
      const pct = ((b.value / total) * 100).toFixed(0);
      doc.text(b.label, legX + 7, legY);
      doc.setFont('helvetica', 'bold');
      this.setColor(doc, this.GREEN_DARK);
      doc.text(`${this.formatFCFA(b.value)} FCFA (${pct}%)`, legX + 7, legY + 4.5);
      legY += 11;
    });

    return y + 66;
  }

  private drawBilansParParcelle(doc: any, bilan: BilanCampagne, y: number): number {
    y = this.drawSectionTitle(doc, '4. Détail par parcelle', y);

    if (!bilan.bilansParParcelle.length) {
      return this.drawEmptyPlaceholder(doc, y, 'Aucune parcelle à afficher');
    }

    const rows = bilan.bilansParParcelle.map(b => [
      b.parcelleNom,
      this.labelCulture(b.culture),
      `${b.superficie}`,
      `${b.rendement}`,
      this.formatFCFA(b.investissementTotal),
      this.formatFCFA(b.revenuBrut),
      this.formatFCFA(b.margeBrute),
      `${b.rentabilite}%`,
    ]);

    // Ligne total
    const totalInvest = bilan.bilansParParcelle.reduce((s, b) => s + b.investissementTotal, 0);
    const totalRevenu = bilan.bilansParParcelle.reduce((s, b) => s + b.revenuBrut, 0);
    const totalMarge = bilan.bilansParParcelle.reduce((s, b) => s + b.margeBrute, 0);

    y = this.drawTable(
      doc,
      ['Parcelle', 'Culture', 'Ha', 't/ha', 'Invest. FCFA', 'Revenu FCFA', 'Marge FCFA', 'Rent.'],
      rows,
      [38, 24, 14, 14, 28, 28, 28, 16],
      y,
      ['left', 'left', 'right', 'right', 'right', 'right', 'right', 'right'],
    );

    // Ligne totale en gras
    const x0 = this.MARGIN_X;
    const rowH = 8;
    this.setColor(doc, this.GREEN_DARK, 'fill');
    doc.rect(x0, y - 4, this.CONTENT_W, rowH, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);

    const cellX: number[] = [];
    const widths = [38, 24, 14, 14, 28, 28, 28, 16];
    let cx = x0;
    widths.forEach(w => { cellX.push(cx); cx += w; });

    doc.text('TOTAL', cellX[0] + 2, y + 1);
    doc.text(`${bilan.superficieTotale}`, cellX[2] + widths[2] - 2, y + 1, { align: 'right' });
    doc.text(`${bilan.rendementMoyen}`, cellX[3] + widths[3] - 2, y + 1, { align: 'right' });
    doc.text(this.formatFCFA(totalInvest), cellX[4] + widths[4] - 2, y + 1, { align: 'right' });
    doc.text(this.formatFCFA(totalRevenu), cellX[5] + widths[5] - 2, y + 1, { align: 'right' });
    doc.text(this.formatFCFA(totalMarge), cellX[6] + widths[6] - 2, y + 1, { align: 'right' });
    doc.text(`${bilan.rentabiliteMoyenne}%`, cellX[7] + widths[7] - 2, y + 1, { align: 'right' });

    return y + rowH + 2;
  }

  private drawRankingSection(doc: any, bilan: BilanCampagne, y: number): number {
    y = this.drawSectionTitle(doc, '5. Classement des parcelles', y);

    if (!bilan.bilansParParcelle.length) {
      return this.drawEmptyPlaceholder(doc, y, 'Aucune parcelle');
    }

    const sorted = [...bilan.bilansParParcelle].sort((a, b) => b.rentabilite - a.rentabilite);
    const rows = sorted.map((b, i) => [
      `#${i + 1}`,
      b.parcelleNom,
      this.labelCulture(b.culture),
      `${b.rendement} t/ha`,
      `${b.rentabilite}%`,
      this.formatFCFA(b.margeParHa),
      this.formatFCFA(b.coutParKg),
    ]);

    return this.drawTable(
      doc,
      ['Rang', 'Parcelle', 'Culture', 'Rendement', 'Rentabilité', 'Marge/ha FCFA', 'Coût/kg FCFA'],
      rows,
      [14, 40, 24, 28, 24, 28, 24],
      y,
      ['left', 'left', 'left', 'right', 'right', 'right', 'right'],
    );
  }

  private drawComparaisonParcelles(doc: any, comp: ComparaisonParcelles, y: number): number {
    y = this.drawSectionTitle(doc, '6. Meilleures performances', y);

    const cards: { title: string; parcelle: BilanParcelle | null; metric: string; value: string }[] = [
      {
        title: 'Meilleur rendement',
        parcelle: comp.meilleurRendement,
        metric: 'Rendement',
        value: comp.meilleurRendement ? `${comp.meilleurRendement.rendement} t/ha` : '—',
      },
      {
        title: 'Meilleure rentabilité',
        parcelle: comp.meilleureRentabilite,
        metric: 'Rentabilité',
        value: comp.meilleureRentabilite ? `${comp.meilleureRentabilite.rentabilite}%` : '—',
      },
      {
        title: 'À améliorer',
        parcelle: comp.moinsBonRendement,
        metric: 'Rendement',
        value: comp.moinsBonRendement ? `${comp.moinsBonRendement.rendement} t/ha` : '—',
      },
    ];

    const cardW = (this.CONTENT_W - 6) / 3;
    const cardH = 34;
    cards.forEach((c, i) => {
      const cx = this.MARGIN_X + i * (cardW + 3);
      this.setColor(doc, this.BG_SOFT, 'fill');
      doc.roundedRect(cx, y, cardW, cardH, 2, 2, 'F');

      // Bandeau titre
      this.setColor(doc, this.GREEN_DARK, 'fill');
      doc.roundedRect(cx, y, cardW, 7, 2, 2, 'F');
      doc.rect(cx, y + 3, cardW, 4, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text(c.title, cx + cardW / 2, y + 5, { align: 'center' });

      // Contenu
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      this.setColor(doc, this.GREY_DARK);
      const name = c.parcelle?.parcelleNom || '—';
      doc.text(name, cx + cardW / 2, y + 15, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      this.setColor(doc, this.GREY_MID);
      doc.text(this.labelCulture(c.parcelle?.culture || ''), cx + cardW / 2, y + 21, { align: 'center' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      this.setColor(doc, this.GREEN_DARK);
      doc.text(c.value, cx + cardW / 2, y + 30, { align: 'center' });
    });

    return y + cardH + 6;
  }

  private drawComparaisonCampagnes(doc: any, comp: ComparaisonCampagnes, y: number): number {
    y = this.drawSectionTitle(doc, '7. Évolution N vs N-1', y);

    // Tableau d'évolutions
    const rows: string[][] = [
      ['Rendement moyen', `${comp.campagneN1.rendementMoyen} t/ha`, `${comp.campagneN.rendementMoyen} t/ha`, this.formatEvolution(comp.evolutionRendement, '%')],
      ['Revenu total', `${this.formatFCFA(comp.campagneN1.revenuTotal)} FCFA`, `${this.formatFCFA(comp.campagneN.revenuTotal)} FCFA`, this.formatEvolution(comp.evolutionRevenu, '%')],
      ['Marge totale', `${this.formatFCFA(comp.campagneN1.margeTotale)} FCFA`, `${this.formatFCFA(comp.campagneN.margeTotale)} FCFA`, this.formatEvolution(comp.evolutionMarge, '%')],
      ['Pertes post-récolte', `${comp.campagneN1.tauxPerteMoyen}%`, `${comp.campagneN.tauxPerteMoyen}%`, this.formatEvolution(comp.evolutionPertes, 'pts', true)],
    ];

    y = this.drawTable(
      doc,
      ['Indicateur', comp.campagneN1.label, comp.campagneN.label, 'Évolution'],
      rows,
      [50, 44, 44, 44],
      y,
      ['left', 'right', 'right', 'right'],
    );

    return y;
  }

  private drawRentabiliteChart(doc: any, bilan: BilanCampagne, y: number): number {
    y = this.drawSectionTitle(doc, '8. Rentabilité par parcelle', y);

    const items = bilan.bilansParParcelle.map(b => ({
      label: b.parcelleNom,
      value: b.rentabilite,
    }));

    if (!items.length) {
      return this.drawEmptyPlaceholder(doc, y, 'Aucune parcelle');
    }

    const img = this.buildBarChart(items, 'Rentabilité (%)');
    if (img && this.isValidPng(img)) {
      const w = this.CONTENT_W;
      const h = 70;
      try {
        doc.addImage(img, 'PNG', this.MARGIN_X, y, w, h);
        y += h + 4;
      } catch { /* noop */ }
    }

    return y;
  }

  // ───────────────── Charts offscreen ─────────────────

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

      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      return canvas.toDataURL('image/png');
    } catch {
      return null;
    }
  }

  private buildBarChart(items: { label: string; value: number }[], yLabel = ''): string | null {
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

      const maxAbs = Math.max(...items.map(i => Math.abs(i.value))) * 1.15 || 1;
      const hasNegative = items.some(i => i.value < 0);
      const gridH = H - padT - padB;
      const gridW = W - padL - padR;
      const zeroY = hasNegative ? padT + gridH / 2 : padT + gridH;
      const scale = hasNegative ? gridH / 2 / maxAbs : gridH / maxAbs;

      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      ctx.fillStyle = '#64748b';
      ctx.font = '14px Helvetica';

      // Lignes grille
      const steps = 5;
      for (let g = 0; g <= steps; g++) {
        const val = hasNegative ? (maxAbs - (2 * maxAbs * g) / steps) : (maxAbs - (maxAbs * g) / steps);
        const yy = padT + (gridH / steps) * g;
        ctx.beginPath();
        ctx.moveTo(padL, yy);
        ctx.lineTo(W - padR, yy);
        ctx.stroke();
        ctx.fillText(val.toFixed(0), 8, yy + 4);
      }

      // Axes
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(padL, padT);
      ctx.lineTo(padL, padT + gridH);
      ctx.lineTo(W - padR, padT + gridH);
      ctx.stroke();

      if (hasNegative) {
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padL, zeroY);
        ctx.lineTo(W - padR, zeroY);
        ctx.stroke();
      }

      // Bars
      const slot = gridW / items.length;
      const barW = slot * 0.6;
      items.forEach((it, i) => {
        const bx = padL + slot * i + (slot - barW) / 2;
        const bh = it.value * scale;
        const by = it.value >= 0 ? zeroY - bh : zeroY;

        const grad = ctx.createLinearGradient(0, by, 0, by + Math.abs(bh));
        if (it.value >= 0) {
          grad.addColorStop(0, '#22c55e');
          grad.addColorStop(1, '#1A7A4A');
        } else {
          grad.addColorStop(0, '#f87171');
          grad.addColorStop(1, '#b91c1c');
        }
        ctx.fillStyle = grad;
        ctx.fillRect(bx, by, barW, Math.abs(bh));

        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 13px Helvetica';
        ctx.textAlign = 'center';
        const labelY = it.value >= 0 ? by - 6 : by + Math.abs(bh) + 14;
        ctx.fillText(`${it.value}`, bx + barW / 2, labelY);

        ctx.fillStyle = '#64748b';
        ctx.font = '12px Helvetica';
        ctx.save();
        ctx.translate(bx + barW / 2, padT + gridH + 14);
        ctx.rotate(-Math.PI / 8);
        ctx.textAlign = 'right';
        ctx.fillText(it.label, 0, 10);
        ctx.restore();
      });

      if (yLabel) {
        ctx.save();
        ctx.translate(18, H / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 13px Helvetica';
        ctx.textAlign = 'center';
        ctx.fillText(yLabel, 0, 0);
        ctx.restore();
      }

      return canvas.toDataURL('image/png');
    } catch {
      return null;
    }
  }

  private isValidPng(url: string | null | undefined): boolean {
    return !!url && typeof url === 'string' && url.startsWith('data:image/png;base64,') && url.length > 200;
  }

  // ───────────────── Utils ─────────────────

  private formatFCFA(v: number | undefined | null): string {
    if (v == null || isNaN(v)) return '—';
    const rounded = Math.round(v);
    const sign = rounded < 0 ? '-' : '';
    const abs = Math.abs(rounded).toString();
    // Séparateur milliers = espace simple (ASCII) pour compatibilité Helvetica/jsPDF
    return sign + abs.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  private labelCulture(c: string | undefined): string {
    if (!c) return '—';
    return c.charAt(0).toUpperCase() + c.slice(1);
  }

  private formatEvolution(v: number, unit: 'pts' | '%', invertColor = false): string {
    const arrow = v > 0 ? '↑' : v < 0 ? '↓' : '→';
    const sign = v > 0 ? '+' : '';
    return `${arrow} ${sign}${v}${unit === '%' ? '%' : ' pts'}`;
  }
}
