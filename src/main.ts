import express from 'express';
import { Server } from 'http';

import dotenv from 'dotenv';
dotenv.config();

// import { handleMongooseErrors } from './middlewares/mongoose-errors-handler.middleware';

import { chatApiV1 } from './modules/chat.module';
import { userApiV1 } from './modules/user.module';

const app = express();
const server = new Server(app);
const port = process.env.PORT || 8800;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use(handleMongooseErrors);

app.use('/api/v1', chatApiV1);
app.use('/api/v1', userApiV1);

server.listen(port, () => {
  console.log('\x1b[36m', `Server running at: http://localhost:${port}/`);
});
