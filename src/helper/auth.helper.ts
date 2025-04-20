import { NextFunction } from './api.wrapper';
import { sign, verify } from 'jsonwebtoken';
import { Request, Response } from '../helper/api.wrapper';
import { TOKEN_SECRET } from '../Config';

export interface TokenPayload {
  user_id: string;
  email: string;
  username: string;
}

class AuthHelper {
  createToken(data: TokenPayload): string {
    return sign(data, TOKEN_SECRET as string);
  }

  verifyToken(token: string): TokenPayload | string {
    const decoded = verify(token, TOKEN_SECRET as string);
    if (typeof decoded === 'object' && decoded !== null) {
      return decoded as TokenPayload;
    }
    return decoded;
  }

  decodeToken(token: string): TokenPayload | null {
    try {
      const decoded = verify(token, TOKEN_SECRET as string, {
        complete: true,
      });
      if (decoded && typeof decoded === 'object' && decoded.payload) {
        return decoded.payload as TokenPayload;
      }
    } catch (error) {
      console.error('Error decoding token:', error);
    }
    return null;
  }
  /**
   * Middleware to authenticate requests using JWT
   * @param req
   * @param res
   * @param next
   */
  async authenticate(req: Request, res: Response, next: NextFunction): Promise<any> {
    const token = req.headers['authorization'];
    if (!token) {
      return res.status(400).json({ message: 'No token provided' });
    }

    try {
      const decoded = this.verifyToken(token);
      if (typeof decoded === 'string') {
        return res.status(401).json({ message: 'Invalid token' });
      }

      req.user = decoded as TokenPayload;
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({ message: 'Invalid token' });
    }
  }
}

export default AuthHelper;
