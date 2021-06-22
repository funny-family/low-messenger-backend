import { Router, Request, Response, CookieOptions } from 'express';
// import rateLimit, { RateLimit } from 'express-rate-limit';

import { UserModel } from '../database/models/user.model';
import { BlackTokenModel } from '../database/models/black-token.model';

import { ResponseObject } from '../utils/api';
import { createAuthTokensWithUserId, decodeJwtToken, verifyJwtToken } from './utils/jwt';

import { passport, strategy } from '../middlewares/passport.middleware';
import { config } from '../config';

export const userApiV1 = Router();

userApiV1.get(
  '/auth/test',
  passport.authenticate(strategy.jwt, { session: false, failWithError: true }),
  (req: Request, res: Response) => {
    res.status(200).send('<h1>TEST!</h1>');
  }
);

userApiV1.post('/auth/refresh', async (req: Request, res: Response) => {
  const accessToken = req.headers.authorization;
  const refreshToken = req.signedCookies[config.auth.sessionCookieName];

  // console.log('accessToken from authorization header:', accessToken);

  if (!refreshToken) {
    const statusCode = 404;
    const responseData = new ResponseObject({
      data: {},
      errors: {
        status: statusCode,
        title: 'One of the tokens is not found!'
      }
    });

    res.status(statusCode);
    res.json(responseData);

    return;
  }

  const checkIfTokenIsJwt = (token: string): boolean => {
    const jwtRegExp = /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/;
    const isJwtToken = jwtRegExp.test(token);

    return isJwtToken;
  };

  if (!checkIfTokenIsJwt(refreshToken)) {
    const statusCode = 400;
    const responseData = new ResponseObject({
      data: {},
      errors: {
        status: statusCode,
        title: 'One of the tokens is not valid!'
      }
    });

    res.status(statusCode);
    res.json(responseData);

    return;
  }

  try {
    try {
      const accessBlackToken = await BlackTokenModel.findOne({ token: accessToken }).exec();
      const isAccessBlackTokenFound = !!accessBlackToken;

      if (isAccessBlackTokenFound) {
        const statusCode = 401;
        const responseData = new ResponseObject({
          data: {},
          errors: {
            status: statusCode,
            title: 'Cannot used invalid token!'
          }
        });

        res.status(statusCode);
        res.json(responseData);

        return;
      }
      console.log('accessBlackToken:', accessBlackToken);
    } catch (error) {
      console.log('error:', error);
    }

    console.log('verifyJwtToken:', verifyJwtToken(accessToken!));

    try {
      const blackTokenModel = new BlackTokenModel({ token: accessToken });
      await blackTokenModel.save();
    } catch (error) {
      console.log('accessBlackTokenModel error:', error);
    }

    const decodedAccessToken = decodeJwtToken(accessToken!);
    // @ts-ignore
    const currentUserId = decodedAccessToken['id'];
    const authTokens = createAuthTokensWithUserId(currentUserId);

    const statusCode = 200;
    const responseData = {
      accessToken: authTokens.accessToken.value,
      expiresIn: authTokens.accessToken.expiresIn
    };

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

      res.status(statusCode);
      res.json(responseData);

      return;
    }
  }
});

userApiV1.post('/auth/clear', async (req: Request, res: Response) => {
  try {
    const jidCookie = config.auth.sessionCookieName;
    const statusCode = 204;

    res.status(statusCode);
    res.cookie(jidCookie, null);

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

    res.status(statusCode);
    res.json(responseData);

    return;
  }
});

// const createUserRouteRateLimiter: RateLimit = rateLimit({
//   windowMs: 5 * 6 * 1000, // 5min
//   max: 4,
//   message: 'Too many requests from this IP, please try again latter!'
// });
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
      const authTokens = createAuthTokensWithUserId(userData.id);

      const statusCode = 201;
      const savedUserData = userData.toJSON();
      const responseData = new ResponseObject({
        data: {
          title: 'Created new user.',
          attributes: {
            ...savedUserData,
            authTokens
          }
        },
        errors: {}
      });
      const cookieData = {
        name: config.auth.sessionCookieName,
        value: authTokens.refreshToken.value,
        options: {
          signed: true,
          httpOnly: true,
          secure: false // set "secure" to true if using "https"!
        } as CookieOptions
      };

      res.set(headers);
      res.status(statusCode);
      res.cookie(cookieData.name, cookieData.value, cookieData.options);
      res.json(responseData);

      // console.log('authTokens:', authTokens);
      // console.log('sessionCookieName:', req.signedCookies[config.auth.sessionCookieName]);
      // console.log('authTokens.refreshToken.value:', authTokens.refreshToken.value);

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
