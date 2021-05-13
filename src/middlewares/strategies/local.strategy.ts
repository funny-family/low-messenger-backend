import { Strategy as LocalStrategy, IVerifyOptions } from 'passport-local';

import { ErrorObjectConstructor } from '../../utils/error-object-constructor.class';
import { checkIfStringIsEmpty } from '../../utils/check-if-string-is-empty.function';

import { ChatModel } from '../../database/models/chat.model';

const usernameField = 'entry_key'; // LATTER REPLACE ON: 'entryKey'
const passwordField = 'password';

export const localStrategy = new LocalStrategy(
  {
    usernameField,
    passwordField,
    // passReqToCallback: true,
    session: false
  },
  // TODO: improve types!
  async (login, password, done) => {
    try {
      const errorName = 'Authentication error';
      const chat = await ChatModel.findOne({ entry_key: login }).exec();
      const wasChatFound = chat;
      // @ts-ignore
      const doesChatHaveAPassword = chat.has_password;
      // @ts-ignore
      const isChatPasswordValid = chat.verifyPassword(password);

      // login check
      if (!wasChatFound) {
        const verityError = new ErrorObjectConstructor({
          field: usernameField,
          message: 'Invalid key to enter the chat!',
          name: errorName
        });

        return done(verityError, false);
      }

      // password check
      if (doesChatHaveAPassword) {
        if (!isChatPasswordValid) {
          const verityError = new ErrorObjectConstructor({
            field: passwordField,
            message: 'Invalid password!',
            name: errorName
          });

          return done(verityError, false);
        }
      }

      return done(null, chat);
    } catch (error) {
      return done(error);
    }
  }
);
