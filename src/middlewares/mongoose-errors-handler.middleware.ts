import { Request, Response, NextFunction } from 'express';


// export async function handleMongooseErrors(req: Request, res: Response, next: NextFunction) {
//   const statusCode = req.statusCode;

//   try {
//     await next();
//   } catch (error) {
//     console.log('error:', error);
//     console.log('statusCode:', statusCode);
//   }
// }

// https://expressjs.com/ru/guide/error-handling.html
// https://levelup.gitconnected.com/handling-errors-in-mongoose-express-for-display-in-react-d966287f573b
// https://www.robinwieruch.de/node-express-error-handling
// https://dev.to/nedsoft/central-error-handling-in-express-3aej
export function handleMongooseErrors(err: Error, req: Request, res: Response, next: NextFunction): void {
  // console.log('err.stack:', err.stack);

  try {
    next();
  } catch (error) {
    console.log(23424242323424,error);
  }
}
