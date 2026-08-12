import { EMULATOR_PORTS, provideFirebase } from './firebase.providers';

describe('firebase.providers', () => {
  it('deve fornecer app, auth, firestore e functions', () => {
    const providers = provideFirebase();
    expect(providers.length).toBe(4);
  });

  it('deve manter as portas dos emuladores em sincronia com firebase.json', () => {
    expect(EMULATOR_PORTS.auth).toBe(9099);
    expect(EMULATOR_PORTS.firestore).toBe(8080);
    expect(EMULATOR_PORTS.functions).toBe(5001);
  });
});
