import dotenv from "dotenv";
import express, { urlencoded, json } from "express";
import cors from "cors";
import helmet from "helmet";

/**
 * You will create the routes for institutions and departments later
 */
import auth from "./routes/v1/auth.js";
import authRoute from "./middleware/authRoute.js";
import users from "./routes/v1/users.js";
import seed from "./routes/v1/seed.js";

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

app.use(`/${BASE_URL}/${CURRENT_VERSION}/auth`, auth);
app.use(
    `/${BASE_URL}/${CURRENT_VERSION}/users`,
    authRoute,
    users
  );
app.use(`/${BASE_URL}/${CURRENT_VERSION}/seed`,authRoute, seed);

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});