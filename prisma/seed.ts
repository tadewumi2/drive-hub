import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  const password = await bcrypt.hash("Instructor1!", 12);

  // Create instructor users
  const instructor1 = await prisma.user.upsert({
    where: { email: "james.wilson@drivehub.com" },
    update: {},
    create: {
      name: "James Wilson",
      email: "james.wilson@drivehub.com",
      password,
      role: "INSTRUCTOR",
      emailVerified: new Date(),
      phone: "+1 (416) 555-0101",
    },
  });

  const instructor2 = await prisma.user.upsert({
    where: { email: "sarah.chen@drivehub.com" },
    update: {},
    create: {
      name: "Sarah Chen",
      email: "sarah.chen@drivehub.com",
      password,
      role: "INSTRUCTOR",
      emailVerified: new Date(),
      phone: "+1 (416) 555-0102",
    },
  });

  const instructor3 = await prisma.user.upsert({
    where: { email: "michael.okonkwo@drivehub.com" },
    update: {},
    create: {
      name: "Michael Okonkwo",
      email: "michael.okonkwo@drivehub.com",
      password,
      role: "INSTRUCTOR",
      emailVerified: new Date(),
      phone: "+1 (416) 555-0103",
    },
  });

  const instructor4 = await prisma.user.upsert({
    where: { email: "emily.martinez@drivehub.com" },
    update: {},
    create: {
      name: "Emily Martinez",
      email: "emily.martinez@drivehub.com",
      password,
      role: "INSTRUCTOR",
      emailVerified: new Date(),
      phone: "+1 (416) 555-0104",
    },
  });

  // Create instructor profiles
  const profiles = [];

  const profile1 = await prisma.instructorProfile.upsert({
    where: { userId: instructor1.id },
    update: {},
    create: {
      userId: instructor1.id,
      bio: "10+ years of teaching experience. Specializing in nervous beginners and highway driving. Patient, calm, and thorough approach to every lesson.",
      carType: "Toyota Corolla 2023",
      location: "Downtown Toronto",
      hourlyRate: 55,
      isActive: true,
    },
  });
  profiles.push(profile1);

  const profile2 = await prisma.instructorProfile.upsert({
    where: { userId: instructor2.id },
    update: {},
    create: {
      userId: instructor2.id,
      bio: "Former driving examiner with 8 years of teaching. I know exactly what examiners look for. High first-time pass rate among my students.",
      carType: "Honda Civic 2024",
      location: "North York",
      hourlyRate: 60,
      isActive: true,
    },
  });
  profiles.push(profile2);

  const profile3 = await prisma.instructorProfile.upsert({
    where: { userId: instructor3.id },
    update: {},
    create: {
      userId: instructor3.id,
      bio: "5 years of professional instruction. Focused on building real-world confidence. Flexible scheduling including evenings and weekends.",
      carType: "Hyundai Elantra 2023",
      location: "Scarborough",
      hourlyRate: 50,
      isActive: true,
    },
  });
  profiles.push(profile3);

  const profile4 = await prisma.instructorProfile.upsert({
    where: { userId: instructor4.id },
    update: {},
    create: {
      userId: instructor4.id,
      bio: "Bilingual instructor (English/Spanish). 7 years experience with a focus on defensive driving techniques and road test preparation.",
      carType: "Toyota Camry 2024",
      location: "Mississauga",
      hourlyRate: 58,
      isActive: true,
    },
  });
  profiles.push(profile4);

  // Availability schedules — clear and recreate for clean data
  type Day =
    | "MONDAY"
    | "TUESDAY"
    | "WEDNESDAY"
    | "THURSDAY"
    | "FRIDAY"
    | "SATURDAY"
    | "SUNDAY";

  async function setAvailability(
    instructorId: string,
    schedule: { days: readonly Day[]; startHour: number; endHour: number }[],
  ) {
    await prisma.availabilityRule.deleteMany({ where: { instructorId } });
    for (const block of schedule) {
      for (const day of block.days) {
        for (let hour = block.startHour; hour < block.endHour; hour++) {
          await prisma.availabilityRule.create({
            data: { instructorId, dayOfWeek: day, startHour: hour, endHour: hour + 1 },
          });
        }
      }
    }
  }

  // James: Mon–Fri 9am–5pm
  await setAvailability(profile1.id, [
    { days: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"], startHour: 9, endHour: 17 },
  ]);

  // Sarah: Mon–Sat 8am–4pm
  await setAvailability(profile2.id, [
    { days: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"], startHour: 8, endHour: 16 },
  ]);

  // Michael: Tue–Sat 10am–7pm
  await setAvailability(profile3.id, [
    { days: ["TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"], startHour: 10, endHour: 19 },
  ]);

  // Emily: Mon, Wed, Fri, Sat 9am–6pm
  await setAvailability(profile4.id, [
    { days: ["MONDAY", "WEDNESDAY", "FRIDAY", "SATURDAY"], startHour: 9, endHour: 18 },
  ]);

  // Create admin user
  const adminPassword = await bcrypt.hash("Admin123!", 12);
  await prisma.user.upsert({
    where: { email: "admin@drivehub.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@drivehub.com",
      password: adminPassword,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });

  // Create super admin user
  const superAdminPassword = await bcrypt.hash("SuperAdmin1!", 12);
  await prisma.user.upsert({
    where: { email: "superadmin@drivehub.com" },
    update: {},
    create: {
      name: "Super Admin",
      email: "superadmin@drivehub.com",
      password: superAdminPassword,
      role: "SUPER_ADMIN" as "ADMIN",
      emailVerified: new Date(),
    },
  });

  console.log("  Created admin user (admin@drivehub.com / Admin123!)");

  console.log("Seeding complete!");
  console.log("Created " + profiles.length + " instructors with availability");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
