import { Document, Schema } from 'mongoose';

export type MovieType = Document & {
  user: string;
  id: string;
  title: string;
  year: number;
  length: number;
  media: string[];
  size: number;
  watched: boolean;
  backedUp: boolean;
  backupDate: string;
};

export type UserSchemaType = MovieType & Schema;

export type TraktMovie = {
  title: string;
  year: number;
  ids: Record<string, string | number>;
};

export type MovieSearchTrakt = {
  type: string;
  score: number;
  movie: TraktMovie;
};
