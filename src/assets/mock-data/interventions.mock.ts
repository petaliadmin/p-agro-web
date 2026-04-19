import { Intervention } from '../../app/core/models/intervention.model';

function d(y: number, m: number, day: number): Date { return new Date(y, m - 1, day); }

export const MOCK_INTERVENTIONS: Intervention[] = [
  // ═══ p001 — Riz Walo Nord, campagne c001 (semis 15 août 2024) ═══
  {
    id: 'int001', parcelleId: 'p001', campagneId: 'c001', type: 'preparation_sol',
    label: 'Préparation sol (labour + planage)', datePrevue: d(2024,8,1), dateRealisee: d(2024,8,2),
    statut: 'terminee', observations: 'Planage au tracteur, sol bien nivelé',
    coutEstime: 75000, coutReel: 82000, responsableId: 'tech001', mainOeuvre: 4, dureeEstimee: 40, ordre: 1,
  },
  {
    id: 'int002', parcelleId: 'p001', campagneId: 'c001', type: 'semis',
    label: 'Semis direct', datePrevue: d(2024,8,15), dateRealisee: d(2024,8,15),
    statut: 'terminee', observations: 'Variété Sahel 108, densité 20x20cm',
    coutEstime: 35000, coutReel: 38000, responsableId: 'tech001', mainOeuvre: 6, dureeEstimee: 24, ordre: 2,
  },
  {
    id: 'int003', parcelleId: 'p001', campagneId: 'c001', type: 'fertilisation',
    label: 'Fertilisation fond (DAP)', datePrevue: d(2024,8,15), dateRealisee: d(2024,8,16),
    statut: 'terminee', produitUtilise: 'DAP 18-46-0', dose: '150 kg/ha',
    observations: 'Épandage homogène',
    coutEstime: 45000, coutReel: 47000, responsableId: 'tech001', mainOeuvre: 2, dureeEstimee: 4, ordre: 3,
  },
  {
    id: 'int004', parcelleId: 'p001', campagneId: 'c001', type: 'desherbage',
    label: 'Désherbage', datePrevue: d(2024,9,5), dateRealisee: d(2024,9,6),
    statut: 'terminee', observations: 'Désherbage manuel, peu d\'adventices',
    coutEstime: 25000, coutReel: 22000, responsableId: 'tech001', mainOeuvre: 5, dureeEstimee: 16, ordre: 4,
  },
  {
    id: 'int005', parcelleId: 'p001', campagneId: 'c001', type: 'fertilisation',
    label: 'Urée tallage', datePrevue: d(2024,9,14), dateRealisee: d(2024,9,15),
    statut: 'terminee', produitUtilise: 'Urée 46%', dose: '100 kg/ha',
    coutEstime: 30000, coutReel: 30000, responsableId: 'tech001', mainOeuvre: 2, dureeEstimee: 4, ordre: 5,
  },
  {
    id: 'int006', parcelleId: 'p001', campagneId: 'c001', type: 'traitement_phyto',
    label: 'Traitement fongicide', datePrevue: d(2024,9,29), dateRealisee: d(2024,10,1),
    statut: 'terminee', produitUtilise: 'Tricyclazole', dose: '2 L/ha',
    observations: 'Prévention pyriculariose',
    coutEstime: 20000, coutReel: 23000, responsableId: 'tech001', mainOeuvre: 2, dureeEstimee: 6, ordre: 6,
  },
  {
    id: 'int007', parcelleId: 'p001', campagneId: 'c001', type: 'fertilisation',
    label: 'Urée montaison', datePrevue: d(2024,10,14),
    statut: 'en_cours', produitUtilise: 'Urée 46%', dose: '100 kg/ha',
    coutEstime: 30000, responsableId: 'tech001', mainOeuvre: 2, dureeEstimee: 4, ordre: 7,
  },
  {
    id: 'int008', parcelleId: 'p001', campagneId: 'c001', type: 'irrigation',
    label: 'Assec pré-récolte', datePrevue: d(2024,10,29),
    statut: 'planifiee',
    coutEstime: 15000, responsableId: 'tech001', mainOeuvre: 2, dureeEstimee: 8, ordre: 8,
  },
  {
    id: 'int009', parcelleId: 'p001', campagneId: 'c001', type: 'recolte',
    label: 'Récolte', datePrevue: d(2024,12,13),
    statut: 'planifiee',
    coutEstime: 85000, responsableId: 'tech001', mainOeuvre: 8, dureeEstimee: 40, ordre: 9,
  },

  // ═══ p003 — Maïs Casamance A, campagne c003 (semis 5 juil 2024) ═══
  {
    id: 'int010', parcelleId: 'p003', campagneId: 'c003', type: 'preparation_sol',
    label: 'Préparation sol', datePrevue: d(2024,6,25), dateRealisee: d(2024,6,26),
    statut: 'terminee', observations: 'Labour au tracteur',
    coutEstime: 50000, coutReel: 55000, responsableId: 'tech002', mainOeuvre: 3, dureeEstimee: 24, ordre: 1,
  },
  {
    id: 'int011', parcelleId: 'p003', campagneId: 'c003', type: 'semis',
    label: 'Semis en poquets', datePrevue: d(2024,7,5), dateRealisee: d(2024,7,5),
    statut: 'terminee', observations: 'Obatanpa, écartement 75x25cm',
    coutEstime: 20000, coutReel: 20000, responsableId: 'tech002', mainOeuvre: 4, dureeEstimee: 12, ordre: 2,
  },
  {
    id: 'int012', parcelleId: 'p003', campagneId: 'c003', type: 'fertilisation',
    label: 'NPK fond', datePrevue: d(2024,7,5), dateRealisee: d(2024,7,6),
    statut: 'terminee', produitUtilise: 'NPK 15-15-15', dose: '200 kg/ha',
    coutEstime: 40000, coutReel: 42000, responsableId: 'tech002', mainOeuvre: 2, dureeEstimee: 4, ordre: 3,
  },
  {
    id: 'int013', parcelleId: 'p003', campagneId: 'c003', type: 'sarclage',
    label: 'Sarclage + démariage', datePrevue: d(2024,7,20), dateRealisee: d(2024,7,21),
    statut: 'terminee', observations: 'Démariage à 2 plants par poquet',
    coutEstime: 20000, coutReel: 20000, responsableId: 'tech002', mainOeuvre: 5, dureeEstimee: 16, ordre: 4,
  },
  {
    id: 'int014', parcelleId: 'p003', campagneId: 'c003', type: 'fertilisation',
    label: 'Urée montaison', datePrevue: d(2024,8,4), dateRealisee: d(2024,8,5),
    statut: 'terminee', produitUtilise: 'Urée 46%', dose: '100 kg/ha',
    coutEstime: 25000, coutReel: 25000, responsableId: 'tech002', mainOeuvre: 2, dureeEstimee: 4, ordre: 5,
  },
  {
    id: 'int015', parcelleId: 'p003', campagneId: 'c003', type: 'traitement_phyto',
    label: 'Traitement légionnaire', datePrevue: d(2024,8,9), dateRealisee: d(2024,8,10),
    statut: 'terminee', produitUtilise: 'Emamectine', dose: '0.5 L/ha',
    observations: 'Attaque chenille légionnaire détectée',
    coutEstime: 15000, coutReel: 18000, responsableId: 'tech002', mainOeuvre: 2, dureeEstimee: 4, ordre: 6,
  },
  {
    id: 'int016', parcelleId: 'p003', campagneId: 'c003', type: 'recolte',
    label: 'Récolte', datePrevue: d(2024,10,13),
    statut: 'en_cours', observations: 'Récolte en cours, épis secs',
    coutEstime: 60000, responsableId: 'tech002', mainOeuvre: 6, dureeEstimee: 40, ordre: 7,
  },

  // ═══ p006 — Oignon Niayes, campagne c006 (repiquage 20 oct 2024) ═══
  {
    id: 'int017', parcelleId: 'p006', campagneId: 'c006', type: 'preparation_sol',
    label: 'Préparation planches', datePrevue: d(2024,10,10), dateRealisee: d(2024,10,11),
    statut: 'terminee', observations: 'Planches surélevées + fumure organique 5t/ha',
    coutEstime: 45000, coutReel: 48000, responsableId: 'tech002', mainOeuvre: 4, dureeEstimee: 24, ordre: 1,
  },
  {
    id: 'int018', parcelleId: 'p006', campagneId: 'c006', type: 'semis',
    label: 'Repiquage', datePrevue: d(2024,10,20), dateRealisee: d(2024,10,20),
    statut: 'terminee', observations: 'Violet de Galmi, écartement 15x10cm',
    coutEstime: 30000, coutReel: 32000, responsableId: 'tech002', mainOeuvre: 6, dureeEstimee: 20, ordre: 2,
  },
  {
    id: 'int019', parcelleId: 'p006', campagneId: 'c006', type: 'irrigation',
    label: 'Irrigation régulière', datePrevue: d(2024,10,21), dateRealisee: d(2024,10,21),
    statut: 'terminee', observations: 'Arrosage chaque 2 jours',
    coutEstime: 35000, coutReel: 33000, responsableId: 'tech002', mainOeuvre: 2, dureeEstimee: 8, ordre: 3,
  },
  {
    id: 'int020', parcelleId: 'p006', campagneId: 'c006', type: 'fertilisation',
    label: 'NPK + urée', datePrevue: d(2024,11,4), dateRealisee: d(2024,11,5),
    statut: 'terminee', produitUtilise: 'NPK + Urée', dose: '200 kg/ha',
    coutEstime: 40000, coutReel: 40000, responsableId: 'tech002', mainOeuvre: 2, dureeEstimee: 4, ordre: 4,
  },
  {
    id: 'int021', parcelleId: 'p006', campagneId: 'c006', type: 'sarclage',
    label: 'Sarclage + binage', datePrevue: d(2024,11,10),
    statut: 'en_cours',
    coutEstime: 15000, responsableId: 'tech002', mainOeuvre: 3, dureeEstimee: 12, ordre: 5,
  },
  {
    id: 'int022', parcelleId: 'p006', campagneId: 'c006', type: 'traitement_phyto',
    label: 'Fongicide mildiou', datePrevue: d(2024,11,19),
    statut: 'planifiee', produitUtilise: 'Mancozèbe', dose: '2.5 kg/ha',
    coutEstime: 18000, responsableId: 'tech002', mainOeuvre: 2, dureeEstimee: 4, ordre: 6,
  },
  {
    id: 'int023', parcelleId: 'p006', campagneId: 'c006', type: 'recolte',
    label: 'Récolte + séchage', datePrevue: d(2025,2,17),
    statut: 'planifiee',
    coutEstime: 55000, responsableId: 'tech002', mainOeuvre: 6, dureeEstimee: 40, ordre: 7,
  },
];
