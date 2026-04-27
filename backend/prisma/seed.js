"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function upsertUser(name, email, password, role) {
    const passwordHash = await bcryptjs_1.default.hash(password, 12);
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
    await upsertUser("Campus SmartCare Admin", adminEmail, adminPassword, client_1.Role.ADMIN);
    await upsertUser("Dr. Ada Okafor", "doctor1@campussmartcare.edu", doctorPassword, client_1.Role.DOCTOR);
    await upsertUser("Dr. Tunde Yusuf", "doctor2@campussmartcare.edu", doctorPassword, client_1.Role.DOCTOR);
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
