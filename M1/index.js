import express from 'express';
import amqp from 'amqplib';
import winston from 'winston';

const app = express();

const port = 3000;

const logger = new winston.Logger({
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({filename: 'm1.log'}),
    ],
});

app.get('/', async(req, res) => {
    const userName = req.headers.name
    
    try {
        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();

        const queue = 'new_task_queue';
        const message = userName;//'Hello, Mikroservice M2!';
        
        await channel.assertQueue(queue);
        channel.sendToQueue(queue, Buffer.from(message));
        console.log('Message sent: ', message);

        await channel.close();
        await connection.close();

        res.send('Request processed successfully!');
    } catch (error) {
        console.log('Error processing request:', error);
        logger.error(`Error pushing message to queue: ${error}`);
        res.status(500).send('Internal server error');        
    }
});

app.listen(port, () => {
    console.log(`Mikroservice M1 is listening on port ${port}`);
})