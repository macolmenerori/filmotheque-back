import express from 'express';
import multer from 'multer';

import {
  addMovieToCollection,
  deleteMovieFromCollection,
  exportUserData,
  getAllMovies,
  getFullMovie,
  importUserData,
  protect,
  searchTraktMovieByTitle,
  updateMovie
} from '../controllers/moviesController';
import { methodNotAllowed } from '../utils/methodNotAllowed';
import {
  addMovieToCollectionValidation,
  requireIdQueryValidation,
  searchTraktMovieValidation,
  updateMovieValidation
} from '../validations/movie.validation';

const upload = multer({ dest: 'uploads/' });
const router = express.Router();

router
  .route('/searchmovie')
  .get(protect, searchTraktMovieValidation, searchTraktMovieByTitle)
  .all(methodNotAllowed(['GET']));

router
  .route('/movie')
  .get(protect, getAllMovies)
  .post(protect, addMovieToCollectionValidation, addMovieToCollection)
  .patch(protect, updateMovieValidation, updateMovie)
  .delete(protect, requireIdQueryValidation, deleteMovieFromCollection)
  .all(methodNotAllowed(['GET', 'POST', 'PATCH', 'DELETE']));

router
  .route('/fullmovie')
  .get(protect, requireIdQueryValidation, getFullMovie)
  .all(methodNotAllowed(['GET']));

router
  .route('/exportuserdata')
  .get(protect, exportUserData)
  .all(methodNotAllowed(['GET']));

router
  .route('/importuserdata')
  .post(protect, upload.single('file'), importUserData)
  .all(methodNotAllowed(['POST']));

export default router;
