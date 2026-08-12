/**
 * Ambiente de PRODUÇÃO.
 * Substitua os placeholders pelos valores do console do Firebase
 * (Configurações do projeto → Seus apps → SDK do Firebase).
 * As chaves de web app do Firebase não são segredos, mas mantenha
 * as regras de segurança do Firestore sempre restritivas.
 */
export const environment = {
  production: true,
  useEmulators: false,
  firebase: {
    apiKey: 'YOUR_FIREBASE_API_KEY',
    authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
    projectId: 'YOUR_PROJECT_ID',
    storageBucket: 'YOUR_PROJECT_ID.appspot.com',
    messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
    appId: 'YOUR_APP_ID',
  },
  functionsRegion: 'southamerica-east1',
};
