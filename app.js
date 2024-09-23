const express = require("express");
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files from the 'public' directory
app.set('view engine', 'ejs'); // Set the view engine to EJS for rendering templates
app.set('views', path.join(__dirname, 'views')); // Set the views directory

// Ensure data directory exists
const ensureDataDirectory = () => {
    const dir = path.join(__dirname, 'data');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
};

// Load tasks from the JSON file
const getTasks = () => {
    ensureDataDirectory();
    const filePath = path.join(__dirname, 'data', 'tasks.json');
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, '[]');
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
};

const saveTasks = (tasks) => {
    const filePath = path.join(__dirname, 'data', 'tasks.json');
    fs.writeFileSync(filePath, JSON.stringify(tasks, null, 2));
};

// Routes
app.get('/', (req, res) => {
    const tasks = getTasks();
    res.render('index', { tasks });
});

app.get('/tasks/:id/edit', (req, res) => {
    const tasks = getTasks();
    const task = tasks.find(task => task.id == req.params.id);
    if (task) {
        res.render('edit', { task });
    } else {
        res.status(404).send('Task not found');
    }
});

app.post('/tasks', (req, res) => {
    const tasks = getTasks();
    const newTask = {
        id: Date.now(),
        name: req.body.name,
        date: req.body.date,
        description: req.body.description
    };
    tasks.push(newTask);
    saveTasks(tasks);
    res.redirect('/');
});

app.post('/tasks/:id', (req, res) => {
    const tasks = getTasks();
    const taskIndex = tasks.findIndex(task => task.id == req.params.id);
    if (taskIndex !== -1) {
        tasks[taskIndex].name = req.body.name;
        tasks[taskIndex].date = req.body.date;
        tasks[taskIndex].description = req.body.description;
        saveTasks(tasks);
        res.redirect('/');
    } else {
        res.status(404).send('Task not found');
    }
});

app.post('/tasks/:id/delete', (req, res) => {
    let tasks = getTasks();
    tasks = tasks.filter(task => task.id != parseInt(req.params.id));
    saveTasks(tasks);
    res.redirect('/');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
