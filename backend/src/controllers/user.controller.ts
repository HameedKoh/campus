import type { Request, Response } from "express";
import { userService } from "../services/user.service";

export const userController = {
  async me(req: Request, res: Response) {
    const payload = await userService.getCurrentUser(req.user!.sub);
    res.status(200).json(payload);
  }
};
