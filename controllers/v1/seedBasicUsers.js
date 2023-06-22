/**
 * User Seeding Functions
 *
 * This file contains functions for seeding basic users into the database.
 *  It utilizes Prisma for database operations and Axios for making
 *  HTTP requests to retrieve the user data to be seeded.
 * The functions include authorization checks to ensure that
 *  only super admin users can perform the seeding operation.
 *
 * Functions:
 * - seedBasicUsers: Seeds basic users into the database by retrieving
 *   user data from an external source
 *   and creating multiple user records using Prisma.
 *
 * Prisma Client instance and the seedBasicUsers function are exported for use in other files.
 */
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

const role = 'SUPER_ADMIN_USER';

/**
 * Seeds basic users into the database by retrieving user data from an external source
 * and creating multiple user records using Prisma.
 */
const seedBasicUsers = async (req, res) => {
  try {
    const { id } = req.user;
    const user = await prisma.user.findUnique({ where: { id: Number(id) } });

    // Check if the user is not a super admin
    if (user.role !== role) {
      return res.status(403).json({
        msg: 'Not authorized to access this route',
      });
    }

    // Retrieve user data from an external source using Axios
    const data = await axios.get(
      'https://gist.githubusercontent.com/CalebStephens/227847a99599ea21855d0488123b0cb1/raw/95dc2c022269515b9d7690feb025c922c9201ee2/basicUsers.json'
    );

    data.data.forEach( (user) => {
      const salt = bcryptjs.genSaltSync();
      const hashedPassword = bcryptjs.hashSync(user.password, salt);
      user.password = hashedPassword;
    });

    // Create multiple user records in the database using Prisma
    await prisma.user.createMany({ data: data.data });
    return res.status(201).json({ msg: 'Basic users successfully created', data: data.data });
  } catch (err) {
    return res.status(500).json({
      msg: err.message,
    });
  }
};

export { prisma, seedBasicUsers };
