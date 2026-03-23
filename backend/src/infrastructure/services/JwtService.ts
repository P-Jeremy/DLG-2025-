import jwt from 'jsonwebtoken';
import type { IJwtService, JwtPayload } from '../../domain/interfaces/IJwtService';

const TOKEN_EXPIRATION = '1d';

export class JwtService implements IJwtService {
  private get secret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }
    return secret;
  }

  generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.secret, { expiresIn: TOKEN_EXPIRATION });
  }

  verifyToken(token: string): JwtPayload {
    const decoded = jwt.verify(token, this.secret) as JwtPayload;
    return {
      userId: decoded.userId,
      email: decoded.email,
      isAdmin: decoded.isAdmin,
    };
  }
}
