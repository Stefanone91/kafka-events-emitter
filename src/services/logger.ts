import winston from "winston";

winston.addColors({
  error: "red",
  warn: "yellow",
  info: "cyan",
  debug: "green",
});

export const logger = winston.createLogger({
  level: "debug",
  format: winston.format.combine(
    winston.format.json(),
    winston.format.colorize({ all: true }),
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf((x) => `${x.timestamp} [${x.level}] ${x.message}`)
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "error.log", level: "error" }),
  ],
});
