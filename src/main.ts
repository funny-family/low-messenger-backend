import express from 'express';
import responseTime from 'response-time';
// https://stackoverflow.com/questions/10183291/how-to-get-the-full-url-in-express
import { Server } from 'http';

import dotenv from 'dotenv';
dotenv.config();

import { passport } from './middlewares/passport.middleware';

import { chatApiV1 } from './modules/chat.module';
import { userApiV1 } from './modules/user.module';

const app = express();
const server = new Server(app);
const port = process.env.PORT || 8800;

app.use(responseTime());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());

// app.use(handleMongooseErrors);

app.use('/api/v1', chatApiV1);
app.use('/api/v1', userApiV1);

server.listen(port, () => {
  console.log('\x1b[36m', `Server running at: http://localhost:${port}/`);
  // console.log(1213213);
});
