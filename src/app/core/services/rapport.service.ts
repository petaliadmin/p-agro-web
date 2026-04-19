import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Visite } from '../models/visite.model';

export interface KpiRapport {
  visitesRealisees: number;
  haCouvertes: number;
  tachesClosees: number;
  coutIntrants: number;
  rendementMoyen: number;
  tauxAlertesResolues: number;
}

export interface RendementParCulture {
  culture: string;
  rendement: number;
  objectif: number;
  emoji: string;
}

export interface ProblemeDetecte {
  nom: string;
  count: number;
  type: 'maladie' | 'ravageur' | 'stress';
}

@Injectable({ providedIn: 'root' })
export class RapportService {
  getKpis(periode: 'semaine' | 'mois' | 'saison' = 'mois'): Observable<KpiRapport> {
    const data: Record<string, KpiRapport> = {
      semaine: { visitesRealisees: 6, haCouvertes: 32, tachesClosees: 4, coutIntrants: 485000, rendementMoyen: 3.8, tauxAlertesResolues: 75 },
      mois:    { visitesRealisees: 24, haCouvertes: 89, tachesClosees: 18, coutIntrants: 1840000, rendementMoyen: 4.1, tauxAlertesResolues: 82 },
      saison:  { visitesRealisees: 98, haCouvertes: 89, tachesClosees: 74, coutIntrants: 7200000, rendementMoyen: 4.3, tauxAlertesResolues: 88 },
    };
    return of(data[periode]).pipe(delay(300));
  }

  getRendementParCulture(): Observable<RendementParCulture[]> {
    return of([
      { culture: 'Riz',      rendement: 4.8, objectif: 5.0, emoji: '🌾' },
      { culture: 'Arachide', rendement: 1.4, objectif: 1.5, emoji: '🥜' },
      { culture: 'Maïs',     rendement: 3.2, objectif: 4.0, emoji: '🌽' },
      { culture: 'Oignon',   rendement: 18.5, objectif: 20.0, emoji: '🧅' },
      { culture: 'Tomate',   rendement: 22.0, objectif: 25.0, emoji: '🍅' },
      { culture: 'Mil',      rendement: 0.9, objectif: 1.0, emoji: '🌿' },
    ]).pipe(delay(250));
  }

  getTopProblemes(): Observable<ProblemeDetecte[]> {
    return of<ProblemeDetecte[]>([
      { nom: 'Pyriculariose',      count: 5, type: 'maladie'  },
      { nom: 'Foreur de tige',     count: 3, type: 'ravageur' },
      { nom: 'Mildiou',            count: 3, type: 'maladie'  },
      { nom: 'Chenille légionnaire', count: 2, type: 'ravageur' },
      { nom: 'Stress hydrique',    count: 2, type: 'stress'   },
    ]).pipe(delay(200));
  }

  getActiviteMensuelle(): Observable<{ semaine: string; visites: number; taches: number }[]> {
    return of([
      { semaine: 'S40', visites: 8,  taches: 12 },
      { semaine: 'S41', visites: 12, taches: 15 },
      { semaine: 'S42', visites: 6,  taches: 9  },
      { semaine: 'S43', visites: 10, taches: 11 },
      { semaine: 'S44', visites: 14, taches: 18 },
      { semaine: 'S45', visites: 9,  taches: 13 },
      { semaine: 'S46', visites: 11, taches: 16 },
      { semaine: 'S47', visites: 7,  taches: 10 },
    ]).pipe(delay(300));
  }

  genererPDF(): Observable<{ url: string; nom: string }> {
    // Simule la génération d'un PDF (retourne une URL fictive)
    return of({
      url: '#',
      nom: `Rapport_PetaliaFarmOS_${new Date().toISOString().split('T')[0]}.pdf`,
    }).pipe(delay(1500));
  }

  genererRapportVisite(visite: Visite): Observable<string> {
    const date = new Date(visite.date).toLocaleDateString('fr-FR');
    const maladies = visite.observations.maladiesDetectees.length
      ? visite.observations.maladiesDetectees.join(', ')
      : 'Aucune';
    const ravageurs = visite.observations.ravageursDetectes.length
      ? visite.observations.ravageursDetectes.join(', ')
      : 'Aucun';
    const recos = visite.recommandations.map(r => `- [${r.priorite.toUpperCase()}] ${r.description}`).join('\n');

    const rapport = [
      `RAPPORT DE VISITE — ${date}`,
      `Visite #${visite.id} | Parcelle: ${visite.parcelleId} | Technicien: ${visite.technicienId}`,
      `Durée: ${visite.duree} min`,
      ``,
      `— OBSERVATIONS —`,
      `Croissance: ${visite.observations.croissance}`,
      `Couleur feuilles: ${visite.observations.couleurFeuilles}`,
      `Hauteur plantes: ${visite.observations.hauteurPlantes} cm`,
      `Taux couverture: ${visite.observations.tauxCouverture}%`,
      `Stress hydrique: ${visite.observations.stressHydrique ? 'Oui' : 'Non'}`,
      `Maladies: ${maladies}`,
      `Ravageurs: ${ravageurs}`,
      ``,
      `— SOL & IRRIGATION —`,
      `Humidité sol: ${visite.sol.humidite} | pH: ${visite.sol.ph} | Drainage: ${visite.sol.drainage}`,
      `Irrigation: ${visite.irrigation.type}${visite.irrigation.probleme ? ' — Problème: ' + visite.irrigation.probleme : ''}`,
      ``,
      `— RECOMMANDATIONS —`,
      recos || 'Aucune recommandation',
      ``,
      `Rapport généré automatiquement le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`,
    ].join('\n');

    return of(rapport).pipe(delay(200));
  }
}
