export interface RegisterPayload {
  email: string;
  pseudo: string;
  password: string;
  apiKey: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  isAdmin: boolean;
  pseudo: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

async function parseErrorMessage(res: Response): Promise<string> {
  try {
    const body = await res.json() as { message?: string };
    return body.message ?? 'Une erreur est survenue';
  } catch {
    return 'Une erreur est survenue';
  }
}

export async function register(payload: RegisterPayload): Promise<void> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res));
  }
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res));
  }
  return res.json() as Promise<LoginResponse>;
}

export async function forgotPassword(payload: ForgotPasswordPayload): Promise<void> {
  const res = await fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res));
  }
}

export async function resetPassword(payload: ResetPasswordPayload): Promise<void> {
  const res = await fetch('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res));
  }
}

export async function activateAccount(token: string): Promise<void> {
  const res = await fetch(`/api/auth/activate/${token}`);
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res));
  }
}
