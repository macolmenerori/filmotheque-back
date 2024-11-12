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

// router.route('/').get((req, res) => {
//   res.status(200).json({
//     status: 'success',
//     message: 'Movies route'
//   });
// });

router.route('/searchmovie').get(protect, searchTraktMovieByTitle);
//.all(methodNotAllowed(['GET']));
router
  .route('/movie')
  .get(protect, getAllMovies)
  .post(protect, addMovieToCollection)
  .patch(protect, updateMovie)
  .delete(protect, deleteMovieFromCollection); // TODO: validation on POST body

router.route('/fullmovie').get(protect, getFullMovie);

router.route('/exportuserdata').get(protect, exportUserData);

router.route('/importuserdata').post(protect, upload.single('file'), importUserData);

export default router;
