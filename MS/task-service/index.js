const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const port = 3002;
const amqp = require("amqplib");

app.use(bodyParser.json());

mongoose.connect("mongodb://mongo:27017/tasks").then(() => console.log("Connected to mongo.[task-service]"))
.catch(err => console.log("Error occured while connecting to mongo [task-service]."));

const TaskSchema = mongoose.Schema({
    title: String,
    description: String,
    userId: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Task = mongoose.model('Task', TaskSchema);

let channel, connection;

async function connectRabbitMQWithRetry(retries = 10, delay = 5000) {
    while(retries) {
        try {
            connection = await amqp.connect("amqp://rabbitmq_node");
            channel = await connection.createChannel();
            await channel.assertQueue("task_created");
            console.log("Connected to RabbitMQ [task-service].");
            return;
        } catch (error) {
            console.error("RabbitMQ connection error [task-service]." ,error);
            retries--;
            console.error("Retrying again: ", retries);
            await new Promise(res => setTimeout(res, delay));
        }
    }
}

app.post('/tasks', async (req, res) => {
    const {title, description, userId} = req.body;

    try {
        const task = new Task({title, description, userId});
        await task.save();

        const message = { taskId: task._id, userId, title };

        if(!channel) {
            return res.status(503).json({ error: "RabbitMQ not connected! "});
        }

        channel.sendToQueue("task_created", Buffer.from(JSON.stringify(message)));

        res.json(task).status(201);
    } catch (error) {
        res.status(500)
    }
})

app.get('/tasks', async (req, res) => {
    try {
        const allTasks = await Task.find();
        res.json(allTasks).status(200);
    } catch (error) {
        console.error("Error fetching users: ", error);
        res.status(500).json({error: "Internal Server error!"});
    }
})

app.listen(port, () => {
    console.log(`task-service listening on port ${port}.`);
    connectRabbitMQWithRetry();
})