import { Router } from 'express';
const router = Router();

import { getQuizScores } from '../../controllers/v1/score.js';

router.route('/:id').get(getQuizScores);

export default router;
