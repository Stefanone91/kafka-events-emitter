import {
  Consumer,
  Kafka,
  KafkaConfig,
  logCreator,
  logLevel,
  Producer,
} from "kafkajs";
import { v4 as uuid } from "uuid";
import { logger } from "./logger";

// Logger
const toWinstonLogLevel = (level: logLevel) => {
  switch (level) {
    case logLevel.ERROR:
    case logLevel.NOTHING:
      return "error";
    case logLevel.WARN:
      return "warn";
    case logLevel.INFO:
      return "info";
    case logLevel.DEBUG:
      return "debug";
  }
};

const winstonLogger: logCreator = (entry) => {
  return ({ namespace, level, label, log }) => {
    const { message, ...extra } = log;
    logger.log({
      level: toWinstonLogLevel(level),
      message,
      extra,
    });
  };
};

// Configuration
const config: KafkaConfig = {
  brokers: [String(process.env.KAFKA_BOOTSTRAP_SERVER)],
  clientId: String(process.env.KAFKA_CLIENT_ID),
  connectionTimeout: Number(process.env.KAFKA_CONNECTION_TIMEOUT),
  requestTimeout: Number(process.env.KAFKA_REQUEST_TIMEOUT),
  sasl: {
    mechanism: String(process.env.KAFKA_SASL_MECHANISM).toLowerCase() as any,
    username: String(process.env.KAFKA_SASL_USERNAME),
    password: String(process.env.KAFKA_SASL_PASSWORD),
  },
  ssl:
    process.env.KAFKA_SSL_ENABLED === "true"
      ? {
          rejectUnauthorized:
            process.env.KAFKA_SSL_REJECT_UNAUTHORIZED === "true",
          ca: "./certificates/ca.crt",
        }
      : false,
  logCreator: winstonLogger,
};
logger.debug(config);

// Initialize
export const kafka = new Kafka(config);

// Consumer
export async function subscribeMessages() {
  let consumer: Consumer | undefined = undefined;
  try {
    logger.info("Connecting consumer");
    consumer = kafka.consumer({
      groupId: String(process.env.KAFKA_GROUP_ID),
    });
    await consumer.connect();

    logger.info("Subscribe to topic from beginning");
    await consumer.subscribe({
      topic: String(process.env.KAFKA_INPUT_TOPIC),
      fromBeginning: false,
    });

    logger.info("Listening on events");
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          logger.info(
            `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`
          );
          logger.info(`${JSON.parse(message?.value?.toString() || "{}")}`);
        } catch (e: any) {
          logger.error(`[example/consumer] ${e.message}`, e);
        }
      },
    });

    while (true) {} // Keeps listening on events without closing
  } catch (e: any) {
    logger.error(e?.message, e);
    throw e;
  } finally {
    consumer?.disconnect();
  }
}

// Producer
export async function publishMessage(message: string) {
  let producer: Producer | undefined = undefined;
  try {
    logger.info("Connecting producer");
    producer = kafka.producer();
    await producer.connect();

    logger.info("Sending message");
    await producer.send({
      topic: String(process.env.KAFKA_INPUT_TOPIC),
      messages: [
        {
          key: uuid(),
          value: message,
        },
      ],
    });
  } catch (e: any) {
    logger.error(e?.message, e);
    throw e;
  } finally {
    producer?.disconnect();
  }
}
