import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import helmet from "helmet";
import { fileURLToPath } from "url";
import apiRouter from "./src/api/index.js";
import bodyParser from "body-parser";
import { handler } from "../front-end/build/handler.js";
import "./src/cron.js";

console.error("beka xD", new Error("co"));

dotenv.config();

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());

app.use(cookieParser());

app.use(apiRouter);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.resolve(__dirname, "../assets")));
app.use(express.static(path.resolve(__dirname, "../client/public")));

app.use(handler);

app.listen(process.env.PORT || 5000);
