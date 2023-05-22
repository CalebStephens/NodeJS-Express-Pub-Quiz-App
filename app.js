import dotenv from "dotenv";
import express, { urlencoded, json } from "express";

/**
 * You will create the routes for institutions and departments later
 */
import institutions from "./routes/v1/institutions.js";
import departments from "./routes/v1/departments.js";

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

app.use(`/${BASE_URL}/${CURRENT_VERSION}/institutions`, institutions);
app.use(`/${BASE_URL}/${CURRENT_VERSION}/departments`, departments);

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});