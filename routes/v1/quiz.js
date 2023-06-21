import { Router } from 'express';
const router = Router();

import {
  createQuiz,
  getAllQuizzes,
  participateQuiz,
  deleteQuiz,
  getDatedQuizzes,
} from '../../controllers/v1/quiz.js';

router.route('/').get(getAllQuizzes).post(createQuiz);
router.route('/dates/:date').get(getDatedQuizzes);
router.route('/:id').delete(deleteQuiz);
router.route('/:id/participate').post(participateQuiz);

export default router;
