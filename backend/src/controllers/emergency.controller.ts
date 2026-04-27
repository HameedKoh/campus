import type { Request, Response } from "express";
import { emergencyService } from "../services/emergency.service";

export const emergencyController = {
  async create(req: Request, res: Response) {
    const payload = await emergencyService.createEmergency(req.user!.sub, req.body);
    res.status(201).json(payload);
  },

  async list(req: Request, res: Response) {
    const payload = await emergencyService.getEmergencies(req.user!.role, req.user!.sub);
    res.status(200).json(payload);
  },

  async acknowledge(req: Request, res: Response) {
    const payload = await emergencyService.acknowledge(req.params.id as string, req.user!.sub);
    res.status(200).json(payload);
  },

  async resolve(req: Request, res: Response) {
    const payload = await emergencyService.resolve(req.params.id as string, req.user!.sub);
    res.status(200).json(payload);
  }
};
