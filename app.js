import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import route from "./routes/routes.js";

dotenv.config();
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Be cautious with this in production
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

app.use(cors({ origin: "*" }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('Server is up and running!');
});

const PORT = process.env.PORT || 5000;

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.use('/api', route);

// Export io so it can be used in other files
export { io };