import { mapAuthError } from './auth-error.mapper';

describe('mapAuthError', () => {
  it('traduz credenciais inválidas', () => {
    expect(mapAuthError({ code: 'auth/invalid-credential' })).toBe('E-mail ou senha incorretos.');
  });

  it('traduz e-mail já cadastrado', () => {
    expect(mapAuthError({ code: 'auth/email-already-in-use' })).toBe(
      'Este e-mail já está cadastrado. Tente entrar.',
    );
  });

  it('traduz senha fraca', () => {
    expect(mapAuthError({ code: 'auth/weak-password' })).toBe(
      'A senha deve ter pelo menos 6 caracteres.',
    );
  });

  it('usa mensagem genérica para códigos desconhecidos', () => {
    expect(mapAuthError({ code: 'auth/alguma-coisa-nova' })).toBe(
      'Não foi possível entrar agora. Tente novamente.',
    );
  });

  it('usa mensagem genérica para erros sem código', () => {
    expect(mapAuthError(new Error('boom'))).toBe('Não foi possível entrar agora. Tente novamente.');
    expect(mapAuthError(undefined)).toBe('Não foi possível entrar agora. Tente novamente.');
  });
});
