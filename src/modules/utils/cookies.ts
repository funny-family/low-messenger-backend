import { Response } from 'express';

import { config } from '../../config'

export const setAuthCookies = (res: Response, value: string): void => {
  res.cookie(config.auth.sessionCookieName, value, {
    signed: true,
    httpOnly: true,
    secure: false // set "secure" to true is using "https"!
  });
};

export const resetAuthCookies = (res: Response): void => {
  res.cookie(config.auth.sessionCookieName, null);
};
