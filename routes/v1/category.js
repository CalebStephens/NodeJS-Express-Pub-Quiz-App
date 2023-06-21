import { Router } from 'express';
const router = Router();

import {
  getCategories,
  createCategories,
} from '../../controllers/v1/category.js';

router.route('/').get(getCategories).post(createCategories);

export default router;
