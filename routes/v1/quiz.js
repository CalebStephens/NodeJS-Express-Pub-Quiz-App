import { Router } from 'express';
const router = Router();

import {
  createQuiz,
  getAllQuizzes,
  getFutureQuizzes,
  getPastQuizzes,
  getPresentQuizzes,
  participateQuiz,
  deleteQuiz,
} from '../../controllers/v1/quiz.js';

router.route('/').get(getAllQuizzes).post(createQuiz);
router.route('/future').get(getFutureQuizzes);
router.route('/past').get(getPastQuizzes);
router.route('/present').get(getPresentQuizzes);
router.route('/:id').delete(deleteQuiz);
router.route('/:id/participate').post(participateQuiz);

export default router;
