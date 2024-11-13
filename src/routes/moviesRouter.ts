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

const upload = multer({ dest: 'uploads/' });
const router = express.Router();

router
  .route('/searchmovie')
  .get(protect, searchTraktMovieByTitle)
  .all(methodNotAllowed(['GET']));

router
  .route('/movie')
  .get(protect, getAllMovies)
  .post(protect, addMovieToCollection)
  .patch(protect, updateMovie)
  .delete(protect, deleteMovieFromCollection)
  .all(methodNotAllowed(['GET', 'POST', 'PATCH', 'DELETE'])); // TODO: validation on POST body

router
  .route('/fullmovie')
  .get(protect, getFullMovie)
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
