import { load } from 'cheerio';
import type { NextFunction, Request as RequestExpress, Response } from 'express';
import { validationResult } from 'express-validator';
import fs from 'fs';

import Movie from '../models/moviesModel';
import { MovieSearchTrakt } from '../models/moviesTypes';
import { Movie as MovieType } from '../models/moviesTypes';
import { UserType } from '../models/userTypes';
import catchAsync from '../utils/catchAsync';

type Request = RequestExpress & {
  user?: UserType;
};

/**
 * Checks if the validation has errors and sends a response if it does
 *
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 */
const checkValidation = (req: Request, res: Response) => {
  const validationRes = validationResult(req);
  if (!validationRes.isEmpty()) {
    return res.status(400).json({
      status: 'fail',
      message: 'Invalid input data',
      errors: validationRes.array()
    });
  }
};

export const searchTraktMovieByTitle = catchAsync(async (req: Request, res: Response) => {
  const validation = checkValidation(req, res);
  if (validation !== undefined) {
    return validation;
  }

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
  const validation = checkValidation(req, res);
  if (validation !== undefined) {
    return validation;
  }

  // If no movie ID is provided, generate a random one
  if (req.body.id === undefined || req.body.id === '') {
    req.body.id = Math.random().toString(36).substring(7);
  }

  // Try to get movie poster
  if (req.body.meta_ids && req.body.meta_ids.tmdb) {
    req.body.poster_url = await getMoviePoster(req.body.meta_ids.tmdb);
  } else {
    req.body.poster_url = '';
  }

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
  const validation = checkValidation(req, res);
  if (validation !== undefined) {
    return validation;
  }

  const id = req.query.id as string;

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
  const sortBy = (req.query.sortBy as string) || '';
  const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1; // default is ascending
  const filterWatched =
    req.query.watched === 'true' ? true : req.query.watched === 'false' ? false : undefined;
  const filterBackedUp =
    req.query.backedUp === 'true' ? true : req.query.backedUp === 'false' ? false : undefined;

  if (req.user?.email === undefined) {
    return res.status(400).json({
      status: 'fail',
      message: 'User not found'
    });
  }

  // PAGINATION
  const skip = (page - 1) * perpage; // Calculate the number of movies to skip

  // FILTERING
  const filter: Record<string, string | number | boolean> = { user: req.user?.email };
  if (filterWatched !== undefined) filter.watched = filterWatched;
  if (filterBackedUp !== undefined) filter.backedUp = filterBackedUp;

  // SORTING
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sortOptions: Record<string, any> = {};
  if (sortBy === 'year') sortOptions.year = sortOrder;
  else if (sortBy === 'title') sortOptions.title = sortOrder;
  else if (sortBy === 'length') sortOptions.length = sortOrder;

  // QUERY DATABASR
  const movies = await Movie.find(filter).sort(sortOptions).skip(skip).limit(perpage);

  // Count the total number of movies for metadata
  const totalMovies = await Movie.countDocuments(filter);

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
  const validation = checkValidation(req, res);
  if (validation !== undefined) {
    return validation;
  }

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
  const validation = checkValidation(req, res);
  if (validation !== undefined) {
    return validation;
  }

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

export const importUserData = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  if (req.file.mimetype !== 'application/json') {
    return res.status(400).json({ error: 'Uploaded file is not a JSON file' });
  }

  // Read and parse the JSON file
  const filePath = req.file.path;
  const fileData = await fs.promises.readFile(filePath, 'utf-8');
  const userData = JSON.parse(fileData) as MovieType[]; // Type assertion for TypeScript

  // Validate each item in the JSON array
  if (
    !Array.isArray(userData) ||
    userData.some(
      (doc) =>
        !doc.user ||
        !doc.id ||
        !doc.title ||
        typeof doc.year !== 'number' ||
        typeof doc.length !== 'number' ||
        !doc.media ||
        typeof doc.size !== 'number' ||
        typeof doc.watched !== 'boolean' ||
        typeof doc.backedUp !== 'boolean' ||
        !doc.backupDate ||
        typeof doc.meta_ids !== 'object'
    )
  ) {
    return res.status(400).json({ error: 'Invalid JSON structure' });
  }

  // Insert into DB
  await Movie.insertMany(userData);

  // Cleanup the uploaded file
  await fs.promises.unlink(filePath);

  return res.status(200).json({ status: 'success', message: 'Data imported successfully' });
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

/**
 * Get the movie poster from TMDb
 *
 * @param {string} tmdbId - TMDB ID of the movie
 *
 * @returns {Promise<string>} - The URL of the movie poster
 */
const getMoviePoster = async (tmdbId: string) => {
  try {
    const response = await fetch(`${process.env.TMDB_BASE_URL}/${tmdbId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch the URL: ${response.status} ${response.statusText}`);
    }

    // Get the HTML text
    const html = await response.text();

    // Load the HTML into cheerio
    const $ = load(html);

    // Search for the <img> element with the specific class
    const imgElement = $(`img.poster`).first();

    // Get the 'src' attribute of the <img> element
    const imgSrc = imgElement.attr('src');

    // Return the image URL or empty string if not found
    return imgSrc || '';
  } catch {
    // Return empty string if an error occurs
    return '';
  }
};
