import prompts from "prompts";
import { ActionType } from "../models/action-types";
import fs from "fs";
import { logger } from "./logger";
import path from "path";
import { SourceType } from "../models/source-types";

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

async function chooseMessageSource(): Promise<SourceType> {
  const { source } = await prompts({
    type: "select",
    name: "source",
    message: "Choose message source",
    choices: [
      { title: "Read from file", value: SourceType.FROM_FILE },
      { title: "Paste message", value: SourceType.PASTE_MESSAGE },
    ],
  });
  return source;
}

async function getPastedMessage(): Promise<string> {
  let { message } = await prompts({
    type: "text",
    name: "message",
    message: "Paste message",
  });
  return message;
}

async function chooseMessageFile(): Promise<string> {
  // Check templates folder existance
  const templatesPath = path.resolve(__dirname, "../../templates");
  if (!fs.existsSync(templatesPath)) {
    logger.error("Missing templates folder");
    throw new Error("Missing templates folder");
  }

  // Read all templates in folder
  const messagesTemplates = fs
    .readdirSync(templatesPath, { encoding: "utf8", withFileTypes: true })
    .filter((x) => x.isFile())
    .filter((x) => x.name.endsWith(".json"));

  // Choose template
  const { templatePath } = await prompts({
    type: "select",
    name: "templatePath",
    message: "Choose a message from templates folder",
    choices: messagesTemplates.map((x) => ({
      title: x.name,
      value: path.resolve(templatesPath, x.name),
    })),
  });

  // Read content
  logger.info(`Reading template content`);
  return fs.readFileSync(templatePath, "utf8");
}

export async function chooseMessage(): Promise<string> {
  try {
    let message = "";

    // Choose source type
    const source = await chooseMessageSource();
    if (source === SourceType.PASTE_MESSAGE) {
      message = await getPastedMessage();
    } else if (source === SourceType.FROM_FILE) {
      message = await chooseMessageFile();
    }

    logger.debug(message);

    // If no message has been provided, retry
    if (!message) {
      logger.error("Invalid message");
      return chooseMessage();
    }

    return message;
  } catch (e: any) {
    logger.error(e?.message, e);
    throw e;
  }
}
