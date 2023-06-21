import dotenv from 'dotenv';
import bcryptjs from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { superAdminUser } from '../data/superAdminUsers.js';

const prisma = new PrismaClient();

dotenv.config();

const seedSuperAdminUsers = async () => {
  // superAdminUsers is an array of objects
  superAdminUser.forEach((user) => {
    const salt = bcryptjs.genSaltSync();
    const hashedPassword = bcryptjs.hashSync(user.password, salt);
    user.password = hashedPassword;
  });
  // Only delete super admin users, not basic users
  // Write the code here
  await prisma.user.deleteMany({ where: { role: 'SUPER_ADMIN_USER' } });

  await prisma.user.createMany({
    data: superAdminUser,
  });
};

seedSuperAdminUsers()
  .then(async () => {
    await prisma.$disconnect();
    console.log('Super admin users successfully created');
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
