import jwt from 'jsonwebtoken';

import { config } from '../../config';

export interface AuthTokens {
  accessToken: {
    value: string;
    expiresIn: string | number;
  };

  refreshToken: {
    value: string;
    expiresIn: string | number;
  };
}

/**
 * convert Date.now():
 * https://stackoverflow.com/questions/30158574/how-to-convert-result-from-date-now-to-yyyy-mm-dd-hhmmss-ffff
 *
 * user local time zone is:
 * https://stackoverflow.com/questions/1091372/getting-the-clients-time-zone-and-offset-in-javascript
 */

export const createAuthTokensWithUserId = (id: string): AuthTokens => {
  const payload = { id };
  // const payload = id;
  const secretOrPrivateKey = config.secretOrKey;
  const algorithm = 'HS512';

  // const oneSecond = 1000;
  // const oneMinute = oneSecond * 60;
  // const oneHour = oneMinute * 60;
  // const oneDay = oneHour * 24;

  const accessTokenExpirationTimeInMilliseconds = '5m'; // 5min
  // const accessTokenExpirationTimeInMilliseconds = '1h'; // 1h
  const accessToken = jwt.sign(payload, secretOrPrivateKey, {
    algorithm,
    expiresIn: accessTokenExpirationTimeInMilliseconds
  });

  const refreshTokenExpirationTimeInMilliseconds = '30 days'; // 30days
  const refreshToken = jwt.sign(payload, secretOrPrivateKey, {
    algorithm,
    expiresIn: refreshTokenExpirationTimeInMilliseconds
  });

  const authTokens: AuthTokens = {
    accessToken: {
      value: accessToken,
      expiresIn: accessTokenExpirationTimeInMilliseconds
    },

    refreshToken: {
      value: refreshToken,
      expiresIn: refreshTokenExpirationTimeInMilliseconds
    }
  };

  return authTokens;
};

export const decodeJwtToken = (token: string): null | { [key: string]: any } | string => {
  return jwt.decode(token);
}

export const verifyJwtToken = (token: string): null | { [key: string]: any } | string => {
  return jwt.verify(token, config.secretOrKey);
}
