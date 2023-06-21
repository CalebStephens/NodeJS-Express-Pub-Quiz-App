import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const getQuizScores = async (req, res) => {
  try {
    const { id } = req.params;
    const quiz = await prisma.quiz.findUnique({ where: { id: Number(id) } });

    if (!quiz) {
      return res.status(200).json({ msg: `No Quiz with the id: ${id} found` });
    }

    const records = await prisma.userQuizScore.findMany({
      where: {
        quizId: Number(id),
      },
    });

    if (!records) {
      return res
        .status(200)
        .json({ msg: `No scores found for quiz with the id: ${id}` });
    }

    return res.json({ data: records });
  } catch (err) {
    return res.status(500).json({
      msg: err.message,
    });
  }
};
export { getQuizScores };
