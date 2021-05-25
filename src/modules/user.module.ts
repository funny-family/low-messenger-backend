import { Router, Request, Response } from 'express';
import rateLimit, { RateLimit } from 'express-rate-limit';

import { UserModel } from '../database/models/user.model';

import { ResponseObject } from '../utils/api';

export const userApiV1 = Router();

const createUserRouteRateLimiter: RateLimit = rateLimit({
  windowMs: 5 * 6 * 1000, // 5min
  max: 4,
  message: 'Too many requests from this IP, please try again latter!'
});
userApiV1.post(
  '/user',
  // createUserRouteRateLimiter,
  async (req: Request, res: Response) => {
    const headers = {
      'Content-Type': 'application/json; charset=utf-8'
    };

    try {
      const userModel = new UserModel({
        name: req.body.name
        // avatar: req.body.avatar //soon!
      });

      const userData = await userModel.save();

      const statusCode = 201;
      const savedUserData = userData.toJSON();
      const responseData = new ResponseObject({
        data: {
          title: 'Created new user.',
          attributes: {
            ...savedUserData
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
            title: 'Validation Error!'
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

userApiV1.get(
  '/user/:id',
  // rateLimiter
  async (req: Request, res: Response) => {
    const headers = {
      'Content-Type': 'application/json; charset=utf-8'
    };

    try {
      const userId = req.params.id;
      const user = await UserModel.findOne({ _id: userId }).exec();

      if (!user) {
        throw new Error('User not found!');
      }

      const userData = user?.toJSON();

      const statusCode = 200;
      const responseData = new ResponseObject({
        data: {
          title: 'Got user by id.',
          attributes: {
            ...userData
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

userApiV1.delete(
  '/user/:id',
  // rateLimiter
  async (req: Request, res: Response) => {
    const headers = {
      'Content-Type': 'application/json; charset=utf-8'
    };

    try {
      const id = req.params.id;
      const user = await UserModel.findOneAndDelete({ _id: id }).exec();

      if (!user) {
        throw new Error('User not found!');
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
