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
    origin: 'http://localhost:5173', // Allow your frontend to connect
    methods: ['GET', 'POST'],
  },
});

mongoose
  .connect('mongodb+srv://avisrivastava:aviissexy@cluster-main.nd18g.mongodb.net/study-app', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use(cors());
app.use(express.json());

// WebSocket event handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('startTimer', async (data) => {
    console.log(`${data.userId} started their timer: ${data.timeElapsed}s`);
    const user = await UserModel.findById(data.userId);
    if (user) {
      user.studyTime = data.timeElapsed;
      await user.save();
      io.emit('studyTimeUpdate', { userId: data.userId, studyTime: user.studyTime });
    }
  });

  socket.on('pauseTimer', async (data) => {
    console.log(`${data.userId} paused their timer: ${data.timeElapsed}s`);
    const user = await UserModel.findById(data.userId);
    if (user) {
      user.studyTime = data.timeElapsed;
      await user.save();
      io.emit('studyTimeUpdate', { userId: data.userId, studyTime: user.studyTime });
    }
  });

  socket.on('resetTimer', async (data) => {
    console.log(`${data.userId} reset their timer`);
    const user = await UserModel.findById(data.userId);
    if (user) {
      user.studyTime = 0;
      await user.save();
      io.emit('studyTimeUpdate', { userId: data.userId, studyTime: user.studyTime });
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

// API Routes

app.post('/sign-up',(req, res) => {
    UserModel.create(req.body)
    .then(users => res.json(users))
    .catch(err => res.json({err}))
})

app.post('/login',(req, res) => {
    try{
        const {email,password} = req.body
        UserModel.findOne({email:email})
        .then(users => {
            if(users){
                if(users.password === password){
                    res.json({message: "success"})
                    }else{
                    res.json({message: "Incorrect password"})
                }
            }else{
                res.json({msg: 'User not found'})
            }
        }) 
    } catch(err) {
        res.json({err})
    }
    
})

app.get('/users', async (req, res) => {
  try {
    const users = await UserModel.find({}, 'name studyTime'); // Only fetch username and studyTime
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
