import { Router } from "express";
const router = Router();

import { createQuiz, getQuiz, participateQuiz, deleteQuiz } from "../../controllers/v1/quiz.js";

router.route("/").get(getQuiz).post(createQuiz);
router.route("/:id").delete(deleteQuiz)
router.route("/:id/participate").post(participateQuiz);

export default router;