import "dotenv/config";
import { prisma } from "../lib/db";
import bcrypt from "bcryptjs";
const USERS = [
  { email: "organizer1@test.com", password: "Password123!", role: "ORGANIZER" as const },
  { email: "organizer2@test.com", password: "Password123!", role: "ORGANIZER" as const },
  { email: "staff1@test.com", password: "Password123!", role: "STAFF" as const },
  { email: "staff2@test.com", password: "Password123!", role: "STAFF" as const },
  { email: "attendee1@test.com", password: "Password123!", role: "ATTENDEE" as const },
  { email: "attendee2@test.com", password: "Password123!", role: "ATTENDEE" as const },
  { email: "attendee3@test.com", password: "Password123!", role: "ATTENDEE" as const },
  { email: "attendee4@test.com", password: "Password123!", role: "ATTENDEE" as const },
  { email: "attendee5@test.com", password: "Password123!", role: "ATTENDEE" as const },
];

async function seed() {
  const passwordHash = await bcrypt.hash("Password123!", 10);

  for (const { email, role } of USERS) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log(`User ${email} already exists, skipping.`);
      continue;
    }
    await prisma.user.create({
      data: { email, passwordHash, role },
    });
    console.log(`Created user: ${email} (${role}).`);
  }
}

seed()
  .then(() => prisma.$disconnect())
  .catch((e: unknown) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
