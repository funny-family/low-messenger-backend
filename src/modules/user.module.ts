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
  // createUserRouteRateLimiter,
  (req: Request, res: Response) => {
    const userModel = new UserModel({
      name: req.body.name
      // avatar: req.body.avatar //soon!
    });

    userModel.save()
      .then((response) => {
        const userModelResponse = response.toJSON();
        res.status(201).json(userModelResponse);
      })
      .catch((errorObject) => {
        res.status(400).send(errorObject);
      });
  }
);

userApiV1.delete(
  '/delete-user-by-id/:id',
  (req: Request, res: Response) => {
    const userIdFromParams = req.params.id;

    UserModel.findOneAndDelete({ _id: userIdFromParams })
      .then((document) => {
        if (!document) {
          const response = {
            message: `Document with id: ${userIdFromParams} dose not exist!`
          };

          res.send(response).status(200);
        }

        const response = {
          ...document?.toJSON(),
          message: `User with id: ${userIdFromParams} is deleted!`
        };

        res.json(response).status(204);
      })
      .catch((error) => {
        res.status(500).json(error);
      });
  }
);
