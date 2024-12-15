const UserModel = require('./models/User');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// MongoDB connection
mongoose.connect('mongodb+srv://avisrivastava:aviissexy@cluster-main.nd18g.mongodb.net/study-app')
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(express.json());

// Socket.IO events
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Start the timer
  socket.on('startTimer', async (data) => {
    console.log(`${data.userId} started timer: ${data.timeElapsed}s`);
    const user = await UserModel.findById(data.userId);
    if (user) {
      user.studyTime = data.timeElapsed;
      await user.save();
      io.emit('studyTimeUpdate', { userId: data.userId, studyTime: user.studyTime });
    }
  });

  // Pause the timer
  socket.on('pauseTimer', async (data) => {
    console.log(`${data.userId} paused timer: ${data.timeElapsed}s`);
    const user = await UserModel.findById(data.userId);
    if (user) {
      user.studyTime = data.timeElapsed;
      await user.save();
      io.emit('studyTimeUpdate', { userId: data.userId, studyTime: user.studyTime });
    }
  });

  // Reset the timer
  socket.on('resetTimer', async (data) => {
    console.log(`${data.userId} reset timer`);
    const user = await UserModel.findById(data.userId);
    if (user) {
      user.studyTime = 0;
      await user.save();
      io.emit('studyTimeUpdate', { userId: data.userId, studyTime: user.studyTime });
    }
  });

  // Sync study time for all users every second
  const updateAllTimers = async () => {
    const users = await UserModel.find(); // Get all users
    users.forEach((user) => {
      io.emit('studyTimeUpdate', { userId: user._id, studyTime: user.studyTime });
    });
  };

  // Emit the updated study times every second
  const timerInterval = setInterval(updateAllTimers, 1000);

  // Disconnect logic
  socket.on('disconnect', async () => {
    console.log('User disconnected:', socket.id);
    clearInterval(timerInterval);
    
    if (socket.userId) {
      const user = await UserModel.findById(socket.userId);
      if (user) {
        user.studyTime = socket.studyTime; // Save the last study time
        await user.save();
      }
    }
  });
  
});

// API routes
app.post('/sign-up', (req, res) => {
  UserModel.create(req.body)
    .then((user) => res.json(user))
    .catch((err) => res.json({ error: err }));
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await UserModel.findOne({ email });
    if (user) {
      if (user.password === password) {
        res.json({ message: 'success' });
      } else {
        res.json({ message: 'Incorrect password' });
      }
    } else {
      res.json({ message: 'User not found' });
    }
  } catch (err) {
    res.json({ error: err });
  }
});

app.get('/users', async (req, res) => {
  try {
    const users = await UserModel.find({}, 'name studyTime'); // Only fetch username and studyTime
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
