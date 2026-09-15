import 'dotenv/config';
import app from './app.js';
import prisma from './config/prisma.js';

const port = Number(process.env.PORT || 5000);

async function start() {
  try {
    await prisma.$connect();
    app.listen(port, () => {
      console.log(`MandiMitra API listening on http://localhost:${port}`);
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();
