import { setGlobalOptions } from 'firebase-functions/v2';
import { onCall } from 'firebase-functions/v2/https';

// Região única para todas as functions (mesma usada pelo client em
// src/app/core/firebase/firebase.providers.ts via environment.functionsRegion).
setGlobalOptions({ region: 'southamerica-east1', maxInstances: 10 });

/**
 * Healthcheck do workspace de functions — confirma que build, deploy e
 * emulador estão operacionais desde a Etapa 1.
 *
 * A function real `generateRecommendations` (IA) será implementada na
 * Etapa 4 em src/recommendations/, conforme docs/ARCHITECTURE.md.
 */
export const healthcheck = onCall(() => {
  return { status: 'ok', service: 'travel-app-functions', timestamp: Date.now() };
});
