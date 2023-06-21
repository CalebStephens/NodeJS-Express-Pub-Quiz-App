/**
 * Quiz Scores API
 *
 * This file contains an API endpoint for retrieving quiz scores from the database.
 * It utilizes Prisma for database operations.
 *
 * Functions:
 * - getQuizScores: Retrieves quiz scores for a specific quiz by its ID.
 *
 * Prisma Client instance and the getQuizScores function are exported for use in other files.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Retrieves quiz scores for a specific quiz by its ID.
 */
const getQuizScores = async (req, res) => {
  try {
    const { id } = req.params;
    // Find the quiz with the specified ID using Prisma
    const quiz = await prisma.quiz.findUnique({ where: { id: Number(id) } });

    // If no quiz is found with the specified ID, return a response with a message
    if (!quiz) {
      return res.status(200).json({ msg: `No Quiz with the id: ${id} found` });
    }

    // Find all user quiz scores for the specified quiz ID using Prisma
    const records = await prisma.userQuizScore.findMany({
      where: {
        quizId: Number(id),
      },
    });

    // If no scores are found for the specified quiz ID, return a response with a message
    if (!records) {
      return res.status(200).json({ msg: `No scores found for quiz with the id: ${id}` });
    }

    return res.json({ data: records });
  } catch (err) {
    return res.status(500).json({
      msg: err.message,
    });
  }
};
export { getQuizScores };
