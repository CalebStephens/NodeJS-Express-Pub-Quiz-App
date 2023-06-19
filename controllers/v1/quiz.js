import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import axios from "axios";
import Joi from "joi";

const quizSchema = Joi.object({
  name: Joi.string()
    .min(5)
    .max(30)
    .regex(/^[a-zA-Z]+$/)
    .required()
    .messages({
      "string.base": "Name must only contain letters",
      "string.empty": "Name is required",
      "string.min": "Name must be at least 5 characters long",
      "string.max": "Name must be at most 30 characters long",
      "string.pattern.base": "Name must only contain letters",
      "any.required": "Name is required",
    }),
  numOfQuestions: Joi.number().valid(10).required().messages({
    "number.base": "Questions must be a number",
    "any.only": "Questions must be exactly 10",
    "any.required": "Questions is required",
  }),
  startDate: Joi.string()
    .pattern(/^\d{4}\/\d{2}\/\d{2}$/)
    .required()
    .messages({
      "string.base": "Start date must be a string",
      "string.pattern.base": "Start date must be in the format YYYY/MM/DD",
      "any.required": "Start date is required",
    }),
  endDate: Joi.string()
    .pattern(/^\d{4}\/\d{2}\/\d{2}$/)
    .required()
    .messages({
      "string.base": "End date must be a string",
      "string.pattern.base": "End date must be in the format YYYY/MM/DD",
      "any.required": "End date is required",
    }),
  categoryID: Joi.number().required().messages({
    "number.base": "Category ID must be a number",
    "any.required": "Category ID is required",
  }),
  type: Joi.string().required().messages({
    "any.required": "Type is required",
  }),
  difficulty: Joi.string().required().messages({
    "any.required": "Difficulty is required",
  }),
});

const role = "SUPER_ADMIN_USER";

const createQuiz = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: Number(req.user.id) },
  });
  if (user.role !== role) {
    return res.status(403).json({
      msg: "Not authorized to access this route",
    });
  }
  const { error } = quizSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      msg: error.details[0].message,
    });
  }

  const todaysDate = new Date().getTime();
  const startDate = new Date(req.body.startDate).getTime();
  const endDate = new Date(req.body.endDate).getTime();
  const diffTime = Math.abs(endDate - startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (startDate < todaysDate) {
    return res.json({
      msg: "Start date cannot be before today's date",
    });
  }

  if (startDate > endDate) {
    return res.json({
      msg: "Start date cannot be greater than end date",
    });
  }
  if (diffDays > 5) {
    return res.json({
      msg: "Quiz duration cannot be longer than five days",
    });
  }

  const baseURL = "https://opentdb.com/api.php?";

  const data = await axios.get(
    `${baseURL}amount=${req.body.numOfQuestions}&category=${req.body.categoryID}&difficulty=${req.body.difficulty}&type=${req.body.type}`
  );
  console.log(data.data.results);
  try {
    await prisma.quiz.create({
      data: {
        categoryId: req.body.categoryID,
        difficulty: req.body.difficulty,
        name: req.body.name,
        type: req.body.type,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        questions: {
          create: data.data.results.map((question) => {
            return {
              question: question.question,
              correctAnswer: question.correct_answer,
              incorrectAnswers: question.incorrect_answers,
            };
          }),
        },
      },
    });
    return res.status(201).json({ msg: "Quiz successfully created" });
  } catch (err) {
    return res.status(500).json({
      msg: err.message,
    });
  }
};

const getQuiz = async (req, res) => {
  try {
    const records = await prisma.quiz.findMany({
      include: {
        questions: true,
      },
    });
    return res.status(200).json({ data: records });
  } catch {
    return res.status(500).json({
      msg: err.message,
    });
  }
};

const participateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await prisma.quiz.findUnique({
      where: { id: Number(id) },
      include: {
        questions: true,
      },
    });
    const answers = req.body.answers;
    let score = 0;
    let isCorrect = false;
    const comparedAnswers = answers.map((answer, index) => {
      console.log("here", record.questions[index].correctAnswer, answer)
      if (answer == record.questions[index].correctAnswer) {
        score++;
        isCorrect = true;
      } else isCorrect = false;

      return {
        userId: req.user.id,
        questionId: record.questions[index].id,
        quizId: record.questions[index].quizId,
        answer: answer,
        isCorrect: isCorrect,
      };
    });

    await prisma.userQuestionAnswer.createMany({
      data: comparedAnswers,
    });

    const user = await prisma.user.findUnique({
      where: { id: Number(req.user.id) },
    });

    await prisma.UserQuizScore.create({
      data: {
        userId: req.user.id,
        quizId: record.id,
        score: score,
      },
    });

    const averageScore = await prisma.UserQuizScore.findMany({
      where: { quizId: record.id },
    });

    const average = averageScore.map((score) => score.score).reduce((a, b) => a + b, 0) / averageScore.length;
    console.log(average)

    return res
      .status(200)
      .json({
        data: `${user.username} has successfully participated in quiz ${record.name}, your score was ${score}/${record.questions.length}. Average score is ${average}`,
      });
  } catch (err) {
    return res.status(500).json({
      msg: err.message,
    });
  }
};

const deleteQuiz = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(req.user.id) },
    });
    if (user.role !== role) {
      return res.status(403).json({
        msg: "Not authorized to access this route",
      });
    }
    const { id } = req.params;

    const record = await prisma.quiz.findUnique({
      where: { id: Number(id) },
    });
    if (!record) {
      return res.status(404).json({
        msg: "Quiz not found",
      });
    }
    await prisma.quiz.delete({
      where: {
        id: Number(id),
      },
    });
    return res.status(200).json({ data: `${record.name} has been deleted` });
  } catch (err) {
    return res.status(500).json({
      msg: err.message,
    });
  }
};

export { createQuiz, getQuiz, participateQuiz, deleteQuiz };
