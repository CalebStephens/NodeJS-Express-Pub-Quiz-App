import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import axios from "axios";

const createQuiz = async (req, res) => {
  const baseURL = "https://opentdb.com/api.php?amount=10&";

  const data = await axios.get(
    `${baseURL}category=${req.body.categoryID}&difficulty=${req.body.difficulty}&type=${req.body.type}`
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
      if(answer == record.questions[index].correctAnswer) {
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
    console.log(score)

    await prisma.userQuestionAnswer.createMany({
      data: comparedAnswers,
    });

    console.log(comparedAnswers);

    const user = await prisma.user.findUnique({
      where: { id: Number(req.user.id) },
    });
    console.log(user);

    await prisma.UserQuizScore.create({
      data: {
        userId: req.user.id,
        quizId: record.id,
        score: score,
      },
    });

    return res.status(200).json({ data: `${user.username} has successfully participated in quiz ${record.name}` });
  } catch (err) {
    return res.status(500).json({
      msg: err.message,
    });
  }
};

export { createQuiz, getQuiz, participateQuiz };
