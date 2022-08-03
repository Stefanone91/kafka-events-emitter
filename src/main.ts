import "dotenv/config";
import { subscribeMessages, publishMessage } from "./services/kafka";
import { logger } from "./services/logger";
import { ActionType } from "./models/action-types";
import { chooseAction, chooseMessage } from "./services/user-actions";

(async () => {
  logger.info("Kafka-events-emitter");

  // Choose action
  const action = await chooseAction();

  // Publish
  if (action === ActionType.PUBLISH) {
    let message = await chooseMessage();
    await publishMessage(message);
  }

  // Subscribe
  else if (action === ActionType.SUBSCRIBE) {
    await subscribeMessages();
  }

  // No valid action
  else {
    logger.warn("No valid action selected");
  }
})();
