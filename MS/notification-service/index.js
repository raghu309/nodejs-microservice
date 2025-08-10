const amqp = require("amqplib");

let connection, channel;

async function connectRabbitMQ() {
    try {
        connection = await amqp.connect("amqp://rabbitmq_node");
        channel = await connection.createChannel();

        await channel.assertQueue("task_created");
        console.log("Connected to RabbitMQ [notification-service].");

        channel.consume("task_created", (msg) => {
            const taskData = JSON.parse(msg.content.toString());
            console.log("Notification: NEW TASK:", taskData.title);
            console.log("Notification: NEW TASK:", taskData);
            channel.ack(msg);
        });

        connection.on("close", () => {
            console.error("RabbitMQ connection closed. Reconnecting...");
            reconnectRabbitMQ();
        });

        connection.on("error", (err) => {
            console.error("RabbitMQ connection error:", err.message);
        });

    } catch (error) {
        console.error("RabbitMQ connection error [notification-service].", error.message);
        reconnectRabbitMQ();
    }
}

function reconnectRabbitMQ() {
    setTimeout(connectRabbitMQ, 4000); 
}

connectRabbitMQ();
