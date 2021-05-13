import { Router, Request, Response, NextFunction } from 'express';
import rateLimit, { RateLimit } from 'express-rate-limit';

import { passport } from '../middlewares/passport.middleware';
// import { handleMongooseErrors } from '../middlewares/mongoose-errors-handler.middleware'

import { ChatModel, IChatSchema } from '../database/models/chat.model';

import { ErrorObjectConstructor } from '../utils/error-object-constructor.class';

import axios from 'axios';

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

    chatModel
      .save()
      .then((document) => {
        const response = document.toJSON();
        res.json(response).status(201);
      })
      .catch((error) => {
        res.json(error).status(500);
      });
  }
);

chatApiV1.post('/find-chat-by-entry-key/:entry_key', async (req: Request, res: Response) => {
  try {
    const chatEntryKey = req.params.entry_key;
    const chat = await ChatModel.findOne({ entry_key: chatEntryKey }).exec();
    const wasChatFound = chat;

    if (!wasChatFound) {
      const errorObject = new ErrorObjectConstructor({
        field: 'entry_key',
        message: 'Chat not found!'
      });

      res.json(errorObject).status(404);
    }

    const responseData = chat?.toJSON();
    // // @ts-ignore
    // delete responseData?.user_IDs;
    // // @ts-ignore
    // delete responseData?.name;
    // // @ts-ignore
    // delete responseData?.owner_id;
    // // @ts-ignore
    // delete responseData?.createdAt;
    // // @ts-ignore
    // delete responseData?.updatedAt;

    res.json(responseData).status(200);
  } catch (error) {
    res.json(error).status(500);
  }
});

/**
 * watch this!:
 * https://github.com/koalex/node-lesson-messages
 * https://github.com/koalex/node-lesson-messages/blob/master/models/message.js
 *
 * https://github.com/koalex/vki-ngu-node
 * https://github.com/koalex/vki-ngu-node/tree/master/modules/chat
 */
const joinChatRouteLimiter: RateLimit = rateLimit({
  windowMs: 5 * 6 * 1000, // 5min
  max: 4,
  message: 'Too many requests from this IP, please try again latter!'
});
chatApiV1.post(
  '/join-chat',
  // joinChatRouteLimiter,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const chatEnterKey = req.body.entry_key;

      const fetchedChatData = await axios({
        method: 'POST',
        url: `http://localhost:8800/api/v1/find-chat-by-entry-key/${chatEnterKey}`
      });

      const chat: IChatSchema = fetchedChatData.data;
      const doesChatHaveAPassword = chat.has_password;

      if (!doesChatHaveAPassword) {
        return res.json(chat).status(200);
      }

      passport.authenticate(
        'local',
        { session: false, failWithError: true },
        (err, options, info) => {
          if (err) {
            res.json(err).status(401);
          }

          const responseData = options;
          res.json(responseData).status(200);
        }
      )(req, res, next);
    } catch (error) {
      res.json(error).status(500);
    }
  }
);
