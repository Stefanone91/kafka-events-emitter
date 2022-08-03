import {
  Consumer,
  EachMessageHandler,
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
    const groupId = String(process.env.KAFKA_GROUP_ID);
    logger.info(`Connecting consumer to group ${groupId}`);
    consumer = kafka.consumer({ groupId });
    await consumer.connect();

    const topic = String(process.env.KAFKA_INPUT_TOPIC);
    logger.info(`Subscribe to topic ${topic} from beginning`);
    await consumer.subscribe({ topic, fromBeginning: false });

    logger.info("Listening on events");
    await consumer.run({ eachMessage: handleMessage });

    while (true) {} // Keeps listening on events without closing
  } catch (e: any) {
    logger.error(e?.message, e);
    throw e;
  } finally {
    consumer?.disconnect();
  }
}

const handleMessage: EachMessageHandler = async (paylod) => {
  const { topic, partition, message } = paylod;
  try {
    logger.info(
      `[Topic: ${topic} | Partition: ${partition} | Offset: ${message.offset} | Timestamp: ${message.timestamp}]`
    );
    logger.info(`${JSON.parse(message?.value?.toString() || "{}")}`);
  } catch (e: any) {
    logger.error(e?.message, e);
  }
};

// Producer
export async function publishMessage(message: string) {
  let producer: Producer | undefined = undefined;
  try {
    logger.info("Connecting producer");
    producer = kafka.producer();
    await producer.connect();

    const key = uuid();
    const topic = String(process.env.KAFKA_OUTPUT_TOPIC);
    logger.info(`Sending message with key ${key} to topic ${topic}`);
    await producer.send({ topic, messages: [{ key, value: message }] });
    logger.info(`Message successfully sent`);
  } catch (e: any) {
    logger.error(e?.message, e);
    throw e;
  } finally {
    producer?.disconnect();
  }
}
