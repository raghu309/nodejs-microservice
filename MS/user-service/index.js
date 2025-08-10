const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const port = 3001;

app.use(bodyParser.json());

mongoose.connect('mongodb://mongo:27017/users').then(() => console.log("Connected to mongodb."))
    .catch(err => console.error("Mongodb connection error: ", err));

const UserSchema = new mongoose.Schema({
    name: String,
    email: String
});

const User = mongoose.model('User', UserSchema);

app.get('/', (req, res) => {
    res.send("Hello World!");
})

app.post('/users', async (req, res) => {
    const {name, email} = req.body;
    try {
        const user = new User({name, email});
        await user.save();
        res.status(201).json(user);
    } catch(error) {
        console.error("Error adding user: ", error);
        res.status(500).json({error: "Internal Server error!"});
    }
})

app.get('/users', async (req, res) => {
    try {
        const allUsers = await User.find();
        res.status(200).json(allUsers);
    } catch (error) {
        console.error("Error fetching users: ", error);
        res.status(500).json({error: "Internal Server error!"});
    }
})

app.listen(port, () => {
    console.log(`App listening on port ${port}.`);
})