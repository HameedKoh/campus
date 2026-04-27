import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { asyncHandler } from "../utils/async-handler";
import { validateRequest } from "../middleware/validate";
import { loginSchema, logoutSchema, refreshSchema, registerStudentSchema } from "../schemas/auth.schema";

export const authRouter = Router();

authRouter.post("/register", validateRequest({ body: registerStudentSchema }), asyncHandler(authController.register));
authRouter.post("/login", validateRequest({ body: loginSchema }), asyncHandler(authController.login));
authRouter.post("/refresh", validateRequest({ body: refreshSchema }), asyncHandler(authController.refresh));
authRouter.post("/logout", validateRequest({ body: logoutSchema }), asyncHandler(authController.logout));
