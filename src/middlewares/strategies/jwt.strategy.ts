import { Strategy as JwtStrategy, StrategyOptions, VerifyCallbackWithRequest } from 'passport-jwt';

import { BlackTokenModel } from '../../database/models/black-token.model';
import { UserModel } from '../../database/models/user.model';

import { config } from '../../config';

const options: StrategyOptions = {
  passReqToCallback: true,
  ignoreExpiration: false,
  secretOrKey: config.secretOrKey,
  jwtFromRequest: (req): string | null => {
    return req.headers.authorization!;
  }
};

const verify: VerifyCallbackWithRequest = async (req, payload, done): Promise<void> => {
  const accessToken = req.headers.authorization;
  const deniedAccessToken = await BlackTokenModel.findOne({ token: accessToken });
  if (deniedAccessToken) return done(null, false, { message: 'Token is blacklisted!' });

  const userId = payload.id;
  const user = await UserModel.findOne({ _id: userId }).exec();
  if (!user) return done(null, false, { message: 'User not found!' });

  return done(null, user);
};

export const jwtStrategy = new JwtStrategy(options, verify);
