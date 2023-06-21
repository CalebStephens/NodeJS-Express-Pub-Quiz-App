/**
 * User Management Functions
 *
 * This file contains functions for user management, including retrieving user information,
 * retrieving all users, updating user information, and deleting users. These functions
 * implement authentication and authorization checks to ensure the appropriate users can
 * perform the operations. Prisma is used for database operations.
 *
 * Functions:
 * - getUser: Retrieves information about a specific user.
 * - getUsers: Retrieves information about all users.
 * - updateUser: Updates a user's information.
 * - deleteUser: Deletes a user.
 *
 * Each function includes error handling to handle exceptions and return appropriate
 * error responses with error messages.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const role = 'SUPER_ADMIN_USER';

const getUser = async (req, res) => {
  try {
    // Find the user accessing route with the specified ID using Prisma
    const user = await prisma.user.findUnique({
      where: { id: Number(req.user.id) },
    });

    const { id } = req.params;

    // Find the record with the specified ID using Prisma
    const record = await prisma.user.findUnique({ where: { id: Number(id) } });
    // Check if the user ID in the request does not match the ID in the parameters
    if (
      (user.id !== record.id && user.role !== role) ||
      (user.id !== record.id && record.role === role)
    ) {
      return res.status(403).json({
        msg: 'Not authorized to access this route',
      });
    }

    // If no user is found with the specified ID, return a response with a message
    if (!record) {
      return res.status(200).json({ msg: `No User with the id: ${id} found` });
    }

    return res.json({ data: record });
  } catch (err) {
    return res.status(500).json({
      msg: err.message,
    });
  }
};

const getUsers = async (req, res) => {
  try {
    // Get the ID of the current user from the request
    const { id } = req.user;
    // Find the user accessing route with the specified ID using Prisma
    const user = await prisma.user.findUnique({ where: { id: Number(id) } });

    // Check if the user is not a super admin
    if (user.role !== role) {
      return res.status(403).json({
        msg: 'Not authorized to access this route',
      });
    }

    // Find all records using Prisma
    const records = await prisma.user.findMany();

    // If no records are found, return a response with a message
    if (!records) {
      return res.status(200).json({ msg: `No user's found` });
    }

    return res.json({ data: records });
  } catch (err) {
    return res.status(500).json({
      msg: err.message,
    });
  }
};

const updateUser = async (req, res) => {
  try {
    // Extract the ID from the request parameters
    const { id } = req.params;
    // Extract the data from the request body
    const { ...data } = req.body;

    // Find the user record with the specified ID using Prisma
    let record = await prisma.user.findUnique({
      where: { id: Number(id) },
    });

    // If no record is found with the specified ID, return a response with a message
    if (!record) {
      return res.status(200).json({ msg: `No record with the id: ${id} found` });
    }

    // Find the current user using Prisma
    let user = await prisma.user.findUnique({
      where: { id: Number(req.user.id) },
    });

    // Check authorization:
    // - Allow basic and superadmin users to update their own data
    // - Allow superadmin users to update basic users, but not other superadmins
    if (
      (user.id !== record.id && user.role !== role) ||
      (user.id !== record.id && record.role === role)
    ) {
      // Return a 403 status code with an error message if not authorized
      return res.status(403).json({
        msg: 'Not authorized to access this route',
      });
    }

    // Check if the user is trying to change their role
    if (req.body.hasOwnProperty('role') && user.role !== role) {
      return res.status(403).json({
        msg: 'Cannot change role',
      });
    }

    // Update the record with the specified ID using Prisma
    record = await prisma.user.update({
      where: { id: Number(id) },
      data,
    });

    // Return a response with a message and the updated record
    return res.json({
      msg: `${record.username} has been successfully updated`,
      data: record,
    });
  } catch (err) {
    return res.status(500).json({
      msg: err.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    // Find the current user using Prisma
    const user = await prisma.user.findUnique({
      where: { id: Number(req.user.id) },
    });

    // Check if the user is not a super admin
    if (user.role !== role) {
      return res.status(403).json({
        msg: 'Not authorized to access this route',
      });
    }

    // Extract the ID from the request parameters
    const { id } = req.params;
    // Find the user record with the specified ID using Prisma
    const record = await prisma.user.findUnique({
      where: { id: Number(id) },
    });

    // If no record is found with the specified ID, return a response with a message
    if (!record) {
      return res.status(200).json({ msg: `No record with the id: ${id} found` });
    }

    // Check if the record's role is equal 'role' and the current user is not the record owner
    if (record.role === role && user.id !== record.id) {
      return res.status(403).json({
        msg: 'Not authorized to access this route',
      });
    }

    // Delete the user record with the specified ID using Prisma
    await prisma.user.delete({
      where: { id: Number(id) },
    });

    // Return a response with a success message
    return res.json({
      msg: `Record with the id: ${id} successfully deleted`,
    });
  } catch (err) {
    return res.status(500).json({
      msg: err.message,
    });
  }
};

// Export the functions
export { prisma, getUser, getUsers, updateUser, deleteUser };
