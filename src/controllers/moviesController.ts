import type { NextFunction, Request as RequestExpress, Response } from 'express';

import Movie from '../models/moviesModel';
import { MovieSearchTrakt } from '../models/moviesTypes';
import { Movie as MovieType } from '../models/moviesTypes';
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

export const addMovieToCollection = catchAsync(async (req: Request, res: Response) => {
  // TODO: validation on POST body
  // const validation = checkValidation(req, res);
  // if (validation !== undefined) {
  //   return validation;
  // }
  const newMovie = await Movie.create(req.body);

  return res.status(201).json({
    status: 'success',
    message: 'Movie added to collection',
    data: {
      movie: newMovie
    }
  });
});

export const deleteMovieFromCollection = catchAsync(async (req: Request, res: Response) => {
  const id = req.query.id as string;

  // TODO: check validation
  //   const validation = checkValidation(req, res);
  //   if (validation !== undefined) {
  //     return validation;
  //   }

  if (!id) {
    return res.status(400).json({
      status: 'fail',
      message: 'Please provide an id and a user'
    });
  }

  const movieToDelete = await Movie.findOneAndDelete({ id, user: req.user?.email });

  if (!movieToDelete) {
    return res.status(404).json({
      status: 'fail',
      message: 'Movie not found on library'
    });
  }

  return res.status(204).json({
    status: 'success',
    message: 'Movie deleted from collection'
  });
});

export const getAllMovies = catchAsync(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const perpage = Number(req.query.perpage) || 10;

  // Calculate the number of movies to skip
  const skip = (page - 1) * perpage;

  // Retrieve the movies from the database of a specific user
  const movies = await Movie.find({ user: req.user?.email }).skip(skip).limit(perpage);

  // Count the total number of movies for metadata
  const totalMovies = await Movie.countDocuments({ user: req.user?.email });

  return res.status(200).json({
    status: 'success',
    message: 'Movies retrieved',
    data: {
      movies
    },
    pagination: {
      totalCount: totalMovies,
      currentPage: page,
      totalPages: Math.ceil(totalMovies / perpage)
    }
  });
});

export const updateMovie = catchAsync(async (req: Request, res: Response) => {
  // TODO: validation
  //   const validation = checkValidation(req, res);
  //   if (validation !== undefined) {
  //     return validation;
  //   }

  const movieId = req.body.id as string;
  delete req.body.id;

  const updatedMovie = await Movie.findOneAndUpdate(
    { user: req.user?.email, id: movieId },
    { ...req.body },
    { new: true, runValidators: true }
  );

  if (!updatedMovie) {
    return res.status(404).json({
      status: 'fail',
      message: 'Movie not found'
    });
  }

  return res.status(200).json({
    status: 'success',
    message: 'Movie updated',
    data: {
      movie: updatedMovie
    }
  });
});

export const getFullMovie = catchAsync(async (req: Request, res: Response) => {
  const id = req.query.id as string;

  if (!id) {
    return res.status(400).json({
      status: 'fail',
      message: 'Please provide an id'
    });
  }

  const fullMovie = await Movie.findOne({ id, user: req.user?.email });

  if (!fullMovie) {
    return res.status(404).json({
      status: 'fail',
      message: 'Movie not found'
    });
  }

  return res.status(200).json({
    status: 'success',
    message: 'Movie retrieved',
    data: {
      movie: fullMovie
    }
  });
});

export const exportUserData = catchAsync(async (req: Request, res: Response) => {
  const user = req.user?.email;

  // Create an streaming of the data
  res.setHeader('Content-Disposition', `attachment; filename=export-${user?.split('@')[0]}.json`);
  res.setHeader('Content-Type', 'application/json');

  const cursor = await Movie.find({ user });
  res.write('[');

  let isFirst = true;
  cursor.forEach((doc) => {
    if (!isFirst) {
      res.write(','); // Add comma between documents
    }
    res.write(JSON.stringify(doc));
    isFirst = false;
  });

  res.write(']'); // Close JSON array
  res.end();
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
