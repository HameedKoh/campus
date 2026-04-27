import type { NextFunction, Request, Response } from "express";
import type { AppRole } from "../types/auth";
import { AppError } from "../utils/app-error";

export function requireRole(...roles: AppRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, "Authentication required"));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, "You do not have permission to perform this action"));
    }

    next();
  };
}
