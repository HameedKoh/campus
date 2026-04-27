import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { authenticate } from "../middleware/authenticate";
import { asyncHandler } from "../utils/async-handler";

export const userRouter = Router();

userRouter.get("/me", authenticate, asyncHandler(userController.me));
