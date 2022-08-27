import pino from "pino";
const logger = pino(pino.destination("app.log"));

export default logger;
