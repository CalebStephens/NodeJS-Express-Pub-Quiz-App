/**
 * This script is responsible for seeding the database with super admin users.
 * It imports necessary modules and initializes the Prisma client.
 * The `seedSuperAdminUsers` function hashes the passwords of super admin users
 * and deletes any existing super admin users before creating new ones.
 * Finally, it disconnects from the Prisma client and logs the success or failure
 * of the super admin user creation process.
 */
import dotenv from 'dotenv';
import bcryptjs from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { superAdminUser } from '../data/superAdminUsers.js';

const prisma = new PrismaClient();

dotenv.config();

const seedSuperAdminUsers = async () => {
  // Hash the passwords of super admin users
  superAdminUser.forEach((user) => {
    const salt = bcryptjs.genSaltSync();
    const hashedPassword = bcryptjs.hashSync(user.password, salt);
    user.password = hashedPassword;
  });
  // Only delete super admin users, not basic users
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
