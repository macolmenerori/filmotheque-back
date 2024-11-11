import type { NextFunction, Request as RequestExpress, Response } from 'express';

import { MovieSearchTrakt } from '../models/moviesTypes';
import { UserType } from '../models/userTypes';
import catchAsync from '../utils/catchAsync';

type Request = RequestExpress & {
  user?: UserType;
};

export const searchTraktMovieByTitle = catchAsync(async (req: Request, res: Response) => {
  const { title } = req.query;

  const traktRes = await fetch(`${process.env.TRAKT_API_URL}/search/movie?query=${title}`, {
    headers: {
      'Content-Type': 'application/json',
      'trakt-api-version': '2',
      'trakt-api-key': `${process.env.TRAKT_CLIENT_ID}`
    }
  });

  if (traktRes.status !== 200) {
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong. Please try again later.'
    });
  }

  const parsedResults = (await traktRes.json()) as MovieSearchTrakt[];

  if (parsedResults.length === 0) {
    return res.status(404).json({
      status: 'fail',
      message: 'No movies found with that title'
    });
  }

  // Get only the first 5 results
  const movies = parsedResults.map((movie: MovieSearchTrakt) => movie.movie).slice(0, 5);

  return res.status(200).json({
    status: 'success',
    message: 'Movies retrieved',
    movies: movies
  });
});

// Middleware to allow only logged in users to access certain routes
export const protect = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // 1) Getting token and check if it's there
  // The token can be sent in the headers or in the cookies
  let token: string | undefined;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return res.status(401).json({
      status: 'fail',
      message: 'You are not logged in! Please log in to get access.'
    });
  }

  // 2. Verify token
  const authRes = await fetch(`${process.env.AUTH_URL}/users/isloggedin`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (authRes.status === 401) {
    return res.status(401).json({
      status: 'fail',
      message: 'You are not logged in! Please log in to get access.'
    });
  } else if (authRes.status !== 200) {
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong. Please try again later.'
    });
  }

  // Parse the response body
  const authData = await authRes.json();

  // 3. Grant access and save user info
  req.user = authData.data.user as UserType;
  next();
});
