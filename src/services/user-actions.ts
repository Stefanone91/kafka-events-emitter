import prompts from "prompts";
import { ActionType } from "../models/action-types";
import fs from "fs";
import { logger } from "./logger";
import path from "path";

export async function chooseAction(): Promise<ActionType> {
  const { action } = await prompts({
    type: "select",
    name: "action",
    message: "Choose action",
    choices: [
      { title: "Publish", value: ActionType.PUBLISH },
      { title: "Subscribe", value: ActionType.SUBSCRIBE },
    ],
  });
  return action;
}

export async function chooseMessage(): Promise<string> {
  try {
    let { message } = await prompts({
      type: "text",
      name: "message",
      message: "Paste message or leave blank",
    });

    if (!message) {
      logger.info("No message provided, reading from json file");
      const jsonPath = path.resolve(__dirname, "../../message.json");
      message = fs.readFileSync(jsonPath, "utf-8");
      logger.debug(message);
    }

    return message;
  } catch (e: any) {
    logger.error(e?.message, e);
    throw e;
  }
}
