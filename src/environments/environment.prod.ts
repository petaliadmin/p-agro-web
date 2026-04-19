export const environment = {
  production: true,
  apiUrl: 'https://api.agroassist.sn/api',   // URL production NestJS
  appName: 'Petalia Farm OS',
  version: '1.0.0',
  mock: false,
  mapbox: { token: '' },
  sentinelhub: {
    clientId: '',
    clientSecret: '',
    instanceId: '',
    baseUrl: 'https://services.sentinel-hub.com',
    maxCloudCoverage: 30,
  },
  defaultLang: 'fr',
  timezone: 'Africa/Dakar',
};
