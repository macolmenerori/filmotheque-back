/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import { NextFunction, Request, Response } from 'express';

const catchAsync =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch((e) => {
      // In Express v5, we can rely on automatic promise rejection handling
      // but we'll keep this for explicit error handling and logging
      console.error('Async error caught:', e);
      return res.status(500).json({
        status: 'fail',
        message: 'Internal server error'
      });
    });
  };

export default catchAsync;
