# Kafka events emitter

Nodejs console application that allows publishing or subscribing to Kafka events.

## Installation

Inside `templates` folder create some `.json` files containing a json message to send (if needed).

Create a `.env file` into root and populate it with your environment variables in order to be able to connect to your kafka instance.
Have a look at `.env.example` file to see all available options.

Run `npm install` to install dependencies.

Run `npm run build` to build source files.

## Usage

Start application with `npm run start`

Follow on screen instructions and choose between two options:

- Publish message
- Subscribe to messages

If you choose option 1, command will prompt you to choose for an event message to send by reading ones in the template folder.
You can also enable a "paste message" option that allows you to paste code inside terminal.

### Kafka explorer UI

Optionally you can enable the explorer's UI in order to see and create all brokers, topics and consumers.

This fuctionality was through the work of [kafka-ui](https://github.com/provectus/kafka-ui)

## Develop

Start development environment with `npm run dev`.
