import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/app-error";
import { verifyAccessToken } from "../utils/jwt";

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return next(new AppError(401, "Authentication required"));
  }

  try {
    const token = header.replace("Bearer ", "").trim();
    req.user = verifyAccessToken(token);
    next();
  } catch (_error) {
    next(new AppError(401, "Invalid or expired access token"));
  }
}
