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
    origin: ["https://study-buddy-tawny.vercel.app", "http://localhost:5173"],
    methods: ['GET', 'POST'],
  },
});

// MongoDB connection
mongoose.connect('mongodb+srv://avi:avi@cluster0.bjgti.mongodb.net/study-app')
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));
  mongoose.set('debug', true);

// Middleware
app.use(
  cors({
    origin: ["https://study-buddy-tawny.vercel.app", "http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true
  })
);

app.use(express.json());

let timerInterval = null; 
let activeTimers = {}; 

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
   // Broadcasting user's connection to others
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room: ${roomId}`);
    socket.to(roomId).emit('userJoined', { socketId: socket.id });
  });

  // Handle receiving and forwarding offer (WebRTC signaling)
  socket.on('offer', (data) => {
    console.log(`Sending offer from ${socket.id} to ${data.target}`);
    socket.to(data.target).emit('offer', {
      sdp: data.sdp,
      caller: socket.id,
    });
  });

  // Handle answering offer (WebRTC signaling)
  socket.on('answer', (data) => {
    console.log(`Sending answer from ${socket.id} to ${data.target}`);
    socket.to(data.target).emit('answer', {
      sdp: data.sdp,
      answerer: socket.id,
    });
  });

  // Handle ICE candidate exchange
  socket.on('ice-candidate', (data) => {
    console.log(`Exchanging ICE candidate from ${socket.id} to ${data.target}`);
    socket.to(data.target).emit('ice-candidate', {
      candidate: data.candidate,
      sender: socket.id,
    });
  });
  socket.on('startTimer', async (data) => {
    console.log(`${data.userId} started timer: ${data.timeElapsed}s`);

    activeTimers[data.userId] = true;

    if (!timerInterval) {
      timerInterval = setInterval(updateAllTimers, 1000);
    }

    const user = await UserModel.findById(data.userId);
    if (user) {
      user.studyTime = data.timeElapsed;
      await user.save();
      io.emit('studyTimeUpdate', { userId: data.userId, studyTime: user.studyTime });
    }
  });

  socket.on('pauseTimer', async (data) => {
    console.log(`${data.userId} paused timer: ${data.timeElapsed}s`);

    delete activeTimers[data.userId];

    if (Object.keys(activeTimers).length === 0) {
      clearInterval(timerInterval);
      timerInterval = null;
    }

    const user = await UserModel.findById(data.userId);
    if (user) {
      user.studyTime = data.timeElapsed;
      await user.save();
      io.emit('studyTimeUpdate', { userId: data.userId, studyTime: user.studyTime });
    }
  });

  socket.on('resetTimer', async (data) => {
    console.log(`${data.userId} reset timer`);

    delete activeTimers[data.userId];

    const user = await UserModel.findById(data.userId);
    if (user) {
      user.studyTime = 0;
      await user.save();
      io.emit('studyTimeUpdate', { userId: data.userId, studyTime: user.studyTime });
    }
  });
  const updateAllTimers = async () => {
    const activeUserIds = Object.keys(activeTimers);
    for (const userId of activeUserIds) {
      const user = await UserModel.findById(userId);
      if (user) {
        user.studyTime += 1; 
        await user.save();
        io.emit('studyTimeUpdate', { userId: user._id, studyTime: user.studyTime });
      }
    }

    if (activeUserIds.length === 0) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  };

  socket.on('disconnect', async () => {
    console.log('User disconnected:', socket.id);

    for (const userId in activeTimers) {
      if (activeTimers[userId] === socket.id) {
        delete activeTimers[userId];
      }
    }

    if (Object.keys(activeTimers).length === 0 && timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  });
});
app.get("/", (req, res)=>{
  return res.json({
    message: "Backend Deployed"
  })
  })
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
        res.json({ message: 'success',userId: user._id ,userName:user.name});
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

app.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await UserModel.findById(userId);
    if (user) {
      return res.status(200).json({ studyTime: user.studyTime });
    }
    res.status(404).json({ message: 'User not found' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});


app.get('/users', async (req, res) => {
  try {
    const users = await UserModel.find({}, 'name studyTime _id');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
