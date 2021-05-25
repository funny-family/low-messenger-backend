import { Router, Request, Response, NextFunction } from 'express';
import rateLimit, { RateLimit } from 'express-rate-limit';

import { ChatModel } from '../database/models/chat.model';

import { ResponseObject } from '../utils/api';
import { ErrorObjectConstructor } from '../utils/error-object-constructor.class';
import { checkIfStringIsEmpty } from '../utils/check-if-string-is-empty.function';

export const chatApiV1 = Router();

const createChatRouteRateLimiter: RateLimit = rateLimit({
  windowMs: 5 * 6 * 1000, // 5min
  max: 4,
  message: 'Too many requests from this IP, please try again latter!'
});
chatApiV1.post(
  '/chat',
  // handleMongooseErrors,
  createChatRouteRateLimiter,
  async (req: Request, res: Response) => {
    const headers = {
      'Content-Type': 'application/json; charset=utf-8'
    };

    try {
      const chatModel = new ChatModel({
        name: req.body.name,
        owner_id: req.body.owner_id,
        password: req.body.password,
        password_confirmation: req.body.password_confirmation,
        user_IDs: req.body.user_IDs
      });

      const chatData = await chatModel.save();

      const statusCode = 201;
      const savedChatData = chatData.toJSON();
      const responseData = new ResponseObject({
        data: {
          title: 'Created new user.',
          attributes: {
            ...savedChatData
          }
        },
        errors: {}
      });

      res.set(headers);
      res.status(statusCode);
      res.json(responseData);

      return;
    } catch (error) {
      try {
        const errorObject = {
          ...error.errors,
          message: error.message
        };

        const statusCode = 400;
        const responseData = new ResponseObject({
          data: {},
          errors: {
            ...errorObject,
            status: statusCode,
            title: 'Cannot create user!'
          }
        });

        res.set(headers);
        res.status(statusCode);
        res.json(responseData);

        return;
      } catch (error) {
        const errorObject = {
          ...error.errors,
          message: error.message
        };

        const statusCode = 500;
        const responseData = new ResponseObject({
          data: {},
          errors: {
            ...errorObject,
            status: statusCode,
            title: 'Something went wrong on our side!'
          }
        });

        res.set(headers);
        res.status(statusCode);
        res.json(responseData);

        return;
      }
    }
  }
);

chatApiV1.delete(
  '/chat/:entry_key',
  // ratelimiter
  async (req: Request, res: Response) => {
    const headers = {
      'Content-Type': 'application/json; charset=utf-8'
    };

    try {
      const entryKey = req.params.entry_key;
      const chat = await ChatModel.findOneAndDelete({ entry_key: entryKey });

      if (!chat) {
        throw new Error('Chat not found!');
      }

      const statusCode = 204;

      res.set(headers);
      res.status(statusCode);
      res.end();

      return;
    } catch (error) {
      try {
        const errorObject = {
          ...error.errors,
          message: error.message
        };

        const statusCode = 404;
        const responseData = new ResponseObject({
          data: {},
          errors: {
            ...errorObject,
            status: statusCode,
            title: 'Mongo error!'
          }
        });

        res.set(headers);
        res.status(statusCode);
        res.json(responseData);

        return;
      } catch (error) {
        const statusCode = 500;
        const responseData = new ResponseObject({
          data: {},
          errors: {
            ...error,
            status: statusCode,
            title: 'Something went wrong on our side!'
          }
        });

        res.set(headers);
        res.status(statusCode);
        res.json(responseData);

        return;
      }
    }
  }
);

chatApiV1.post(
  '/find-by-entry-key/:entry_key',
  // ratelimiter
  async (req: Request, res: Response) => {
    try {
      const entryKey = await req.params.entry_key;
      const isEntryKeyEmpty = entryKey.length === 0;

      if (isEntryKeyEmpty) {
        const responseData = 'Entry key is required!';

        res.status(400).json(responseData);
        return;
      }

      const chat = await ChatModel.findOne({ entry_key: entryKey }).exec();
      const wasFound = !!chat;

      const responseData = {
        was_found: wasFound,
        has_password: chat?.has_password
      };

      if (!wasFound) {
        res.status(404).json(responseData);
        return;
      }

      res.status(200).json(responseData);
    } catch (error) {
      res.status(500).json(error);
    }
  }
);

chatApiV1.get(
  '/chat',
  // ratelimiter
  async (req: Request, res: Response, next: NextFunction) => {
    const headers = {
      'Content-Type': 'application/json; charset=utf-8'
    };

    try {
      const entryKey = await req.body.entry_key;
      const password = await req.body.password;

      const isEntryKeyEmpty = checkIfStringIsEmpty(entryKey);
      if (isEntryKeyEmpty) {
        const statusCode = 401;
        const errorObject = new ErrorObjectConstructor({
          field: 'entry_key',
          message: 'Entry key value is empty!',
          name: 'Authentication error'
        });
        const responseData = new ResponseObject({
          data: {},
          errors: {
            // @ts-ignore
            ...errorObject.errors,
            status: statusCode,
            title: 'Cannot join to chat!'
          }
        });

        res.set(headers);
        res.status(statusCode);
        res.json(responseData);
        return;
      }

      const chat = await ChatModel.findOne({ entry_key: entryKey }).exec();
      const wasChatFound = !!chat;

      if (!wasChatFound) {
        const statusCode = 401;
        const errorObject = new ErrorObjectConstructor({
          field: 'entry_key',
          message: 'Chat not found!',
          name: 'Authentication error'
        });
        const responseData = new ResponseObject({
          data: {},
          errors: {
            // @ts-ignore
            ...errorObject.errors,
            status: statusCode,
            title: 'Cannot join to chat!'
          }
        });

        res.set(headers);
        res.status(statusCode);
        res.json(responseData);

        return;
      }

      if (wasChatFound) {
        // @ts-ignore
        const doesChatHaveAPassword = chat.has_password;
        // @ts-ignore
        const isChatPasswordValid = chat.verifyPassword(password);

        if (doesChatHaveAPassword) {
          const isPasswordEmpty = checkIfStringIsEmpty(password);

          if (isPasswordEmpty) {
            const statusCode = 200;
            const chatData = { has_password: chat?.has_password };
            const responseData = new ResponseObject({
              data: {
                title: 'Joining the chat!',
                attributes: {
                  ...chatData
                }
              },
              errors: {}
            });

            res.set(headers);
            res.status(statusCode);
            res.json(responseData);

            return;
          }

          if (!isPasswordEmpty) {
            if (!isChatPasswordValid) {
              const statusCode = 401;
              const errorObject = new ErrorObjectConstructor({
                field: 'password',
                message: 'Invalid password!',
                name: 'Authentication error'
              });
              const responseData = new ResponseObject({
                data: {},
                errors: {
                  // @ts-ignore
                  ...errorObject.errors,
                  status: statusCode,
                  title: 'Cannot join to chat!'
                }
              });

              res.set(headers);
              res.status(statusCode);
              res.json(responseData);

              return;
            }

            if (isChatPasswordValid) {
              const statusCode = 200;
              const chatData = chat?.toJSON();
              const responseData = new ResponseObject({
                data: {
                  title: 'Joining the chat!',
                  attributes: {
                    ...chatData
                  }
                },
                errors: {}
              });

              res.set(headers);
              res.status(statusCode);
              res.json(responseData);

              return;
            }
          }
        }

        if (!doesChatHaveAPassword) {
          const statusCode = 200;
          const chatData = chat?.toJSON();
          const responseData = new ResponseObject({
            data: {
              title: 'Joining the chat!',
              attributes: {
                ...chatData
              }
            },
            errors: {}
          });

          res.set(headers);
          res.status(statusCode);
          res.json(responseData);

          return;
        }
      }
    } catch (error) {
      const errorObject = {
        ...error.errors,
        message: error.message
      };

      const statusCode = 500;
      const responseData = new ResponseObject({
        data: {},
        errors: {
          ...errorObject,
          status: statusCode,
          title: 'Something went wrong on our side!'
        }
      });

      res.set(headers);
      res.status(statusCode);
      res.json(responseData);

      return;
    }
  }
);
