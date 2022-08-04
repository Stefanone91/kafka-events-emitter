import "dotenv/config";
import { subscribeMessages, publishMessage } from "./services/kafka";
import { logger } from "./services/logger";
import { ActionType } from "./models/action-types";
import { chooseAction, chooseMessage } from "./services/user-actions";

(async () => {
  logger.info("Kafka-events-emitter");

  let isRunning = true;
  while (isRunning) {
    const action = await chooseAction();
    if (action === ActionType.PUBLISH) {
      let message = await chooseMessage();
      await publishMessage(message);
    } else if (action === ActionType.SUBSCRIBE) {
      await subscribeMessages();
    } else {
      logger.warn("No valid action selected");
      isRunning = false;
    }
  }
})();
