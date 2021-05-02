import express from 'express';

import { chatApiV1 } from './modules/chat.module';

const app = express();
const port = 8000;

app.use('/api/v1', chatApiV1);

app.listen(port, () => {
  console.log('\x1b[36m', `Server running at: http://localhost:${port}/`);
});
