import { Router } from "express";
const router = Router();

import { createQuiz, getAllQuizzes, getFutureQuizzes, participateQuiz, deleteQuiz } from "../../controllers/v1/quiz.js";

router.route("/").get(getAllQuizzes).post(createQuiz);
router.route("/future").get(getFutureQuizzes)
// router.route("/past").get(getPastQuizzes)late
router.route("/:id").delete(deleteQuiz)
router.route("/:id/participate").post(participateQuiz);

export default router;