import express from 'express';

const app = express();

app.get('/healthcheck', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running'
  });
});

// Middleware for handling unhandled routes
// app.all('*', (req, res) => {
//   return res.status(404).json({
//     status: 'fail',
//     message: `Can't find ${req.originalUrl} on this server`
//   });
// });

export default app;
