/**
 * Category controller
 * Includes functions for handling requests that relate to categories
 * - getCategories: Retrieves all categories
 * - createCategories: Creates categories
 */

import { PrismaClient } from '@prisma/client';
import { categoryData } from '../../data/categories.js';
const prisma = new PrismaClient();

const role = 'SUPER_ADMIN_USER';
// Get all categories
const getCategories = async (req, res) => {
  try {
    const records = await prisma.category.findMany();

    // Return a 200 OK response with the categories data
    return res.status(200).json({ data: records });
  } catch {
    // If an error occurs, return a 500 Internal Server Error response with the error message
    return res.status(500).json({
      msg: err.message,
    });
  }
};

// Create categories
const createCategories = async (req, res) => {
  try {
    const { id } = req.user;
    const user = await prisma.user.findUnique({ where: { id: Number(id) } });
    // Check if user is a super admin
    if (user.role !== role) {
      return res.status(403).json({
        msg: 'Not authorized to access this route',
      });
    }
    // Delete existing categories
    await prisma.category.deleteMany();

    // Create new categories using the fetched data
    await prisma.category.createMany({ data: categoryData });
    // Return a 201 Created response indicating successful creation of categories
    return res.status(201).json({
      msg: 'Categories successfully created',
      data: categoryData,
    });
  } catch (err) {
    // If an error occurs, return a 500 Internal Server Error response with the error message

    return res.status(500).json({
      msg: err.message,
    });
  }
};

export { getCategories, createCategories };
