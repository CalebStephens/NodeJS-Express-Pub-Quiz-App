import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import Joi from "joi";

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const registerSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).regex(/^[a-zA-Z]+$/).required().messages({
    "string.base": "First name must only contain letters",
    "string.empty": "First name is required",
    "string.min": "First name must be at least 2 characters long",
    "string.max": "First name must be at most 50 characters long",
    "string.pattern.base": "First name must only contain letters",
    "any.required": "First name is required"
  }),
  lastName: Joi.string().min(2).max(50).regex(/^[a-zA-Z]+$/).required().messages({
    "string.base": "First name must only contain letters",
    "string.empty": "First name is required",
    "string.min": "First name must be at least 2 characters long",
    "string.max": "First name must be at most 50 characters long",
    "string.pattern.base": "First name must only contain letters",
    "any.required": "Last name is required"
  }),
  username: Joi.string().min(5).max(10).alphanum().required().messages({
    "string.base": "Username must only contain letters and numbers",
    "string.empty": "Username is required",
    "string.min": "Username must be at least 5 characters long",
    "string.max": "Username must be at most 10 characters long",
    "string.alphanum": "Username must only contain letters and numbers",
    "any.required": "Username is required"
  }),
  email: Joi.string().email({ minDomainSegments: 2 }).required().messages({
    "string.base": "Email is required",
    "string.empty": "Email is required",
    "string.email": "Email must be a valid email",
    "string.minDomainSegments": "Email must be a valid email",
    "any.required": "Email is required"
  }),
  password: Joi.string().min(8).max(16).pattern(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]+$/).required().messages({
    "string.base": "Password must contain at least one letter, one number and one special character",
    "string.empty": "Password is required",
    "string.min": "Password must be at least 8 characters long",
    "string.max": "Password must be at most 16 characters long",
    "string.pattern.base": "Password must contain at least one letter, one number and one special character",
    "any.required": "Password is required"
  }),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "string.base": "Passwords do not match",
    "string.empty": "Passwords do not match",
    "any.only": "Passwords do not match",
    "any.required": "Confirm Password is required"
  }),
  role: Joi.string().valid("SUPER_ADMIN_USER", "BASIC_USER"),
});

const register = async (req, res) => {
  try {

    const { error, value } = registerSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        msg: error.details[0].message,
      });
    }

    const { firstName, lastName, username, email, password, role } = req.body;

    let user = await prisma.user.findFirst({ where: {OR: [{email}, {username}] }});

    if (user) {
      return res.status(409).json({ msg: "User already exists" });
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

    const avatar = `https://api.dicebear.com/6.x/pixel-art/svg?seed=${firstName}+${lastName}`

    user = await prisma.user.create({
      data: { firstName, lastName, username, email, password: hashedPassword, avatar, role },
    });

    /**
     * Delete the password property from the user object. It
     * is a less expensive operation than querying the User
     * table to get only user's email and name
     */
    delete user.password;

    return res.status(201).json({
      msg: `${user.username} successfully registered`,
      data: user,
    });
  } catch (err) {
    return res.status(500).json({
      msg: err.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, username } = req.body;

    const user =  email ? await prisma.user.findUnique({ where: {email} }) : await prisma.user.findUnique({ where: {username} });

    if (!user) {
      return res.status(401).json({ msg: "Invalid email or username" });
    }

    /**
     * Compare the given string, i.e., Pazzw0rd123, with the given
     * hash, i.e., user's hashed password
     */
    const isPasswordCorrect = await bcryptjs.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ msg: "Invalid password" });
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

    return res.status(200).json({
      msg: `${user.username} successfully logged in`,
      token: token,
    });
  } catch (err) {
    return res.status(500).json({
      msg: err.message,
    });
  }
};

export { register, login };