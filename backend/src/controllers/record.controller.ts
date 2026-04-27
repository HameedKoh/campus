import type { Request, Response } from "express";
import { recordService } from "../services/record.service";

export const recordController = {
  async mine(req: Request, res: Response) {
    const payload = await recordService.getMyRecords(req.user!.sub);
    res.status(200).json(payload);
  },

  async studentRecords(req: Request, res: Response) {
    const payload = await recordService.getStudentRecords(
      req.params.studentId as string,
      req.user!.sub
    );
    res.status(200).json(payload);
  },

  async createEntry(req: Request, res: Response) {
    const payload = await recordService.createRecordEntry(
      req.params.studentId as string,
      req.user!.sub,
      req.body
    );
    res.status(201).json(payload);
  }
};
