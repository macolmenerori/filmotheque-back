import mongoose, { Schema } from 'mongoose';

import { MovieType } from './moviesTypes';

const movieSchema: Schema = new mongoose.Schema({
  user: {
    type: String,
    required: [true, 'A movie must have a user']
  },
  id: {
    type: String,
    required: [true, 'A movie must have an id'],
    unique: true
  },
  title: {
    type: String,
    required: [true, 'A movie must have a title']
  },
  year: {
    type: Number,
    required: [true, 'A movie must have a year']
  },
  length: {
    type: Number,
    required: [true, 'A movie must have a length in minutes']
  },
  media: {
    type: [String],
    required: [true, 'A movie must have at least one media type']
  },
  size: {
    type: Number,
    default: 0
  },
  watched: {
    type: Boolean,
    default: false
  },
  backedUp: {
    type: Boolean,
    default: false
  },
  backupDate: {
    type: String,
    default: ''
  },
  meta_ids: {
    type: Object,
    default: {}
  }
});

const Movie = mongoose.model<MovieType>('Movie', movieSchema);

export default Movie;
