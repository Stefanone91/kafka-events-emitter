# Kafka events emitter

Nodejs console application that allows publishing or subscribing to Kafka events.

## Installation

Create a `message.json` file that could be used to insert a json message instead of pasting it into console application.

Create a `.env file` into root and populate it with your environment variables. Look at `.env.example` file to see all available options.

Run `npm install` to install dependencies.

Run `npm run build` to build source files.

## Usage

Start application with `npm run start`

Follow on screen instructions and choose between two options:

- Publish message
- Subscribe to messages

If you choose option 1, command will prompt you the event message to send. There you can:

- paste an event (pasted event will be sent)
- leave it blank (event will be loaded from message.json file)

### Kafka explorer UI

Optionally you can enable the explorer's UI in order to see and create all brokers, topics and consumers.

This fuctionality was through the work of [kafka-ui](https://github.com/provectus/kafka-ui)

## Develop

Start development environment with `npm run dev`.
