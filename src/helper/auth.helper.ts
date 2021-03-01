import { sign, verify } from 'jsonwebtoken';

export interface TokenPayload {
  user_id: string;
  email: string;
  username: string;
}
class AuthHelper {
  createToken(data: TokenPayload) {
    return sign(data, process.env.TOKEN_SECRET as string);
  }

  verifyToken(token: string) {
    return verify(token, process.env.TOKEN_SECRET as string);
  }
}

export default AuthHelper;
