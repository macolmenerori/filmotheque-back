import express from 'express';

import { protect, searchTraktMovieByTitle } from '../controllers/moviesController';
import { methodNotAllowed } from '../utils/methodNotAllowed';

const router = express.Router();

// router.route('/').get((req, res) => {
//   res.status(200).json({
//     status: 'success',
//     message: 'Movies route'
//   });
// });

router.route('/searchmovie').get(protect, searchTraktMovieByTitle);
//.all(methodNotAllowed(['GET']));

export default router;
