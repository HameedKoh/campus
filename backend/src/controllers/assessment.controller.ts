import type { Request, Response } from "express";
import { assessmentService } from "../services/assessment.service";

export const assessmentController = {
  async create(req: Request, res: Response) {
    const payload = await assessmentService.createAssessment(req.user!.sub, req.body);
    res.status(201).json(payload);
  },

  async mine(req: Request, res: Response) {
    const payload = await assessmentService.getMyAssessments(req.user!.sub);
    res.status(200).json(payload);
  },

  async byId(req: Request, res: Response) {
    const payload = await assessmentService.getAssessmentById(
      { userId: req.user!.sub, role: req.user!.role },
      req.params.id as string
    );
    res.status(200).json(payload);
  }
};
