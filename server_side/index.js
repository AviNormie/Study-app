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

mongoose.connect(`mongodb+srv://avisrivastava:aviissexy@cluster-main.nd18g.mongodb.net/study-app`)
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
// app.use('/api/timer', timerRoutes);
// app.use('/api/leaderboard', leaderboardRoutes);
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

app.post('/sign-up',(req, res) => {
    UserModel.create(req.body)
    .then(users => res.json(users))
    .catch(err => res.json({err}))
})
// Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
