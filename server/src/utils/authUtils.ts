import JWT, { JwtPayload } from "jsonwebtoken";

const secret = "@Beer123!";

export interface JWTPayload {
  _id: string;
  username: string;
}

export function createWebToken(user: JWTPayload): string {
  return JWT.sign(user, secret);
}

export function ValidateToken(token: string): JWTPayload {
  return JWT.verify(token, secret) as JWTPayload;
}
