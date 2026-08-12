/**
 * Ambiente de DESENVOLVIMENTO.
 * Com useEmulators=true o app conecta nos Emuladores do Firebase
 * (firebase emulators:start) — nenhum projeto real é necessário.
 */
export const environment = {
  production: false,
  useEmulators: true,
  firebase: {
    apiKey: 'demo-api-key',
    authDomain: 'demo-travelquiz.firebaseapp.com',
    projectId: 'demo-travelquiz',
    storageBucket: 'demo-travelquiz.appspot.com',
    messagingSenderId: '000000000000',
    appId: '1:000000000000:web:demo',
  },
  functionsRegion: 'southamerica-east1',
};
