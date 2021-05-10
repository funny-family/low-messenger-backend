import { Router, Request, Response } from 'express';
import rateLimit, { RateLimit } from 'express-rate-limit';

import { UserModel } from '../database/models/user.model';

export const userApiV1 = Router();

const createUserRouteRateLimiter: RateLimit = rateLimit({
  windowMs: 5 * 6 * 1000, // 5min
  max: 4,
  message: 'Too many requests from this IP, please try again latter!'
});
userApiV1.post(
  '/create-user',
  createUserRouteRateLimiter,
  (req: Request, res: Response) => {
    const userModel = new UserModel({
      name: req.body.name
      // avatar: req.body.avatar //soon!
    });

    const userModelErrorObject = userModel.validateSync();
    if (userModelErrorObject) {
      res.status(400).send(userModelErrorObject);
    }

    const userModelResponse = userModel.toJSON();
    userModel.save();
    res.status(201).send(userModelResponse);
  }
);