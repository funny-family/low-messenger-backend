export const config = {
  port: 8800,
  secretOrKey: '99cb5be02351afa6f0e107443f421fbff8e53a7a0a5c312862af5bf3ea814d04',
  auth: {
    sessionCookieName: '__jid',
    jsonwebtoken: {
      algorithm: 'HS512'
    }
  }
};
