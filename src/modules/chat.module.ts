import { Router, Request, Response } from 'express';

export const chatApiV1 = Router();

chatApiV1.post('/create-chat', (req: Request, res: Response) => {
  res.send('create-chat');
});

chatApiV1.post('/join-chat', (req: Request, res: Response) => {
  res.send('join-chat');
});
