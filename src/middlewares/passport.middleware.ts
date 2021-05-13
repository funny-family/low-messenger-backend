import passport from 'passport';

import { localStrategy } from './strategies/local.strategy';

passport.use('local', localStrategy);

export {
  passport
};
