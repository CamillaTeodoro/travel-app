/** Traduz códigos de erro do Firebase Auth para mensagens amigáveis em pt-BR. */
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-credential': 'E-mail ou senha incorretos.',
  'auth/invalid-email': 'Informe um e-mail válido.',
  'auth/user-disabled': 'Esta conta foi desativada.',
  'auth/user-not-found': 'E-mail ou senha incorretos.',
  'auth/wrong-password': 'E-mail ou senha incorretos.',
  'auth/email-already-in-use': 'Este e-mail já está cadastrado. Tente entrar.',
  'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres.',
  'auth/too-many-requests': 'Muitas tentativas. Aguarde um momento e tente novamente.',
  'auth/popup-closed-by-user': 'A janela do Google foi fechada antes de concluir.',
  'auth/network-request-failed': 'Falha de conexão. Verifique sua internet.',
};

const FALLBACK_MESSAGE = 'Não foi possível entrar agora. Tente novamente.';

export function mapAuthError(error: unknown): string {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code: unknown }).code)
      : '';
  return AUTH_ERROR_MESSAGES[code] ?? FALLBACK_MESSAGE;
}
