/**
 * Quiz Management API
 *
 * This file contains API endpoints for creating, retrieving, and managing quizzes.
 * It utilizes Prisma for database operations and Joi for input validation.
 *
 * Functions:
 * - createQuiz: Creates a new quiz with the provided data.
 * - getAllQuizzes: Retrieves all quizzes from the database.
 * - participateQuiz: Allows a user to participate in a quiz and calculates their score.
 * - deleteQuiz: Deletes a quiz with the specified ID.
 * - getFutureQuizzes: Retrieves quizzes that are scheduled for the future.
 * - getPastQuizzes: Retrieves quizzes that have already ended.
 * - getPresentQuizzes: Retrieves quizzes that are currently ongoing.
 *
 * Prisma Client instance and the above functions are exported for use in other files.
 */
import { PrismaClient } from '@prisma/client';

import axios from 'axios';
import Joi from 'joi';

const prisma = new PrismaClient();

const quizSchema = Joi.object({
  name: Joi.string()
    .min(5)
    .max(30)
    .regex(/^[a-zA-Z]+$/)
    .required()
    .messages({
      'string.base': 'Name must only contain letters',
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 5 characters long',
      'string.max': 'Name must be at most 30 characters long',
      'string.pattern.base': 'Name must only contain letters',
      'any.required': 'Name is required',
    }),
  numOfQuestions: Joi.number().valid(10).required().messages({
    'number.base': 'Questions must be a number',
    'any.only': 'Questions must be exactly 10',
    'any.required': 'Questions is required',
  }),
  startDate: Joi.string()
    .pattern(/^\d{4}\/\d{2}\/\d{2}$/)
    .required()
    .messages({
      'string.base': 'Start date must be a string',
      'string.pattern.base': 'Start date must be in the format YYYY/MM/DD',
      'any.required': 'Start date is required',
    }),
  endDate: Joi.string()
    .pattern(/^\d{4}\/\d{2}\/\d{2}$/)
    .required()
    .messages({
      'string.base': 'End date must be a string',
      'string.pattern.base': 'End date must be in the format YYYY/MM/DD',
      'any.required': 'End date is required',
    }),
  categoryId: Joi.number().required().messages({
    'number.base': 'Category ID must be a number',
    'any.required': 'Category ID is required',
  }),
  type: Joi.string().required().messages({
    'any.required': 'Type is required',
  }),
  difficulty: Joi.string().required().messages({
    'any.required': 'Difficulty is required',
  }),
});

const role = 'SUPER_ADMIN_USER';

const getDatedQuizzes = async (req, res) => {
  try {
    const records = await prisma.quiz.findMany({
      include: {
        questions: true,
      },
    });

    // Check if the date parameter is set to 'future'
    if (req.params.date === 'future') {
      // Filter quizzes to include only future quizzes
      const futureQuizzes = records.filter((record) => {
        return new Date(record.startDate) > new Date();
      });

      if(!futureQuizzes.length) return await res.status(200).json({
        msg: 'No future quizzes found',
      });

      return await res.status(200).json({
        data: futureQuizzes,
      });
    }
    // Check if the date parameter is set to 'past'
    if (req.params.date === 'past') {
      // Filter quizzes to include only past quizzes
      const pastQuizzes = records.filter((record) => {
        return new Date(record.endDate) < new Date();
      });

      if(!pastQuizzes.length) return await res.status(200).json({
        msg: 'No past quizzes found',
      });

      return await res.status(200).json({
        data: futureQuizzes,
      });
    }
    // Check if the date parameter is set to 'present'
    if (req.params.date === 'present') {
      // Filter quizzes to include only present quizzes
      const presentQuizzes = records.filter((record) => {
        return new Date(record.endDate) < new Date() && new Date(record.startDate) > new Date();
      });

      if(!presentQuizzes.length) return await res.status(200).json({
        msg: 'No present quizzes found',
      });

      return await res.status(200).json({
        data: presentQuizzes,
      });
    }
    return res.status(400).json({
      msg: 'Invalid date, future, past, or present expected',
    });
  } catch (err) {
    console.log(err);
  }
};

/**
 * Create Quiz
 *
 * This function creates a new quiz with the provided data.
 * It performs validation on the request body using the quizSchema.
 * It checks if the user is authorized to create a quiz based on their role.
 * It validates the start and end dates of the quiz.
 * It makes an API request to fetch quiz questions from an external API.
 * It saves the quiz and its questions in the database using Prisma.
 * It returns a response with the success message if the quiz is created successfully.
 * If any error occurs during the process, it returns an error response with the error message.
 */
const createQuiz = async (req, res) => {
  try {
    // Check user authorization based on role
    const user = await prisma.user.findUnique({
      where: { id: Number(req.user.id) },
    });
    if (user.role !== role) {
      return res.status(403).json({
        msg: 'Not authorized to access this route',
      });
    }
    // Validate request body using quizSchema
    const { error } = quizSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        msg: error.details[0].message,
      });
    }

    // Validate start and end dates of the quiz
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
        msg: 'Start date cannot be greater than end date',
      });
    }
    if (diffDays > 5) {
      return res.json({
        msg: 'Quiz duration cannot be longer than five days',
      });
    }

    const baseURL = 'https://opentdb.com/api.php?';
    // Fetch quiz questions from an external API
    const data = await axios.get(
      `${baseURL}amount=${req.body.numOfQuestions}&category=${req.body.categoryId}&difficulty=${req.body.difficulty}&type=${req.body.type}`
    );

    // Save the quiz and its questions in the database using Prisma
    await prisma.quiz.create({
      data: {
        categoryId: req.body.categoryId,
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
    return res.status(201).json({ msg: 'Quiz successfully created' });
  } catch (err) {
    return res.status(500).json({
      msg: err.message,
    });
  }
};

const getAllQuizzes = async (req, res) => {
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

/**
 * Participate in Quiz
 *
 * This function allows a user to participate in a quiz.
 * It retrieves the quiz record from the database based on the provided ID.
 * It checks if the quiz has started and if it has finished,
 *  returning error responses if applicable.
 * It validates the number of answers provided by the user,
 *  ensuring it matches the number of questions in the quiz.
 * It compares the user's answers with the correct answers and calculates the score.
 * It creates records for the user's answers, user participation in the quiz,
 *  and user quiz score in the database.
 * It calculates the average score for the quiz.
 * Finally, it returns a response with the participation details,
 *  including the user's score and the average score.
 * If any error occurs during the process, it returns an error
 *  response with the error message.
 */
const participateQuiz = async (req, res) => {
  try {
    // Retrieve the quiz ID from the request parameters
    const { id } = req.params;
    // Retrieve the quiz record from the database along with its questions
    const record = await prisma.quiz.findUnique({
      where: { id: Number(id) },
      include: {
        questions: true,
      },
    });

    const tDate = req.body.tDate;

    const todaysDate = new Date(tDate).getTime();
    const startDate = new Date(record.startDate).getTime();
    const endDate = new Date(record.endDate).getTime();

    //Check if the quiz has started and if it has finished
    if (todaysDate < startDate) {
      return res.status(200).json({ msg: 'Quiz has not started yet' });
    } else if (todaysDate > endDate) {
      return res.status(200).json({ msg: 'Quiz has ended' });
    }

    // Validate the number of answers provided by the user
    if (req.body.answers.length !== record.questions.length) {
      return res.status(400).json({
        msg: 'Number of answers must be equal to number of questions',
      });
    }

    // Perform answer comparison and score calculation
    const answers = req.body.answers;
    let score = 0;
    let isCorrect = false;
    const comparedAnswers = answers.map((answer, index) => {
      if (answer === record.questions[index].correctAnswer) {
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

    // Create records for user's answers, user participation, and user quiz score in the database
    await prisma.userQuestionAnswer.createMany({
      data: comparedAnswers,
    });
    await prisma.userParticipateQuiz.create({
      data: {
        userId: req.user.id,
        quizId: record.id,
      },
    });

    // Retrieve the user's information
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

    // Calculate the average score for the quiz
    const averageScore = await prisma.UserQuizScore.findMany({
      where: { quizId: record.id },
    });
    //map through scores returning array of scores, then reduce to get total score,
    // then divide by length of array to get average
    const average =
      averageScore.map((score) => score.score).reduce((a, b) => a + b, 0) / averageScore.length;

    return res.status(200).json({
      data: `${user.username} has successfully participated in quiz ${record.name}, your score was ${score}/${record.questions.length}. Average score is ${average}`,
    });
  } catch (err) {
    return res.status(500).json({
      msg: err.message,
    });
  }
};

/**
 * Delete a quiz.
 */
const deleteQuiz = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(req.user.id) },
    });
    // Check if the user has the required role to access this route
    if (user.role !== role) {
      return res.status(403).json({
        msg: 'Not authorized to access this route',
      });
    }
    const { id } = req.params;

    const record = await prisma.quiz.findUnique({
      where: { id: Number(id) },
    });
    // Check if the quiz record exists
    if (!record) {
      return res.status(404).json({
        msg: 'Quiz not found',
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

export { createQuiz, getAllQuizzes, participateQuiz, deleteQuiz, getDatedQuizzes };
