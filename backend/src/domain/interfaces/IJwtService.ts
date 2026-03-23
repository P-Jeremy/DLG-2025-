export interface JwtPayload {
  userId: string;
  email: string;
  isAdmin: boolean;
}

export interface IJwtService {
  generateToken(payload: JwtPayload): string;
  verifyToken(token: string): JwtPayload;
}
