interface JwtPayload {
  userId: string;
  email: string;
  isAdmin: boolean;
  exp?: number;
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const base64Payload = token.split('.')[1];
    if (!base64Payload) return null;
    const decoded = window.atob(base64Payload.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(decoded) as JwtPayload;
    if (payload.exp !== undefined && payload.exp * 1000 < Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
