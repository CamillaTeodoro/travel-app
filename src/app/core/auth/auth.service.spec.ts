import { TestBed } from '@angular/core/testing';
import type { User, UserCredential } from '@angular/fire/auth';
import { Subject } from 'rxjs';

import { AuthService } from './auth.service';
import { FirebaseAuthAdapter } from './firebase-auth.adapter';
import { UserProfileService } from './user-profile.service';

describe('AuthService', () => {
  let service: AuthService;
  let adapter: jasmine.SpyObj<FirebaseAuthAdapter>;
  let profiles: jasmine.SpyObj<UserProfileService>;
  let authState$: Subject<User | null>;

  const fakeUser = { uid: 'user-1', isAnonymous: false } as User;
  const fakeCredential = { user: fakeUser } as UserCredential;

  beforeEach(() => {
    authState$ = new Subject<User | null>();
    adapter = jasmine.createSpyObj<FirebaseAuthAdapter>(
      'FirebaseAuthAdapter',
      ['signInWithEmail', 'signUpWithEmail', 'signInWithGoogle', 'signInAnonymously', 'signOut'],
      { authState$: authState$.asObservable() },
    );
    profiles = jasmine.createSpyObj<UserProfileService>('UserProfileService', ['ensureProfile']);
    profiles.ensureProfile.and.resolveTo();

    TestBed.configureTestingModule({
      providers: [
        { provide: FirebaseAuthAdapter, useValue: adapter },
        { provide: UserProfileService, useValue: profiles },
      ],
    });
    service = TestBed.inject(AuthService);
  });

  it('inicia com usuário indefinido (estado ainda não resolvido)', () => {
    expect(service.user()).toBeUndefined();
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('reflete o estado de auth no signal user', () => {
    authState$.next(fakeUser);
    expect(service.user()).toBe(fakeUser);
    expect(service.isAuthenticated()).toBeTrue();

    authState$.next(null);
    expect(service.user()).toBeNull();
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('login com e-mail delega ao adapter e garante o perfil', async () => {
    adapter.signInWithEmail.and.resolveTo(fakeCredential);

    const user = await service.signInWithEmail('a@b.com', 'secret123');

    expect(adapter.signInWithEmail).toHaveBeenCalledWith('a@b.com', 'secret123');
    expect(profiles.ensureProfile).toHaveBeenCalledWith(fakeUser);
    expect(user).toBe(fakeUser);
  });

  it('cadastro com e-mail delega ao adapter e garante o perfil', async () => {
    adapter.signUpWithEmail.and.resolveTo(fakeCredential);

    await service.signUpWithEmail('a@b.com', 'secret123');

    expect(adapter.signUpWithEmail).toHaveBeenCalledWith('a@b.com', 'secret123');
    expect(profiles.ensureProfile).toHaveBeenCalledWith(fakeUser);
  });

  it('login com Google garante o perfil', async () => {
    adapter.signInWithGoogle.and.resolveTo(fakeCredential);

    await service.signInWithGoogle();

    expect(profiles.ensureProfile).toHaveBeenCalledWith(fakeUser);
  });

  it('login anônimo garante o perfil', async () => {
    adapter.signInAnonymously.and.resolveTo(fakeCredential);

    await service.signInAnonymously();

    expect(profiles.ensureProfile).toHaveBeenCalledWith(fakeUser);
  });

  it('propaga erro do adapter sem criar perfil', async () => {
    adapter.signInWithEmail.and.rejectWith({ code: 'auth/invalid-credential' });

    await expectAsync(service.signInWithEmail('a@b.com', 'errada')).toBeRejected();
    expect(profiles.ensureProfile).not.toHaveBeenCalled();
  });

  it('signOut delega ao adapter', async () => {
    adapter.signOut.and.resolveTo();
    await service.signOut();
    expect(adapter.signOut).toHaveBeenCalled();
  });
});
