import { Router } from 'express';
import {
  createQuiz,
  getAllQuizzes,
  participateQuiz,
  deleteQuiz,
  getDatedQuizzes,
} from '../../controllers/v1/quiz.js';

const router = Router();

// Get all quizzes and create a quiz
router.route('/').get(getAllQuizzes).post(createQuiz);

// Get quizzes based on date
router.route('/dates/:date').get(getDatedQuizzes);

// Delete a quiz by ID
router.route('/:id').delete(deleteQuiz);

// Participate in a quiz by ID
router.route('/:id/participate').post(participateQuiz);

export default router;
