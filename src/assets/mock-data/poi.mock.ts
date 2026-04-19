import { PointOfInterest, CarbonEmission } from '../../app/core/models/poi.model';

export const MOCK_POIS: PointOfInterest[] = [
  // ── p001 — Parcelle Walo Nord (Ross Béthio, riz, 12.5 ha) ──
  {
    id: 'poi-p001-village', parcelleId: 'p001', categorie: 'village',
    nom: 'Ross Béthio', distance: 2.3,
    coordonnees: { lat: 16.0600, lng: -14.8150 },
    telephone: '+221 33 963 12 34',
  },
  {
    id: 'poi-p001-marche', parcelleId: 'p001', categorie: 'marche',
    nom: 'Marché Hebdomadaire de Ross Béthio', distance: 2.5,
    coordonnees: { lat: 16.0610, lng: -14.8140 },
    telephone: '+221 77 456 78 90',
    horaires: 'Mercredi et Samedi, 7h-14h',
  },
  {
    id: 'poi-p001-eau', parcelleId: 'p001', categorie: 'source_eau',
    nom: 'Canal irrigué SAED', distance: 0.5,
    coordonnees: { lat: 16.0550, lng: -14.8300 },
    telephone: '+221 33 963 45 67',
    description: 'Canal principal du périmètre irrigué',
  },
  {
    id: 'poi-p001-hopital', parcelleId: 'p001', categorie: 'hopital',
    nom: 'Poste de santé Ross Béthio', distance: 2.8,
    coordonnees: { lat: 16.0620, lng: -14.8120 },
    telephone: '+221 33 963 56 78',
    horaires: 'Lun-Sam 8h-18h',
  },
  {
    id: 'poi-p001-intrants', parcelleId: 'p001', categorie: 'vendeur_intrants',
    nom: 'Agro-Supply Delta', distance: 3.1,
    coordonnees: { lat: 16.0580, lng: -14.8050 },
    telephone: '+221 77 234 56 78',
    email: 'agrosupply.delta@gmail.com',
    siteWeb: 'https://agrosupply-delta.sn',
    horaires: 'Lun-Sam 8h-17h',
  },
  {
    id: 'poi-p001-materiel', parcelleId: 'p001', categorie: 'materiel_agricole',
    nom: 'CUMA Walo Services', distance: 4.2,
    coordonnees: { lat: 16.0700, lng: -14.8000 },
    telephone: '+221 76 890 12 34',
    description: 'Location tracteurs, moissonneuses, motopompes',
    email: 'cuma.walo@orange.sn',
  },

  // ── p002 — Parcelle Fouta B (Podor, riz, 8.3 ha) ──
  {
    id: 'poi-p002-village', parcelleId: 'p002', categorie: 'village',
    nom: 'Podor', distance: 1.8,
    coordonnees: { lat: 16.6550, lng: -14.9500 },
    telephone: '+221 33 965 11 22',
  },
  {
    id: 'poi-p002-marche', parcelleId: 'p002', categorie: 'marche',
    nom: 'Marché central de Podor', distance: 2.0,
    coordonnees: { lat: 16.6560, lng: -14.9480 },
    telephone: '+221 77 321 45 67',
    horaires: 'Tous les jours, 7h-15h',
  },
  {
    id: 'poi-p002-eau', parcelleId: 'p002', categorie: 'source_eau',
    nom: 'Fleuve Sénégal — Prise Podor', distance: 0.8,
    coordonnees: { lat: 16.6550, lng: -14.9620 },
    telephone: '+221 33 965 33 44',
  },
  {
    id: 'poi-p002-hopital', parcelleId: 'p002', categorie: 'hopital',
    nom: 'Centre de santé de Podor', distance: 2.2,
    coordonnees: { lat: 16.6580, lng: -14.9450 },
    telephone: '+221 33 965 55 66',
    horaires: '24h/24',
  },
  {
    id: 'poi-p002-intrants', parcelleId: 'p002', categorie: 'vendeur_intrants',
    nom: 'SenFertil Podor', distance: 2.5,
    coordonnees: { lat: 16.6600, lng: -14.9400 },
    telephone: '+221 77 654 32 10',
    email: 'senfertil.podor@gmail.com',
  },
  {
    id: 'poi-p002-materiel', parcelleId: 'p002', categorie: 'materiel_agricole',
    nom: 'Diallo Équipements Agricoles', distance: 3.0,
    coordonnees: { lat: 16.6620, lng: -14.9380 },
    telephone: '+221 76 111 22 33',
    description: 'Vente et location de matériel agricole',
  },

  // ── p003 — Parcelle Casamance A (Bignona, maïs, 5.7 ha) ──
  {
    id: 'poi-p003-village', parcelleId: 'p003', categorie: 'village',
    nom: 'Bignona', distance: 3.5,
    coordonnees: { lat: 12.5650, lng: -15.5200 },
    telephone: '+221 33 994 12 00',
  },
  {
    id: 'poi-p003-marche', parcelleId: 'p003', categorie: 'marche',
    nom: 'Marché de Bignona', distance: 3.8,
    coordonnees: { lat: 12.5670, lng: -15.5180 },
    telephone: '+221 77 888 99 00',
    horaires: 'Lun-Sam 6h-16h',
  },
  {
    id: 'poi-p003-eau', parcelleId: 'p003', categorie: 'source_eau',
    nom: 'Puits communautaire Diouloulou', distance: 1.2,
    coordonnees: { lat: 12.5600, lng: -15.5350 },
  },
  {
    id: 'poi-p003-hopital', parcelleId: 'p003', categorie: 'hopital',
    nom: 'Hôpital régional de Bignona', distance: 4.0,
    coordonnees: { lat: 12.5680, lng: -15.5150 },
    telephone: '+221 33 994 20 00',
    horaires: '24h/24',
  },
  {
    id: 'poi-p003-intrants', parcelleId: 'p003', categorie: 'vendeur_intrants',
    nom: 'CasaAgri Intrants', distance: 3.6,
    coordonnees: { lat: 12.5660, lng: -15.5190 },
    telephone: '+221 78 456 78 90',
    email: 'casaagri@gmail.com',
  },
  {
    id: 'poi-p003-materiel', parcelleId: 'p003', categorie: 'materiel_agricole',
    nom: 'Sonko Mécanique Agricole', distance: 5.0,
    coordonnees: { lat: 12.5700, lng: -15.5100 },
    telephone: '+221 77 222 33 44',
    description: 'Réparation et location matériel',
  },

  // ── p004 — Parcelle Thiès (Thiès Nones, arachide, 22 ha) ──
  {
    id: 'poi-p004-village', parcelleId: 'p004', categorie: 'village',
    nom: 'Thiès Nones', distance: 1.5,
    coordonnees: { lat: 14.7880, lng: -16.9180 },
    telephone: '+221 33 951 10 00',
  },
  {
    id: 'poi-p004-marche', parcelleId: 'p004', categorie: 'marche',
    nom: 'Marché central de Thiès', distance: 5.0,
    coordonnees: { lat: 14.7950, lng: -16.9260 },
    telephone: '+221 77 555 66 77',
    horaires: 'Tous les jours, 6h-18h',
  },
  {
    id: 'poi-p004-eau', parcelleId: 'p004', categorie: 'source_eau',
    nom: 'Forage SDE Thiès-Nord', distance: 2.0,
    coordonnees: { lat: 14.7900, lng: -16.9200 },
    telephone: '+221 33 951 44 55',
  },
  {
    id: 'poi-p004-hopital', parcelleId: 'p004', categorie: 'hopital',
    nom: 'Hôpital régional de Thiès', distance: 5.5,
    coordonnees: { lat: 14.7960, lng: -16.9300 },
    telephone: '+221 33 951 22 33',
    horaires: '24h/24',
  },
  {
    id: 'poi-p004-intrants', parcelleId: 'p004', categorie: 'vendeur_intrants',
    nom: 'SENCHIM Thiès', distance: 4.5,
    coordonnees: { lat: 14.7940, lng: -16.9250 },
    telephone: '+221 33 951 77 88',
    email: 'senchim.thies@senchim.sn',
    siteWeb: 'https://senchim.sn',
  },
  {
    id: 'poi-p004-materiel', parcelleId: 'p004', categorie: 'materiel_agricole',
    nom: 'SISMAR Thiès', distance: 6.0,
    coordonnees: { lat: 14.8000, lng: -16.9350 },
    telephone: '+221 33 951 88 99',
    description: 'Fabricant et vendeur de matériel agricole',
    siteWeb: 'https://sismar.sn',
  },

  // ── p005 — Parcelle Louga Centre (Louga, mil, 15.8 ha) ──
  {
    id: 'poi-p005-village', parcelleId: 'p005', categorie: 'village',
    nom: 'Louga', distance: 2.0,
    coordonnees: { lat: 15.6250, lng: -16.2200 },
    telephone: '+221 33 967 10 00',
  },
  {
    id: 'poi-p005-marche', parcelleId: 'p005', categorie: 'marche',
    nom: 'Louma de Louga', distance: 2.5,
    coordonnees: { lat: 15.6270, lng: -16.2180 },
    telephone: '+221 77 111 00 99',
    horaires: 'Dimanche, 6h-16h',
  },
  {
    id: 'poi-p005-eau', parcelleId: 'p005', categorie: 'source_eau',
    nom: 'Forage pastoral Louga', distance: 1.5,
    coordonnees: { lat: 15.6200, lng: -16.2300 },
    telephone: '+221 33 967 33 00',
  },
  {
    id: 'poi-p005-hopital', parcelleId: 'p005', categorie: 'hopital',
    nom: 'Hôpital Amadou Sakhir Mbaye', distance: 3.0,
    coordonnees: { lat: 15.6300, lng: -16.2150 },
    telephone: '+221 33 967 22 44',
    horaires: '24h/24',
  },
  {
    id: 'poi-p005-intrants', parcelleId: 'p005', categorie: 'vendeur_intrants',
    nom: 'Agri-Plus Louga', distance: 2.8,
    coordonnees: { lat: 15.6280, lng: -16.2160 },
    telephone: '+221 78 333 44 55',
    email: 'agriplus.louga@gmail.com',
  },
  {
    id: 'poi-p005-materiel', parcelleId: 'p005', categorie: 'materiel_agricole',
    nom: 'Coopérative Ndiambour Équipement', distance: 3.5,
    coordonnees: { lat: 15.6320, lng: -16.2100 },
    telephone: '+221 76 444 55 66',
    description: 'Location semoirs, houes sine, charrettes',
  },

  // ── p006 — Parcelle Niayes B (Mboro, oignon, 3.2 ha) ──
  {
    id: 'poi-p006-village', parcelleId: 'p006', categorie: 'village',
    nom: 'Mboro', distance: 1.0,
    coordonnees: { lat: 14.9320, lng: -16.9680 },
    telephone: '+221 33 957 10 00',
  },
  {
    id: 'poi-p006-marche', parcelleId: 'p006', categorie: 'marche',
    nom: 'Marché maraîcher de Mboro', distance: 1.2,
    coordonnees: { lat: 14.9340, lng: -16.9660 },
    telephone: '+221 77 666 77 88',
    horaires: 'Tous les jours, 5h-14h',
  },
  {
    id: 'poi-p006-eau', parcelleId: 'p006', categorie: 'source_eau',
    nom: 'Nappe des Niayes — Puits ceane', distance: 0.3,
    coordonnees: { lat: 14.9285, lng: -16.9730 },
  },
  {
    id: 'poi-p006-hopital', parcelleId: 'p006', categorie: 'hopital',
    nom: 'Centre de santé Mboro', distance: 1.5,
    coordonnees: { lat: 14.9350, lng: -16.9650 },
    telephone: '+221 33 957 22 00',
    horaires: 'Lun-Sam 8h-20h',
  },
  {
    id: 'poi-p006-intrants', parcelleId: 'p006', categorie: 'vendeur_intrants',
    nom: 'Niayes Agro-Fournisseur', distance: 1.3,
    coordonnees: { lat: 14.9330, lng: -16.9670 },
    telephone: '+221 77 777 88 99',
    email: 'niayes.agro@gmail.com',
  },
  {
    id: 'poi-p006-materiel', parcelleId: 'p006', categorie: 'materiel_agricole',
    nom: 'Ndiaye Location Agricole', distance: 2.0,
    coordonnees: { lat: 14.9380, lng: -16.9620 },
    telephone: '+221 76 555 66 77',
    description: 'Motopompes, goutte-à-goutte, asperseurs',
  },

  // ── p007 — Parcelle Sud Casamance (Ziguinchor, tomate, 2.8 ha) ──
  {
    id: 'poi-p007-village', parcelleId: 'p007', categorie: 'village',
    nom: 'Ziguinchor', distance: 2.5,
    coordonnees: { lat: 12.4850, lng: -15.4750 },
    telephone: '+221 33 991 10 00',
  },
  {
    id: 'poi-p007-marche', parcelleId: 'p007', categorie: 'marche',
    nom: 'Marché Saint-Maur de Ziguinchor', distance: 3.0,
    coordonnees: { lat: 12.4870, lng: -15.4730 },
    telephone: '+221 77 999 00 11',
    horaires: 'Tous les jours, 6h-18h',
  },
  {
    id: 'poi-p007-eau', parcelleId: 'p007', categorie: 'source_eau',
    nom: 'Rivière Casamance', distance: 0.8,
    coordonnees: { lat: 12.4780, lng: -15.4850 },
  },
  {
    id: 'poi-p007-hopital', parcelleId: 'p007', categorie: 'hopital',
    nom: 'Hôpital régional de Ziguinchor', distance: 3.5,
    coordonnees: { lat: 12.4880, lng: -15.4700 },
    telephone: '+221 33 991 22 33',
    horaires: '24h/24',
  },
  {
    id: 'poi-p007-intrants', parcelleId: 'p007', categorie: 'vendeur_intrants',
    nom: 'Casa-Phyto Intrants', distance: 2.8,
    coordonnees: { lat: 12.4860, lng: -15.4740 },
    telephone: '+221 78 888 99 00',
    email: 'casaphyto@gmail.com',
  },
  {
    id: 'poi-p007-materiel', parcelleId: 'p007', categorie: 'materiel_agricole',
    nom: 'GIE Agroservice Zig', distance: 3.2,
    coordonnees: { lat: 12.4900, lng: -15.4680 },
    telephone: '+221 76 000 11 22',
    description: 'Location et vente petit matériel maraîcher',
  },

  // ── p008 — Parcelle Delta Nord (Dagana, riz, 18.4 ha) ──
  {
    id: 'poi-p008-village', parcelleId: 'p008', categorie: 'village',
    nom: 'Dagana', distance: 2.0,
    coordonnees: { lat: 16.5200, lng: -15.4950 },
    telephone: '+221 33 963 50 00',
  },
  {
    id: 'poi-p008-marche', parcelleId: 'p008', categorie: 'marche',
    nom: 'Marché de Dagana', distance: 2.3,
    coordonnees: { lat: 16.5220, lng: -15.4930 },
    telephone: '+221 77 123 45 67',
    horaires: 'Jeudi, 7h-15h',
  },
  {
    id: 'poi-p008-eau', parcelleId: 'p008', categorie: 'source_eau',
    nom: 'Fleuve Sénégal — Station pompage Dagana', distance: 0.6,
    coordonnees: { lat: 16.5170, lng: -15.5050 },
    telephone: '+221 33 963 55 55',
  },
  {
    id: 'poi-p008-hopital', parcelleId: 'p008', categorie: 'hopital',
    nom: 'Centre de santé de Dagana', distance: 2.5,
    coordonnees: { lat: 16.5230, lng: -15.4920 },
    telephone: '+221 33 963 60 00',
    horaires: '24h/24',
  },
  {
    id: 'poi-p008-intrants', parcelleId: 'p008', categorie: 'vendeur_intrants',
    nom: 'Delta Semences & Engrais', distance: 2.8,
    coordonnees: { lat: 16.5240, lng: -15.4900 },
    telephone: '+221 77 345 67 89',
    email: 'delta.semences@gmail.com',
  },
  {
    id: 'poi-p008-materiel', parcelleId: 'p008', categorie: 'materiel_agricole',
    nom: 'SAED Location Matériel', distance: 3.5,
    coordonnees: { lat: 16.5260, lng: -15.4880 },
    telephone: '+221 33 963 70 00',
    description: 'Tracteurs, moissonneuses-batteuses, planeurs',
    siteWeb: 'https://saed.sn',
  },

  // ── p009 — Parcelle Sénégal Oriental (Tambacounda, arachide, 10.5 ha) ──
  {
    id: 'poi-p009-village', parcelleId: 'p009', categorie: 'village',
    nom: 'Tambacounda', distance: 4.0,
    coordonnees: { lat: 13.7750, lng: -13.6600 },
    telephone: '+221 33 981 10 00',
  },
  {
    id: 'poi-p009-marche', parcelleId: 'p009', categorie: 'marche',
    nom: 'Grand marché de Tambacounda', distance: 4.5,
    coordonnees: { lat: 13.7770, lng: -13.6580 },
    telephone: '+221 77 444 55 66',
    horaires: 'Tous les jours, 6h-17h',
  },
  {
    id: 'poi-p009-eau', parcelleId: 'p009', categorie: 'source_eau',
    nom: 'Forage villageois Sinthiou', distance: 1.5,
    coordonnees: { lat: 13.7720, lng: -13.6700 },
  },
  {
    id: 'poi-p009-hopital', parcelleId: 'p009', categorie: 'hopital',
    nom: 'Hôpital régional de Tambacounda', distance: 5.0,
    coordonnees: { lat: 13.7780, lng: -13.6550 },
    telephone: '+221 33 981 22 00',
    horaires: '24h/24',
  },
  {
    id: 'poi-p009-intrants', parcelleId: 'p009', categorie: 'vendeur_intrants',
    nom: 'Tamba Agro Service', distance: 4.2,
    coordonnees: { lat: 13.7760, lng: -13.6590 },
    telephone: '+221 78 222 33 44',
    email: 'tamba.agro@gmail.com',
  },
  {
    id: 'poi-p009-materiel', parcelleId: 'p009', categorie: 'materiel_agricole',
    nom: 'Coopérative Orientale Mécanisation', distance: 5.5,
    coordonnees: { lat: 13.7800, lng: -13.6500 },
    telephone: '+221 76 333 44 55',
    description: 'Location semoirs, houes, bœufs de trait',
  },

  // ── p010 — Parcelle Niayes C (Potou, oignon, 1.8 ha) ──
  {
    id: 'poi-p010-village', parcelleId: 'p010', categorie: 'village',
    nom: 'Potou', distance: 0.8,
    coordonnees: { lat: 15.0380, lng: -16.9440 },
    telephone: '+221 33 957 30 00',
  },
  {
    id: 'poi-p010-marche', parcelleId: 'p010', categorie: 'marche',
    nom: 'Louma de Potou', distance: 1.0,
    coordonnees: { lat: 15.0390, lng: -16.9430 },
    telephone: '+221 77 555 44 33',
    horaires: 'Mardi, 6h-14h',
  },
  {
    id: 'poi-p010-eau', parcelleId: 'p010', categorie: 'source_eau',
    nom: 'Ceane Niayes Potou', distance: 0.2,
    coordonnees: { lat: 15.0345, lng: -16.9490 },
  },
  {
    id: 'poi-p010-hopital', parcelleId: 'p010', categorie: 'hopital',
    nom: 'Poste de santé Potou', distance: 1.2,
    coordonnees: { lat: 15.0400, lng: -16.9420 },
    telephone: '+221 33 957 35 00',
    horaires: 'Lun-Sam 8h-17h',
  },
  {
    id: 'poi-p010-intrants', parcelleId: 'p010', categorie: 'vendeur_intrants',
    nom: 'Ndiaye Semences Potou', distance: 1.1,
    coordonnees: { lat: 15.0395, lng: -16.9425 },
    telephone: '+221 77 666 55 44',
  },
  {
    id: 'poi-p010-materiel', parcelleId: 'p010', categorie: 'materiel_agricole',
    nom: 'Fall Irrigation Niayes', distance: 1.8,
    coordonnees: { lat: 15.0420, lng: -16.9400 },
    telephone: '+221 76 777 88 99',
    description: 'Systèmes goutte-à-goutte, motopompes',
  },

  // ── p011 — Parcelle Matam Est (Matam, mil, 8 ha) ──
  {
    id: 'poi-p011-village', parcelleId: 'p011', categorie: 'village',
    nom: 'Matam', distance: 3.0,
    coordonnees: { lat: 15.6600, lng: -13.2500 },
    telephone: '+221 33 966 10 00',
  },
  {
    id: 'poi-p011-marche', parcelleId: 'p011', categorie: 'marche',
    nom: 'Marché de Matam', distance: 3.3,
    coordonnees: { lat: 15.6620, lng: -13.2480 },
    telephone: '+221 77 888 77 66',
    horaires: 'Lun-Sam 7h-16h',
  },
  {
    id: 'poi-p011-eau', parcelleId: 'p011', categorie: 'source_eau',
    nom: 'Fleuve Sénégal — Matam', distance: 1.0,
    coordonnees: { lat: 15.6570, lng: -13.2600 },
  },
  {
    id: 'poi-p011-hopital', parcelleId: 'p011', categorie: 'hopital',
    nom: 'Centre de santé de Matam', distance: 3.5,
    coordonnees: { lat: 15.6630, lng: -13.2470 },
    telephone: '+221 33 966 22 00',
    horaires: '24h/24',
  },
  {
    id: 'poi-p011-intrants', parcelleId: 'p011', categorie: 'vendeur_intrants',
    nom: 'Matam Agri Fourniture', distance: 3.2,
    coordonnees: { lat: 15.6610, lng: -13.2490 },
    telephone: '+221 78 444 33 22',
    email: 'matam.agri@gmail.com',
  },
  {
    id: 'poi-p011-materiel', parcelleId: 'p011', categorie: 'materiel_agricole',
    nom: 'GIE Futa Mécanisation', distance: 4.0,
    coordonnees: { lat: 15.6650, lng: -13.2450 },
    telephone: '+221 76 999 00 11',
    description: 'Location matériel de labour et récolte',
  },

  // ── p012 — Parcelle Kayar Maraîchage (Kayar, tomate, 2 ha) ──
  {
    id: 'poi-p012-village', parcelleId: 'p012', categorie: 'village',
    nom: 'Kayar', distance: 0.8,
    coordonnees: { lat: 14.9230, lng: -17.1130 },
    telephone: '+221 33 836 10 00',
  },
  {
    id: 'poi-p012-marche', parcelleId: 'p012', categorie: 'marche',
    nom: 'Marché aux poissons et légumes de Kayar', distance: 1.0,
    coordonnees: { lat: 14.9250, lng: -17.1120 },
    telephone: '+221 77 100 20 30',
    horaires: 'Tous les jours, 5h-13h',
  },
  {
    id: 'poi-p012-eau', parcelleId: 'p012', categorie: 'source_eau',
    nom: 'Forage SDE Kayar', distance: 0.5,
    coordonnees: { lat: 14.9200, lng: -17.1180 },
    telephone: '+221 33 836 15 00',
  },
  {
    id: 'poi-p012-hopital', parcelleId: 'p012', categorie: 'hopital',
    nom: 'Poste de santé Kayar', distance: 1.2,
    coordonnees: { lat: 14.9260, lng: -17.1100 },
    telephone: '+221 33 836 20 00',
    horaires: 'Lun-Sam 8h-18h',
  },
  {
    id: 'poi-p012-intrants', parcelleId: 'p012', categorie: 'vendeur_intrants',
    nom: 'Kayar Phyto Service', distance: 1.0,
    coordonnees: { lat: 14.9240, lng: -17.1125 },
    telephone: '+221 77 200 30 40',
    email: 'kayar.phyto@gmail.com',
  },
  {
    id: 'poi-p012-materiel', parcelleId: 'p012', categorie: 'materiel_agricole',
    nom: 'Sow Matériel Maraîcher', distance: 1.5,
    coordonnees: { lat: 14.9270, lng: -17.1080 },
    telephone: '+221 76 300 40 50',
    description: 'Asperseurs, tuyaux, serres tunnels',
  },

  // ── p013 — Parcelle Kaffrine Sud (Kaffrine, arachide, 18 ha) ──
  {
    id: 'poi-p013-village', parcelleId: 'p013', categorie: 'village',
    nom: 'Kaffrine', distance: 3.0,
    coordonnees: { lat: 14.1100, lng: -15.5450 },
    telephone: '+221 33 946 10 00',
  },
  {
    id: 'poi-p013-marche', parcelleId: 'p013', categorie: 'marche',
    nom: 'Grand marché de Kaffrine', distance: 3.5,
    coordonnees: { lat: 14.1120, lng: -15.5430 },
    telephone: '+221 77 700 80 90',
    horaires: 'Lun-Sam 7h-17h',
  },
  {
    id: 'poi-p013-eau', parcelleId: 'p013', categorie: 'source_eau',
    nom: 'Forage PEPAM Kaffrine', distance: 1.8,
    coordonnees: { lat: 14.1070, lng: -15.5530 },
    telephone: '+221 33 946 33 00',
  },
  {
    id: 'poi-p013-hopital', parcelleId: 'p013', categorie: 'hopital',
    nom: 'Hôpital de Kaffrine', distance: 4.0,
    coordonnees: { lat: 14.1130, lng: -15.5420 },
    telephone: '+221 33 946 22 00',
    horaires: '24h/24',
  },
  {
    id: 'poi-p013-intrants', parcelleId: 'p013', categorie: 'vendeur_intrants',
    nom: 'Saloum Agri Intrants', distance: 3.2,
    coordonnees: { lat: 14.1110, lng: -15.5440 },
    telephone: '+221 78 600 70 80',
    email: 'saloum.agri@gmail.com',
  },
  {
    id: 'poi-p013-materiel', parcelleId: 'p013', categorie: 'materiel_agricole',
    nom: 'Coopérative Ndoucoumane Matériel', distance: 4.5,
    coordonnees: { lat: 14.1150, lng: -15.5400 },
    telephone: '+221 76 800 90 00',
    description: 'Semoirs, houes sine, charrues, charrettes',
  },
];

// ── Émissions carbone mock ──
// Estimations : riz=50, tomate=35, oignon=30, mais=25, mil=15, arachide=12 (kg CO2/ha)
// Seuils : <20=faible, 20-40=moyen, >40=élevé

export const MOCK_CARBON_EMISSIONS: CarbonEmission[] = [
  { parcelleId: 'p001', emissionKgCO2: 625,  emissionParHa: 50, categorie: 'eleve' },    // riz 12.5ha
  { parcelleId: 'p002', emissionKgCO2: 415,  emissionParHa: 50, categorie: 'eleve' },    // riz 8.3ha
  { parcelleId: 'p003', emissionKgCO2: 142,  emissionParHa: 25, categorie: 'moyen' },    // maïs 5.7ha
  { parcelleId: 'p004', emissionKgCO2: 264,  emissionParHa: 12, categorie: 'faible' },   // arachide 22ha
  { parcelleId: 'p005', emissionKgCO2: 237,  emissionParHa: 15, categorie: 'faible' },   // mil 15.8ha
  { parcelleId: 'p006', emissionKgCO2: 96,   emissionParHa: 30, categorie: 'moyen' },    // oignon 3.2ha
  { parcelleId: 'p007', emissionKgCO2: 98,   emissionParHa: 35, categorie: 'moyen' },    // tomate 2.8ha
  { parcelleId: 'p008', emissionKgCO2: 920,  emissionParHa: 50, categorie: 'eleve' },    // riz 18.4ha
  { parcelleId: 'p009', emissionKgCO2: 126,  emissionParHa: 12, categorie: 'faible' },   // arachide 10.5ha
  { parcelleId: 'p010', emissionKgCO2: 54,   emissionParHa: 30, categorie: 'moyen' },    // oignon 1.8ha
  { parcelleId: 'p011', emissionKgCO2: 120,  emissionParHa: 15, categorie: 'faible' },   // mil 8ha
  { parcelleId: 'p012', emissionKgCO2: 70,   emissionParHa: 35, categorie: 'moyen' },    // tomate 2ha
  { parcelleId: 'p013', emissionKgCO2: 216,  emissionParHa: 12, categorie: 'faible' },   // arachide 18ha
];
