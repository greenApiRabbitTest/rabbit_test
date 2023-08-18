import amqp from 'amqplib';
import winston from 'winston';

const logger = new winston.Logger({
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({filename: 'm2.log'}),
    ],
});

async function start() {
    try {
        const connection = await amqp.connect('amqp://localhost');

        const channel = await connection.createChannel();
        const queue = 'new_task_queue';
        await channel.assertQueue(queue, { durable: true});

        channel.consume(queue, (msg) => {
            const content = msg.content.toString();

            console.log('Received message:', content);

            channel.ack(msg);
        }, {noAck: false});
    } catch (error) {
        console.log('Error:', error.message)
        logger.error(`Error pushing message to queue: ${error}`);
    }
}

start();