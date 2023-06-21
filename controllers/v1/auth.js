/** 
 * Authorisation Controller
* This code module provides functionality for user registration and login in an application. 
* It includes validation of user input using the Joi library,
*  hashing and salting of passwords using bcryptjs, 
* and generation of JSON Web Tokens (JWT) for user authentication using the jwt library.
*  The code utilizes the Prisma client for interacting with the database to create and retrieve user records.
*/
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi';

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Define the registration schema using Joi for input validation
const registerSchema = Joi.object({
  firstName: Joi.string()
    .min(2)
    .max(50)
    .regex(/^[a-zA-Z]+$/)
    .required()
    .messages({
      'string.base': 'First name must only contain letters',
      'string.empty': 'First name is required',
      'string.min': 'First name must be at least 2 characters long',
      'string.max': 'First name must be at most 50 characters long',
      'string.pattern.base': 'First name must only contain letters',
      'any.required': 'First name is required',
    }),
  lastName: Joi.string()
    .min(2)
    .max(50)
    .regex(/^[a-zA-Z]+$/)
    .required()
    .messages({
      'string.base': 'First name must only contain letters',
      'string.empty': 'First name is required',
      'string.min': 'First name must be at least 2 characters long',
      'string.max': 'First name must be at most 50 characters long',
      'string.pattern.base': 'First name must only contain letters',
      'any.required': 'Last name is required',
    }),
  username: Joi.string().min(5).max(10).alphanum().required().messages({
    'string.base': 'Username must only contain letters and numbers',
    'string.empty': 'Username is required',
    'string.min': 'Username must be at least 5 characters long',
    'string.max': 'Username must be at most 10 characters long',
    'string.alphanum': 'Username must only contain letters and numbers',
    'any.required': 'Username is required',
  }),
  email: Joi.string()
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    .email({ minDomainSegments: 2 })
    .required()
    .messages({
      'string.base': 'Email must be a valid email',
      'string.empty': 'Email is required',
      'string.pattern.base': 'Email must be a valid email',
      'string.email': 'Email must be a valid email',
      'any.required': 'Email is required',
    }),
  password: Joi.string()
    .min(8)
    .max(16)
    .pattern(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]+$/)
    .required()
    .messages({
      'string.base':
        'Password must contain at least one letter, one number and one special character',
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 8 characters long',
      'string.max': 'Password must be at most 16 characters long',
      'string.pattern.base':
        'Password must contain at least one letter, one number and one special character',
      'any.required': 'Password is required',
    }),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'string.base': 'Passwords do not match',
    'string.empty': 'Passwords do not match',
    'any.only': 'Passwords do not match',
    'any.required': 'Confirm Password is required',
  }),
  role: Joi.string().valid('SUPER_ADMIN_USER', 'BASIC_USER'),
});

const register = async (req, res) => {
  try {
    // Validate the request body against a registration schema
    const { error, value } = registerSchema.validate(req.body);
    console.log('reg')
    if (error) {
      // If validation fails, return a 400 Bad Request response with the error message
      return res.status(400).json({
        msg: error.details[0].message,
      });
    }

    if (!req.body.email.includes(req.body.username)) {
      // If the email does not include the username, return a 400 Bad Request response
      return res.status(400).json({
        msg: 'Username must be included in email',
      });
    }

    const { firstName, lastName, username, email, password, role } = req.body;
    // Check if a user with the email or username already exists
    let user = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (user) {
      return res
      // If a user with the same email or username exists, return a 409 Conflict response
        .status(409)
        .json({ msg: 'User with that email or username already exists' });
    }

    /**
     * A salt is random bits added to a password before it is hashed. Salts
     * create unique passwords even if two users have the same passwords
     */
    const salt = await bcryptjs.genSalt();

    /**
     * Generate a hash for a given string. The first argument
     * is a string to be hashed, i.e., Pazzw0rd123 and the second
     * argument is a salt, i.e., E1F53135E559C253
     */
    const hashedPassword = await bcryptjs.hash(password, salt);

    // Generate an avatar URL based on the user's first name and last name
    const avatar = `https://api.dicebear.com/6.x/pixel-art/svg?seed=${firstName}+${lastName}`;

    

    // Create a new user in the database
    user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        username,
        email,
        password: hashedPassword,
        avatar,
        role: role ? role : 'BASIC_USER',
      },
    });

    /**
     * Delete the password property from the user object. It
     * is a less expensive operation than querying the User
     * table to get only user's email and name
     */
    delete user.password;

    // Return a 201 Created response with the registered user's information
    return res.status(201).json({
      msg: `${user.username} successfully registered`,
      data: user,
    });
  } catch (err) {
    // If an error occurs, return a 500 Internal Server Error response with the error message
    return res.status(500).json({
      msg: err.message,
    });
  }
};

const login = async (req, res) => {
  try {
    
    const { email, password, username } = req.body;
    // Find the user based on either the email or the username
    const user = email
      ? await prisma.user.findUnique({ where: { email } })
      : await prisma.user.findUnique({ where: { username } });

    if (!user) {
      // If the user does not exist, return a 401 Unauthorized response
      return res.status(401).json({ msg: 'Invalid email or username' });
    }

    /**
     * Compare the given string, i.e., Pazzw0rd123, with the given
     * hash, i.e., user's hashed password
     */
    const isPasswordCorrect = await bcryptjs.compare(password, user.password);
    if(!isPasswordCorrect) {
      return res.status(401).json({ msg: 'Invalid password' });
    }

    const { JWT_SECRET, JWT_LIFETIME } = process.env;

    /**
     * Return a JWT. The first argument is the payload, i.e., an object containing
     * the authenticated user's id and name, the second argument is the secret
     * or public/private key, and the third argument is the lifetime of the JWT
     */
    const token = jwt.sign(
      {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      JWT_SECRET,
      { expiresIn: JWT_LIFETIME }
    );

    // Return a 200 OK response with the user's information and the JWT
    return res.status(200).json({
      msg: `${user.username} successfully logged in`,
      token: token,
    });
  } catch (err) {
    // If an error occurs, return a 500 Internal Server Error response with the error message
    return res.status(500).json({
      msg: err.message,
    });
  }
};

export { register, login };
