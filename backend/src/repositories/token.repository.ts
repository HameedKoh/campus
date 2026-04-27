import { prisma } from "../lib/prisma";

export const tokenRepository = {
  create(input: { userId: string; tokenHash: string; expiresAt: Date }) {
    return prisma.refreshToken.create({
      data: input
    });
  },

  findActiveByUser(userId: string) {
    return prisma.refreshToken.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: {
          gt: new Date()
        }
      }
    });
  },

  revokeById(id: string) {
    return prisma.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date() }
    });
  }
};
