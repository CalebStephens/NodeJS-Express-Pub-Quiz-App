import { Router } from 'express';
import { getQuizScores } from '../../controllers/v1/score.js';

const router = Router();

// Get quiz scores
router.route('/:id').get(getQuizScores);

export default router;
