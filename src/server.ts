/* eslint-disable no-console */
import dotenv from 'dotenv';
dotenv.config({ path: './config.env' });

import mongoose from 'mongoose';

import checkEnvVars from './utils/checkEnvVars';
import app from './app';

// Check that all env vars are set up
if (checkEnvVars()) {
  process.exit(1);
}

process.on('uncaughtException', (err: Error) => {
  console.log(err.name, err.message);
  console.log('UNCAUGHT EXCEPTION! Shutting down...');
  process.exit(1);
});

// Connect to DB
if (!process.env.DATABASE) {
  console.log('No database found');
  process.exit(1);
}

mongoose
  .connect(process.env.DATABASE, {
    // useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false
  })
  .then(() => console.log('DB connection successful!'));

const port = process.env.PORT || 8080;

const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', (err: Error) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION! Shutting down...');
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('SIGTERM RECEIVED. Shutting down gracefully.');
  server.close(() => {
    console.log('Process terminated!');
  });
});
