import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import type { JwtUser } from "../types/auth";

export function signAccessToken(user: JwtUser) {
  return jwt.sign(user, env.JWT_ACCESS_SECRET, {
    subject: user.sub,
    expiresIn: env.ACCESS_TOKEN_EXPIRES_IN as SignOptions["expiresIn"]
  });
}

export function signRefreshToken(user: JwtUser) {
  return jwt.sign(user, env.JWT_REFRESH_SECRET, {
    subject: user.sub,
    expiresIn: `${env.REFRESH_TOKEN_EXPIRES_IN_DAYS}d` as SignOptions["expiresIn"]
  });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtUser;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtUser;
}
