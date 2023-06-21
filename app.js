import dotenv from 'dotenv';
import express, { urlencoded, json } from 'express';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import listEndpoints from 'express-list-endpoints';
import cacheRoute from './middleware/cacheRoute.js';

import auth from './routes/v1/auth.js';
import authRoute from './middleware/authRoute.js';
import users from './routes/v1/users.js';
import seed from './routes/v1/seed.js';
import categories from './routes/v1/category.js';
import score from './routes/v1/score.js';
import quiz from './routes/v1/quiz.js';

dotenv.config();

const app = express();

const BASE_URL = 'api';

/**
 * The current version of this API is 1
 */
const CURRENT_VERSION = 'v1';

const PORT = process.env.PORT;

/**
 * Function to get a list of all available endpoints in the application
 */
const getAvailableEndpoints = () => {
  const endpoints = listEndpoints(app);

  const data = [];

  endpoints.forEach((endpoint) => {
    data.push(`${endpoint.path}`);
  });

  return data;
};

// Apply rate limiting middleware
app.use(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute duration in milliseconds
    max: 50,
    message: 'You exceeded 50 requests in 1 min limit!',
    headers: true,
  })
);
// Parse url-encoded and JSON request bodies
app.use(urlencoded({ extended: false }));
app.use(json());

// Enable Cross-Origin Resource Sharing
app.use(cors());

// Set secure HTTP headers
app.use(helmet());

// Custom middleware for caching
app.use(cacheRoute);

// Response compression
app.use(compression());

// Root endpoint that returns a list of available endpoints
app.get(`/${BASE_URL}/${CURRENT_VERSION}/`, (req, res) =>
  res.status(200).json(getAvailableEndpoints())
);

// Mounting routes with authentication middleware
app.use(`/${BASE_URL}/${CURRENT_VERSION}/auth`, auth);
app.use(`/${BASE_URL}/${CURRENT_VERSION}/users`, authRoute, users);
app.use(`/${BASE_URL}/${CURRENT_VERSION}/seed`, authRoute, seed);
app.use(`/${BASE_URL}/${CURRENT_VERSION}/score`, authRoute, score);
app.use(`/${BASE_URL}/${CURRENT_VERSION}/category`, authRoute, categories);
app.use(`/${BASE_URL}/${CURRENT_VERSION}/quiz`, authRoute, quiz);

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

export default app;
