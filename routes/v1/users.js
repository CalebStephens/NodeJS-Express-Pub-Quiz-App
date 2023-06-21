import { Router } from 'express';
const router = Router();

import {
  getUser,
  getUsers,
  updateUser,
  deleteUser,
} from '../../controllers/v1/users.js';

router.route('/').get(getUsers);
// .post(createUsers);
router.route('/:id').get(getUser).put(updateUser).delete(deleteUser);

export default router;
