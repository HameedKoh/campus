import type { Request, Response } from "express";
import { adminService } from "../services/admin.service";

export const adminController = {
  async createStaffAccount(req: Request, res: Response) {
    const payload = await adminService.createStaffAccount(req.user!.sub, req.body);
    res.status(201).json(payload);
  }
};
