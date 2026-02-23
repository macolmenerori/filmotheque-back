/* eslint-disable no-undef */
// SET UP MONGODB
// Switch to mongoDB admin database
db = db.getSiblingDB('admin');

// Create database admin with root privileges
db.createUser({
  user: 'admindb',
  pwd: 'admindb',
  roles: [{ role: 'root', db: 'admin' }]
});

// SET UP OPENSESAME
// Create opensesame database
db = db.getSiblingDB('opensesame');

// Create users collection
db.createCollection('users');

// Insert default user. user: admin@admin.com, password: administrator
db.users.insertOne({
  name: 'Admin',
  email: 'admin@admin.com',
  role: 'admin',
  password: '$2b$12$GhCoggnxkqF1WtU/KIxmjuouaMexO4cZBbkP8mzVWCnq56mqqcQfG',
  passwordChangedAt: new Date(),
  permissions: []
});

// SET UP FILMOTHEQUE
// Create filmotheque database
db = db.getSiblingDB('filmotheque');

// Create movies collection
db.createCollection('movies');

// Insert some example movies
db.movies.insertOne({
  user: 'admin@admin.com',
  id: '196',
  title: 'The Godfather',
  year: 1972,
  length: 175,
  media: ['Digital', 'Blu-Ray'],
  size: 6.55,
  watched: true,
  backedUp: true,
  backupDate: '2024-11-28',
  meta_ids: {
    trakt: 196,
    slug: 'the-godfather-1972',
    imdb: 'tt0068646',
    tmdb: 238
  },
  poster_url:
    'https://media.themoviedb.org/t/p/w300_and_h450_bestv2/5HlLUsmsv60cZVTzVns9ICZD6zU.jpg'
});

db.movies.insertOne({
  user: 'admin@admin.com',
  id: '243',
  title: 'Casablanca',
  year: 1943,
  length: 102,
  media: ['Blu-Ray'],
  size: 0,
  watched: false,
  backedUp: false,
  backupDate: '',
  meta_ids: {
    trakt: 243,
    slug: 'casablanca-1943',
    imdb: 'tt0034583',
    tmdb: 289
  },
  poster_url: 'https://media.themoviedb.org/t/p/w300_and_h450_bestv2/eSf7DyhTbnREC11VLjxnSeyAfi.jpg'
});
