import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import mongoSanitize from 'express-mongo-sanitize';

import moviesRouter from './routes/moviesRouter';

const app = express();

const cors_whitelist = process.env.CORS_WHITELIST ? process.env.CORS_WHITELIST.split(',') : [];
const corsOptions = {
  origin: function (
    origin: string | undefined,
    // eslint-disable-next-line no-unused-vars
    callback: (err: Error | null, allow?: boolean) => void
  ) {
    // Check if the origin is in the whitelist
    if (cors_whitelist.indexOf(origin!) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // Allow credentials (cookies) to be sent
};

app.use(cors(corsOptions));

// Handle preflight requests for complex requests (e.g., with credentials)
app.options('*', cors(corsOptions));

// TODO: add security HTTP headers

// TODO: add rate limit

// Middleware, modifies incoming data. For parsing JSON bodies on POST requests
app.use(express.json({ limit: '1024kb' })); // Do not accept bodies bigger than 1 megabyte

// Middleware, modifies incoming data. For parsing URL encoded forms
app.use(express.urlencoded({ extended: true, limit: '10kb' })); // Do not accept bodies bigger than 10 kilobytes

app.use(cookieParser()); // Parse cookies

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Compress responses
app.use(compression());

app.get('/healthcheck', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running'
  });
});

app.use('/api/v1/movies', moviesRouter);

// Middleware for handling unhandled routes
// app.all('*', (req, res) => {
//   return res.status(404).json({
//     status: 'fail',
//     message: `Can't find ${req.originalUrl} on this server`
//   });
// });

export default app;
