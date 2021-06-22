import passport from 'passport';

import { localStrategy } from './strategies/local.strategy';
import { jwtStrategy } from './strategies/jwt.strategy';

const strategy = {
  local: 'local',
  jwt: 'jwt'
};

passport.use(strategy.local, localStrategy);
passport.use(strategy.jwt, jwtStrategy);

export { passport, strategy };
