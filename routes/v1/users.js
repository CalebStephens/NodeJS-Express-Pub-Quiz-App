import { Router } from 'express';
import { getUser, getUsers, updateUser, deleteUser } from '../../controllers/v1/users.js';

const router = Router();

// Import the controller functions for user operations

// Route for getting all users
router.route('/').get(getUsers);

// Route for getting a specific user by ID, updating a user, and deleting a user
router.route('/:id').get(getUser).put(updateUser).delete(deleteUser);

export default router;
