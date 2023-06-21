import { Router } from 'express';
const router = Router();

import { seedBasicUsers } from '../../controllers/v1/seedBasicUsers.js';

router.route('/basicUsers').post(seedBasicUsers);

export default router;
