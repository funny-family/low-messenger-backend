import express from 'express';
import { Server } from 'http';

// import io from 'socket.io'

import dotenv from 'dotenv';
dotenv.config();

import { chatApiV1 } from './modules/chat.module';

const app = express();
const server = new Server(app);
const port = 8000;

app.use('/api/v1', chatApiV1);

server.listen(port, () => {
  console.log('\x1b[36m', `Server running at: http://localhost:${port}/`);
});
