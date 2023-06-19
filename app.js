import dotenv from "dotenv";
import express, { urlencoded, json } from "express";
import rateLimit from 'express-rate-limit'
import cors from "cors";
import helmet from "helmet";
import cacheRoute from "./middleware/cacheRoute.js";
import compression from "compression";

/**
 * You will create the routes for institutions and departments later
 */
import auth from "./routes/v1/auth.js";
import authRoute from "./middleware/authRoute.js";
import users from "./routes/v1/users.js";
import seed from "./routes/v1/seed.js";
import categories from "./routes/v1/category.js";
import quiz from "./routes/v1/quiz.js";

dotenv.config();

const app = express();

const BASE_URL = "api";

/**
 * The current version of this API is 1
 */
const CURRENT_VERSION = "v1";

const PORT = process.env.PORT;

app.use(urlencoded({ extended: false }));
app.use(json());
app.use(cors());
app.use(helmet());
app.use(cacheRoute);
app.use(compression());
app.use(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute duration in milliseconds
    max: 50,
    message: 'You exceeded 50 requests in 1 min limit!',
    headers: true,
  })
)

app.use(`/${BASE_URL}/${CURRENT_VERSION}/auth`, auth);
app.use(
    `/${BASE_URL}/${CURRENT_VERSION}/users`,
    authRoute,
    users
  );
app.use(`/${BASE_URL}/${CURRENT_VERSION}/seed`,authRoute, seed);

app.use(`/${BASE_URL}/${CURRENT_VERSION}/category`, categories)
app.use(`/${BASE_URL}/${CURRENT_VERSION}/quiz`,authRoute , quiz)

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});