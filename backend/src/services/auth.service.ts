import bcrypt from "bcryptjs";
import type { Role } from "@prisma/client";
import { userRepository } from "../repositories/user.repository";
import { tokenRepository } from "../repositories/token.repository";
import { auditService } from "./audit.service";
import { AppError } from "../utils/app-error";
import { encryptSensitiveValue } from "../utils/crypto";
import { hashString } from "../utils/hash";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import type { AuthResponse, JwtUser } from "../types/auth";
import { toSafeUser } from "./user.service";
import { env } from "../config/env";

function buildJwtUser(user: {
  id: string;
  email: string;
  role: Role;
  name: string;
}): JwtUser {
  return {
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.name
  };
}

async function issueTokens(jwtUser: JwtUser) {
  const accessToken = signAccessToken(jwtUser);
  const refreshToken = signRefreshToken(jwtUser);
  const expiresAt = new Date(
    Date.now() + env.REFRESH_TOKEN_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000
  );

  await tokenRepository.create({
    userId: jwtUser.sub,
    tokenHash: hashString(refreshToken),
    expiresAt
  });

  return { accessToken, refreshToken };
}

export const authService = {
  async registerStudent(input: {
    name: string;
    email: string;
    password: string;
    healthProfile?: {
      matricNumber?: string;
      ageRange?: string;
      sex?: "FEMALE" | "MALE" | "OTHER" | "PREFER_NOT_TO_SAY";
      allergies?: string;
      chronicConditions?: string;
    };
  }): Promise<AuthResponse> {
    const existingUser = await userRepository.findByEmail(input.email);

    if (existingUser) {
      throw new AppError(409, "An account with that email already exists");
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await userRepository.createStudent({
      name: input.name,
      email: input.email,
      passwordHash,
      healthProfile: input.healthProfile
        ? {
            matricNumber: input.healthProfile.matricNumber,
            ageRange: input.healthProfile.ageRange,
            sex: input.healthProfile.sex,
            allergiesEncrypted: encryptSensitiveValue(input.healthProfile.allergies),
            chronicConditionsEncrypted: encryptSensitiveValue(
              input.healthProfile.chronicConditions
            )
          }
        : undefined
    });

    await auditService.log({
      actorId: user.id,
      action: "student.registered",
      entityType: "User",
      entityId: user.id,
      metadata: { role: user.role }
    });

    const jwtUser = buildJwtUser(user);
    const tokens = await issueTokens(jwtUser);

    return {
      user: toSafeUser(user),
      ...tokens
    };
  },

  async login(input: { email: string; password: string }): Promise<AuthResponse> {
    const user = await userRepository.findByEmail(input.email);

    if (!user || user.status !== "ACTIVE") {
      throw new AppError(401, "Invalid email or password");
    }

    const matches = await bcrypt.compare(input.password, user.passwordHash);
    if (!matches) {
      throw new AppError(401, "Invalid email or password");
    }

    await auditService.log({
      actorId: user.id,
      action: "auth.login",
      entityType: "User",
      entityId: user.id
    });

    const tokens = await issueTokens(buildJwtUser(user));

    return {
      user: toSafeUser(user),
      ...tokens
    };
  },

  async refresh(refreshToken: string): Promise<AuthResponse> {
    const payload = verifyRefreshToken(refreshToken);
    const user = await userRepository.findById(payload.sub);

    if (!user || user.status !== "ACTIVE") {
      throw new AppError(401, "Refresh token is no longer valid");
    }

    const validTokens = await tokenRepository.findActiveByUser(user.id);
    const matchedToken = validTokens.find((token) => token.tokenHash === hashString(refreshToken));

    if (!matchedToken) {
      throw new AppError(401, "Refresh token is no longer valid");
    }

    await tokenRepository.revokeById(matchedToken.id);

    const tokens = await issueTokens(buildJwtUser(user));

    return {
      user: toSafeUser(user),
      ...tokens
    };
  },

  async logout(refreshToken: string) {
    const payload = verifyRefreshToken(refreshToken);
    const validTokens = await tokenRepository.findActiveByUser(payload.sub);
    const matchedToken = validTokens.find((token) => token.tokenHash === hashString(refreshToken));

    if (matchedToken) {
      await tokenRepository.revokeById(matchedToken.id);
    }

    await auditService.log({
      actorId: payload.sub,
      action: "auth.logout",
      entityType: "RefreshToken",
      entityId: matchedToken?.id
    });

    return { success: true };
  }
};
