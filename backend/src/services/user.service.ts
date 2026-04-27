import { decryptSensitiveValue } from "../utils/crypto";
import { AppError } from "../utils/app-error";
import { userRepository } from "../repositories/user.repository";
import type { SafeUser } from "../types/auth";

export function toSafeUser(user: Awaited<ReturnType<typeof userRepository.findById>>): SafeUser {
  if (!user) {
    throw new AppError(404, "User not found");
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt.toISOString(),
    healthProfile: user.healthProfile
      ? {
          matricNumber: user.healthProfile.matricNumber,
          ageRange: user.healthProfile.ageRange,
          sex: user.healthProfile.sex,
          allergies: decryptSensitiveValue(user.healthProfile.allergiesEncrypted),
          chronicConditions: decryptSensitiveValue(
            user.healthProfile.chronicConditionsEncrypted
          )
        }
      : null
  };
}

export const userService = {
  async getCurrentUser(userId: string) {
    const user = await userRepository.findById(userId);
    return toSafeUser(user);
  }
};
