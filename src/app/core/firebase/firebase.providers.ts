import { EnvironmentProviders, Provider } from '@angular/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { connectAuthEmulator, getAuth, provideAuth } from '@angular/fire/auth';
import {
  connectFirestoreEmulator,
  getFirestore,
  provideFirestore,
} from '@angular/fire/firestore';
import {
  connectFunctionsEmulator,
  getFunctions,
  provideFunctions,
} from '@angular/fire/functions';

import { environment } from '../../../environments/environment';

/** Portas padrão definidas em firebase.json — manter em sincronia. */
export const EMULATOR_PORTS = {
  auth: 9099,
  firestore: 8080,
  functions: 5001,
} as const;

/**
 * Providers do Firebase para toda a aplicação.
 * Quando environment.useEmulators=true, conecta nos Emuladores locais
 * em vez de serviços reais — nenhuma credencial de produção é necessária
 * em desenvolvimento.
 */
export function provideFirebase(): (Provider | EnvironmentProviders)[] {
  return [
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => {
      const auth = getAuth();
      if (environment.useEmulators) {
        connectAuthEmulator(auth, `http://localhost:${EMULATOR_PORTS.auth}`, {
          disableWarnings: true,
        });
      }
      return auth;
    }),
    provideFirestore(() => {
      const firestore = getFirestore();
      if (environment.useEmulators) {
        connectFirestoreEmulator(firestore, 'localhost', EMULATOR_PORTS.firestore);
      }
      return firestore;
    }),
    provideFunctions(() => {
      const functions = getFunctions(undefined, environment.functionsRegion);
      if (environment.useEmulators) {
        connectFunctionsEmulator(functions, 'localhost', EMULATOR_PORTS.functions);
      }
      return functions;
    }),
  ];
}
