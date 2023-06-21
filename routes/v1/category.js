import { Router } from 'express';
import { getCategories, createCategories } from '../../controllers/v1/category.js';

const router = Router();

// Get all categories and create categories
router.route('/').get(getCategories).post(createCategories);

export default router;
