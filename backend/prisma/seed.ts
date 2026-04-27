import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function upsertUser(name: string, email: string, password: string, role: Role) {
  const passwordHash = await bcrypt.hash(password, 12);

  return prisma.user.upsert({
    where: { email },
    update: {
      name,
      passwordHash,
      role,
      status: "ACTIVE"
    },
    create: {
      name,
      email,
      passwordHash,
      role
    }
  });
}

async function main() {
  const adminEmail = process.env.DEFAULT_ADMIN_EMAIL ?? "admin@campussmartcare.edu";
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD ?? "AdminPass123!";
  const doctorPassword = process.env.DEFAULT_DOCTOR_PASSWORD ?? "DoctorPass123!";

  await upsertUser("Campus SmartCare Admin", adminEmail, adminPassword, Role.ADMIN);
  await upsertUser("Dr. Ada Okafor", "doctor1@campussmartcare.edu", doctorPassword, Role.DOCTOR);
  await upsertUser("Dr. Tunde Yusuf", "doctor2@campussmartcare.edu", doctorPassword, Role.DOCTOR);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
