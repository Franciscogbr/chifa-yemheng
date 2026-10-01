import { createApp } from './app.js';
import { env } from './config/env.js';

const app = createApp();

app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Chifa Yemheng API escuchando en http://localhost:${env.PORT}/api/v1`);
});
