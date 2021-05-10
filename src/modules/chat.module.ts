import { Router, Request, Response } from 'express';
import rateLimit, { RateLimit } from 'express-rate-limit';

import { ChatModel } from '../database/models/chat.model';

// import { handleMongooseErrors } from '../middlewares/mongoose-errors-handler.middleware'

export const chatApiV1 = Router();

const createChatRouteRateLimiter: RateLimit = rateLimit({
  windowMs: 5 * 6 * 1000, // 5min
  max: 4,
  message: 'Too many requests from this IP, please try again latter!'
});
chatApiV1.post(
  '/create-chat',
  // handleMongooseErrors,
  createChatRouteRateLimiter,
  (req: Request, res: Response) => {
    // const chatModel = new ChatModel({
    //   name: req.body.name,
    //   owner_id: req.body.ownerId,
    //   password: req.body.password,
    //   password_confirmation: req.body.passwordConfirmation,
    //   user_IDs: req.body.userIDs
    // });

    const chatModel = new ChatModel({
      name: req.body.name,
      owner_id: req.body.owner_id,
      password: req.body.password,
      password_confirmation: req.body.password_confirmation,
      user_IDs: req.body.user_IDs
    });

    const chatModelErrorObject = chatModel.validateSync();
    if (chatModelErrorObject) {
      res.status(400).send(chatModelErrorObject);
    }

    const chatModelResponse = chatModel.toJSON();
    chatModel.save();
    res.status(201).json(chatModelResponse);
  }
);

const joinChatRouteLimiter: RateLimit = rateLimit({
  windowMs: 5 * 6 * 1000, // 5min
  max: 4,
  message: 'Too many requests from this IP, please try again latter!'
});
chatApiV1.post(
  '/join-chat',
  joinChatRouteLimiter,
  (req: Request, res: Response) => {
    res.send('join-chat');
  }
);
