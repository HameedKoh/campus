import type { Request, Response } from "express";
import { authService } from "../services/auth.service";

export const authController = {
  async register(req: Request, res: Response) {
    const payload = await authService.registerStudent(req.body);
    res.status(201).json(payload);
  },

  async login(req: Request, res: Response) {
    const payload = await authService.login(req.body);
    res.status(200).json(payload);
  },

  async refresh(req: Request, res: Response) {
    const payload = await authService.refresh(req.body.refreshToken);
    res.status(200).json(payload);
  },

  async logout(req: Request, res: Response) {
    const payload = await authService.logout(req.body.refreshToken);
    res.status(200).json(payload);
  }
};
