/** Interfaces pour l'API Sentinel Hub (Sinergise) */

// ── Authentication ──

export interface SentinelHubTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

// ── Catalog API ──

export interface SentinelHubCatalogRequest {
  collections: string[];
  datetime: string;           // ISO 8601 interval: "2024-01-01T00:00:00Z/2024-06-01T00:00:00Z"
  bbox: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
  filter?: string;            // CQL2: "eo:cloud_cover < 30"
  limit?: number;
}

export interface SentinelHubFeature {
  id: string;
  type: 'Feature';
  geometry: {
    type: string;
    coordinates: number[][][];
  };
  properties: {
    datetime: string;         // ISO 8601
    'eo:cloud_cover': number;
    'sentinel:data_coverage': number;
    [key: string]: any;
  };
}

export interface SentinelHubCatalogResponse {
  type: 'FeatureCollection';
  features: SentinelHubFeature[];
  context?: {
    returned: number;
    limit: number;
    matched?: number;
  };
}

// ── Statistical API ──

export interface SentinelHubStatRequest {
  input: {
    data: Array<{
      type: string;
      dataFilter: {
        timeRange: { from: string; to: string };
        maxCloudCoverage?: number;
      };
    }>;
    bounds: {
      geometry: {
        type: string;
        coordinates: number[][][];
      };
    };
  };
  aggregation: {
    timeRange: { from: string; to: string };
    aggregationInterval: { of: string };  // "P1D", "P5D", etc.
    evalscript: string;
  };
}

export interface SentinelHubBandStats {
  min: number;
  max: number;
  mean: number;
  stDev: number;
  sampleCount: number;
  noDataCount: number;
}

export interface SentinelHubStatEntry {
  interval: { from: string; to: string };
  outputs: {
    ndvi: {
      bands: {
        B0: {
          stats: SentinelHubBandStats;
        };
      };
    };
  };
}

export interface SentinelHubStatResponse {
  data: SentinelHubStatEntry[];
}

// ── Evalscripts ──

/** Evalscript NDVI pour l'API Statistical (retourne valeur brute FLOAT32) */
export const NDVI_STATS_EVALSCRIPT = `//VERSION=3
function setup() {
  return {
    input: ["B04", "B08", "SCL"],
    output: [{ id: "ndvi", bands: 1, sampleType: "FLOAT32" }]
  };
}
function evaluatePixel(sample) {
  // Masque nuages via SCL : ombres(3), cirrus moyens(8), nuages hauts(9), cirrus fins(10), neige(11)
  if ([3,8,9,10,11].includes(sample.SCL)) {
    return { ndvi: [NaN] };
  }
  let ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
  return { ndvi: [ndvi] };
}`;

/** Evalscript NDVI pour visualisation WMS (retourne RGBA colorise) */
export const NDVI_VISUAL_EVALSCRIPT = `//VERSION=3
function setup() {
  return {
    input: ["B04", "B08", "SCL"],
    output: { bands: 4 }
  };
}
function evaluatePixel(sample) {
  if ([3,8,9,10,11].includes(sample.SCL)) {
    return [0, 0, 0, 0];
  }
  let ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
  if (ndvi < 0.2) return [0.86, 0.15, 0.15, 1];
  if (ndvi < 0.4) return [0.98, 0.45, 0.09, 1];
  if (ndvi < 0.6) return [0.92, 0.70, 0.03, 1];
  if (ndvi < 0.8) return [0.52, 0.80, 0.09, 1];
  return [0.09, 0.64, 0.29, 1];
}`;
