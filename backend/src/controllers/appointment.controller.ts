import type { Request, Response } from "express";
import { appointmentService } from "../services/appointment.service";

export const appointmentController = {
  async create(req: Request, res: Response) {
    const payload = await appointmentService.createAppointment(req.user!.sub, req.body);
    res.status(201).json(payload);
  },

  async mine(req: Request, res: Response) {
    const payload = await appointmentService.getMyAppointments(req.user!.sub);
    res.status(200).json(payload);
  },

  async queue(req: Request, res: Response) {
    const payload = await appointmentService.getQueue(req.user!.role as "DOCTOR" | "ADMIN", req.user!.sub);
    res.status(200).json(payload);
  },

  async updateStatus(req: Request, res: Response) {
    const payload = await appointmentService.updateStatus(
      { userId: req.user!.sub, role: req.user!.role },
      req.params.id as string,
      req.body
    );
    res.status(200).json(payload);
  },

  async assign(req: Request, res: Response) {
    const payload = await appointmentService.assignDoctor(
      req.user!.sub,
      req.params.id as string,
      req.body.assignedDoctorId
    );
    res.status(200).json(payload);
  }
};
