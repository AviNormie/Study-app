const UserModel = require('./models/User')
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const timerRoutes = require('./routes/timerRoutes');
// const leaderboardRoutes = require('./routes/leaderboardRoutes');
const  mongoose= require('mongoose');
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: 'http://localhost:5173', // Allow your frontend to connect
        methods: ['GET', 'POST']
    }
});

mongoose.connect('mongodb+srv://avisrivastava:aviissexy@cluster-main.nd18g.mongodb.net/study-app', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected successfully"))
.catch(err => console.error("MongoDB connection error:", err));

// Enable CORS for all routes
app.use(cors());

// Middleware
app.use(express.json());

// WebSocket event handling
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('startTimer', (data) => {
        console.log(`${data.userId} started their timer: ${data.timeElapsed}s`);
    });

    socket.on('pauseTimer', (data) => {
        console.log(`${data.userId} paused their timer: ${data.timeElapsed}s`);
    });

    socket.on('resetTimer', (data) => {
        console.log(`${data.userId} reset their timer`);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    });
});

// API Routes
app.get('/users', async (req, res) => {
    try {
        const users = await UserModel.find({}, 'name studyTime'); // Only fetch username and studyTime
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

app.post('/update-study-time', async (req, res) => {
    const { userId, studyTime } = req.body; // Get user ID and new study time
    try {
        await UserModel.findByIdAndUpdate(userId, { $inc: { studyTime } }); // Increment studyTime
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update study time' });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (user.password !== password) {
            return res.status(401).json({ message: "Incorrect password" });
        }
        res.json({ message: "success", userId: user._id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});


app.post('/sign-up', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "Email already exists" });
        }
        const newUser = await UserModel.create({ name, email, password });
        res.status(201).json({ message: "User created successfully", user: newUser });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
