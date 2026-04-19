import { Injectable, inject } from '@angular/core';
import { Observable, combineLatest, of, delay } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { RecolteService } from './recolte.service';
import { IntrantService } from './intrant.service';
import { ParcelleService } from './parcelle.service';
import { CampagneService } from './campagne.service';
import { TacheService } from './tache.service';
import { Recolte } from '../models/recolte.model';
import { Parcelle } from '../models/parcelle.model';

// ═══════════════════════════════════════════════════════
// Interfaces
// ═══════════════════════════════════════════════════════

export interface BilanParcelle {
  parcelleId: string;
  parcelleNom: string;
  culture: string;
  superficie: number;
  // Investissements
  coutIntrants: number;
  coutMainOeuvre: number;
  coutTransport: number;
  investissementTotal: number;
  // Rendement
  quantiteRecoltee: number;
  rendement: number;
  tauxPerte: number;
  qualite: string;
  // Économique
  revenuBrut: number;
  margeBrute: number;
  rentabilite: number;         // % = (margeBrute / investissementTotal) * 100
  coutParKg: number;
  margeParHa: number;
}

export interface BilanCampagne {
  campagneId?: string;
  label: string;
  periode: string;
  nbParcelles: number;
  superficieTotale: number;
  investissementTotal: number;
  revenuTotal: number;
  margeTotale: number;
  rentabiliteMoyenne: number;
  rendementMoyen: number;
  tauxPerteMoyen: number;
  bilansParParcelle: BilanParcelle[];
}

export interface ComparaisonParcelles {
  parcelles: BilanParcelle[];
  meilleurRendement: BilanParcelle | null;
  meilleureRentabilite: BilanParcelle | null;
  moinsBonRendement: BilanParcelle | null;
}

export interface ComparaisonCampagnes {
  campagneN: BilanCampagne;
  campagneN1: BilanCampagne;
  evolutionRendement: number;     // %
  evolutionRevenu: number;        // %
  evolutionMarge: number;         // %
  evolutionPertes: number;        // points
}

// ═══════════════════════════════════════════════════════
// Service
// ═══════════════════════════════════════════════════════

@Injectable({ providedIn: 'root' })
export class RapportTechnicoEconomiqueService {
  private recolteService = inject(RecolteService);
  private intrantService = inject(IntrantService);
  private parcelleService = inject(ParcelleService);
  private tacheService = inject(TacheService);

  // ── 37.1 Bilan par parcelle ───────────────────────
  getBilanParcelle(parcelleId: string): Observable<BilanParcelle | null> {
    return combineLatest([
      this.parcelleService.getAll(),
      this.recolteService.getByParcelle(parcelleId),
      this.intrantService.getCoutParParcelle(parcelleId),
      this.tacheService.getAll(),
    ]).pipe(
      take(1),
      map(([parcelles, recoltes, coutIntrants, taches]) => {
        const parcelle = parcelles.find(p => p.id === parcelleId);
        if (!parcelle || recoltes.length === 0) return null;

        const derniereRecolte = recoltes[0];
        const tachesParcelle = taches.filter(t => t.parcelleId === parcelleId);
        const coutMO = tachesParcelle.reduce((s, t) => s + (t.coutMainOeuvre || 0), 0);
        const coutTransport = coutIntrants.details.reduce((s, d) => s + 0, 0) + Math.round(parcelle.superficie * 15000);

        const investissementTotal = coutIntrants.total + coutMO + coutTransport;
        const revenuBrut = derniereRecolte.revenuTotal || 0;
        const margeBrute = revenuBrut - investissementTotal;

        return {
          parcelleId,
          parcelleNom: parcelle.nom,
          culture: parcelle.culture,
          superficie: parcelle.superficie,
          coutIntrants: coutIntrants.total,
          coutMainOeuvre: coutMO,
          coutTransport,
          investissementTotal,
          quantiteRecoltee: derniereRecolte.quantiteRecoltee,
          rendement: derniereRecolte.rendement,
          tauxPerte: derniereRecolte.tauxPerte,
          qualite: derniereRecolte.qualite,
          revenuBrut,
          margeBrute,
          rentabilite: investissementTotal > 0 ? Math.round((margeBrute / investissementTotal) * 100) : 0,
          coutParKg: derniereRecolte.quantiteRecoltee > 0 ? Math.round(investissementTotal / derniereRecolte.quantiteRecoltee) : 0,
          margeParHa: parcelle.superficie > 0 ? Math.round(margeBrute / parcelle.superficie) : 0,
        };
      }),
      delay(300),
    );
  }

  // ── 37.2 Bilan par campagne (global) ──────────────
  getBilanCampagne(annee?: number): Observable<BilanCampagne> {
    const label = annee ? `Campagne ${annee}` : 'Campagne en cours';

    return combineLatest([
      this.parcelleService.getAll(),
      this.recolteService.getAll(),
      this.intrantService.getAll(),
      this.tacheService.getAll(),
    ]).pipe(
      take(1),
      map(([parcelles, recoltes, intrants, taches]) => {
        const recoltesFiltre = annee
          ? recoltes.filter(r => new Date(r.dateRecolte).getFullYear() === annee)
          : recoltes;

        const parcelleIds = [...new Set(recoltesFiltre.map(r => r.parcelleId))];

        const bilansParParcelle: BilanParcelle[] = parcelleIds.map(pid => {
          const parcelle = parcelles.find(p => p.id === pid);
          const recParcelle = recoltesFiltre
            .filter(r => r.parcelleId === pid)
            .sort((a, b) => new Date(b.dateRecolte).getTime() - new Date(a.dateRecolte).getTime());
          const derniereRecolte = recParcelle[0];
          if (!parcelle || !derniereRecolte) return null!;

          // Calculer coûts intrants pour cette parcelle
          let coutIntrants = 0;
          intrants.forEach(i => {
            i.mouvements
              .filter(m => m.type === 'sortie' && m.parcelleId === pid)
              .forEach(m => { coutIntrants += m.quantite * i.prixUnitaire; });
          });

          const tachesParcelle = taches.filter(t => t.parcelleId === pid);
          const coutMO = tachesParcelle.reduce((s, t) => s + (t.coutMainOeuvre || 0), 0);
          const coutTransport = Math.round((parcelle.superficie || 1) * 15000);
          const investissementTotal = coutIntrants + coutMO + coutTransport;
          const revenuBrut = derniereRecolte.revenuTotal || 0;
          const margeBrute = revenuBrut - investissementTotal;

          return {
            parcelleId: pid,
            parcelleNom: parcelle.nom,
            culture: parcelle.culture,
            superficie: parcelle.superficie,
            coutIntrants,
            coutMainOeuvre: coutMO,
            coutTransport,
            investissementTotal,
            quantiteRecoltee: derniereRecolte.quantiteRecoltee,
            rendement: derniereRecolte.rendement,
            tauxPerte: derniereRecolte.tauxPerte,
            qualite: derniereRecolte.qualite,
            revenuBrut,
            margeBrute,
            rentabilite: investissementTotal > 0 ? Math.round((margeBrute / investissementTotal) * 100) : 0,
            coutParKg: derniereRecolte.quantiteRecoltee > 0 ? Math.round(investissementTotal / derniereRecolte.quantiteRecoltee) : 0,
            margeParHa: parcelle.superficie > 0 ? Math.round(margeBrute / parcelle.superficie) : 0,
          };
        }).filter(Boolean);

        const superficieTotale = bilansParParcelle.reduce((s, b) => s + b.superficie, 0);
        const investissementTotal = bilansParParcelle.reduce((s, b) => s + b.investissementTotal, 0);
        const revenuTotal = bilansParParcelle.reduce((s, b) => s + b.revenuBrut, 0);
        const margeTotale = revenuTotal - investissementTotal;

        return {
          label,
          periode: annee ? `${annee}` : new Date().getFullYear().toString(),
          nbParcelles: bilansParParcelle.length,
          superficieTotale: Math.round(superficieTotale * 100) / 100,
          investissementTotal,
          revenuTotal,
          margeTotale,
          rentabiliteMoyenne: bilansParParcelle.length > 0
            ? Math.round(bilansParParcelle.reduce((s, b) => s + b.rentabilite, 0) / bilansParParcelle.length)
            : 0,
          rendementMoyen: bilansParParcelle.length > 0
            ? Math.round((bilansParParcelle.reduce((s, b) => s + b.rendement, 0) / bilansParParcelle.length) * 100) / 100
            : 0,
          tauxPerteMoyen: bilansParParcelle.length > 0
            ? Math.round((bilansParParcelle.reduce((s, b) => s + b.tauxPerte, 0) / bilansParParcelle.length) * 10) / 10
            : 0,
          bilansParParcelle,
        };
      }),
      delay(400),
    );
  }

  // ── 37.3 Comparaison entre parcelles ──────────────
  getComparaisonParcelles(): Observable<ComparaisonParcelles> {
    return this.getBilanCampagne().pipe(
      map(bilan => {
        const parcelles = bilan.bilansParParcelle;
        const sorted = [...parcelles].sort((a, b) => b.rendement - a.rendement);
        const sortedRenta = [...parcelles].sort((a, b) => b.rentabilite - a.rentabilite);

        return {
          parcelles,
          meilleurRendement: sorted[0] || null,
          meilleureRentabilite: sortedRenta[0] || null,
          moinsBonRendement: sorted[sorted.length - 1] || null,
        };
      }),
    );
  }

  // ── 37.4 Comparaison campagnes n vs n-1 ───────────
  getComparaisonCampagnes(anneeN: number): Observable<ComparaisonCampagnes> {
    return combineLatest([
      this.getBilanCampagne(anneeN),
      this.getBilanCampagne(anneeN - 1),
    ]).pipe(
      map(([campagneN, campagneN1]) => {
        const evolRendement = campagneN1.rendementMoyen > 0
          ? Math.round(((campagneN.rendementMoyen - campagneN1.rendementMoyen) / campagneN1.rendementMoyen) * 100)
          : 0;
        const evolRevenu = campagneN1.revenuTotal > 0
          ? Math.round(((campagneN.revenuTotal - campagneN1.revenuTotal) / campagneN1.revenuTotal) * 100)
          : 0;
        const evolMarge = campagneN1.margeTotale !== 0
          ? Math.round(((campagneN.margeTotale - campagneN1.margeTotale) / Math.abs(campagneN1.margeTotale)) * 100)
          : 0;
        const evolPertes = Math.round((campagneN.tauxPerteMoyen - campagneN1.tauxPerteMoyen) * 10) / 10;

        return {
          campagneN,
          campagneN1,
          evolutionRendement: evolRendement,
          evolutionRevenu: evolRevenu,
          evolutionMarge: evolMarge,
          evolutionPertes: evolPertes,
        };
      }),
    );
  }

  // ── 37.5 Export PDF ───────────────────────────────
  genererPDFBilan(bilan: BilanCampagne): Observable<string> {
    const lines: string[] = [
      '═══════════════════════════════════════════════════════',
      '         RAPPORT TECHNICO-ÉCONOMIQUE',
      `         ${bilan.label} — ${bilan.periode}`,
      '═══════════════════════════════════════════════════════',
      '',
      `Date de génération : ${new Date().toLocaleDateString('fr-FR')}`,
      '',
      '── RÉSUMÉ GLOBAL ────────────────────────────────────',
      `Nombre de parcelles : ${bilan.nbParcelles}`,
      `Superficie totale : ${bilan.superficieTotale} ha`,
      `Investissement total : ${bilan.investissementTotal.toLocaleString('en-US').replace(/,/g, ' ')} FCFA`,
      `Revenu total : ${bilan.revenuTotal.toLocaleString('en-US').replace(/,/g, ' ')} FCFA`,
      `Marge totale : ${bilan.margeTotale.toLocaleString('en-US').replace(/,/g, ' ')} FCFA`,
      `Rentabilité moyenne : ${bilan.rentabiliteMoyenne}%`,
      `Rendement moyen : ${bilan.rendementMoyen} t/ha`,
      `Taux de perte moyen : ${bilan.tauxPerteMoyen}%`,
      '',
      '── DÉTAIL PAR PARCELLE ──────────────────────────────',
    ];

    bilan.bilansParParcelle.forEach(bp => {
      lines.push('');
      lines.push(`▸ ${bp.parcelleNom} (${bp.culture} — ${bp.superficie} ha)`);
      lines.push(`  Investissement : ${bp.investissementTotal.toLocaleString('en-US').replace(/,/g, ' ')} FCFA`);
      lines.push(`    ↳ Intrants : ${bp.coutIntrants.toLocaleString('en-US').replace(/,/g, ' ')} FCFA`);
      lines.push(`    ↳ Main-d'œuvre : ${bp.coutMainOeuvre.toLocaleString('en-US').replace(/,/g, ' ')} FCFA`);
      lines.push(`    ↳ Transport : ${bp.coutTransport.toLocaleString('en-US').replace(/,/g, ' ')} FCFA`);
      lines.push(`  Rendement : ${bp.rendement} t/ha | Qualité : ${bp.qualite}`);
      lines.push(`  Pertes : ${bp.tauxPerte}% | Coût/kg : ${bp.coutParKg} FCFA`);
      lines.push(`  Revenu brut : ${bp.revenuBrut.toLocaleString('en-US').replace(/,/g, ' ')} FCFA`);
      lines.push(`  Marge brute : ${bp.margeBrute.toLocaleString('en-US').replace(/,/g, ' ')} FCFA`);
      lines.push(`  Rentabilité : ${bp.rentabilite}% | Marge/ha : ${bp.margeParHa.toLocaleString('en-US').replace(/,/g, ' ')} FCFA`);
    });

    lines.push('');
    lines.push('═══════════════════════════════════════════════════════');
    lines.push('Généré automatiquement par Petalia Farm OS');
    lines.push(`Le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`);

    return of(lines.join('\n')).pipe(delay(500));
  }

  // ── 37.6 Export Excel (CSV) ───────────────────────
  genererExcelBilan(bilan: BilanCampagne): Observable<string> {
    const headers = [
      'Parcelle', 'Culture', 'Superficie (ha)',
      'Coût Intrants (FCFA)', 'Coût Main-d\'œuvre (FCFA)', 'Coût Transport (FCFA)', 'Investissement Total (FCFA)',
      'Quantité Récoltée (kg)', 'Rendement (t/ha)', 'Taux Perte (%)', 'Qualité',
      'Revenu Brut (FCFA)', 'Marge Brute (FCFA)', 'Rentabilité (%)', 'Coût/kg (FCFA)', 'Marge/ha (FCFA)',
    ];

    const rows = bilan.bilansParParcelle.map(bp => [
      bp.parcelleNom, bp.culture, bp.superficie,
      bp.coutIntrants, bp.coutMainOeuvre, bp.coutTransport, bp.investissementTotal,
      bp.quantiteRecoltee, bp.rendement, bp.tauxPerte, bp.qualite,
      bp.revenuBrut, bp.margeBrute, bp.rentabilite, bp.coutParKg, bp.margeParHa,
    ].join(';'));

    // Ligne totale
    const totals = [
      'TOTAL', '', bilan.superficieTotale,
      bilan.bilansParParcelle.reduce((s, b) => s + b.coutIntrants, 0),
      bilan.bilansParParcelle.reduce((s, b) => s + b.coutMainOeuvre, 0),
      bilan.bilansParParcelle.reduce((s, b) => s + b.coutTransport, 0),
      bilan.investissementTotal,
      bilan.bilansParParcelle.reduce((s, b) => s + b.quantiteRecoltee, 0),
      bilan.rendementMoyen, bilan.tauxPerteMoyen, '',
      bilan.revenuTotal, bilan.margeTotale, bilan.rentabiliteMoyenne, '', '',
    ].join(';');

    const csv = [headers.join(';'), ...rows, '', totals].join('\n');
    return of(csv).pipe(delay(400));
  }
}
