import express, { Request, Response } from 'express';
import { Server } from 'http';
import path from 'path';

import responseTime from 'response-time';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import dotenv from 'dotenv';
dotenv.config();

import { config } from './config';

import { passport } from './middlewares/passport.middleware';

import { chatApiV1 } from './modules/chat.module';
import { userApiV1 } from './modules/user.module';

const app = express();
const server = new Server(app);
const port = process.env.PORT || config.port;

app.use(
  responseTime({
    digits: 6
  })
);
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true
  })
);
app.use(cookieParser(config.secretOrKey));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/v1', chatApiV1);
app.use('/api/v1', userApiV1);

app.use('/', express.static(path.join(__dirname, './client/')));

server.listen(port, () => {
  console.log('\x1b[36m', `Server running at: http://localhost:${port}/`);
});
