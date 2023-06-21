import { Router } from 'express';
import { seedBasicUsers } from '../../controllers/v1/seedBasicUsers.js';

const router = Router();

// Seed basic users
router.route('/basicUsers').post(seedBasicUsers);

export default router;
