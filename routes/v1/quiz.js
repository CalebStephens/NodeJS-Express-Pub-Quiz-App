import { Router } from "express";
const router = Router();

import { createQuiz, getQuiz, participateQuiz } from "../../controllers/v1/quiz.js";

router.route("/").get(getQuiz).post(createQuiz);
router.route("/:id/participate").post(participateQuiz);

export default router;