// =======================
// 🎬 Movie Finder Backend (Render + Neon)
// =======================

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { pool } from './db.js'; // ✅ Use the shared connection here

// =======================
//  Environment Setup
// =======================
dotenv.config({ path: './.env' });

const app = express();
app.use(cors());
app.use(express.json());

// Log to confirm environment variables
console.log('✅ Loaded Environment');
console.log('PORT:', process.env.PORT);
console.log('DATABASE_URL:', process.env.DATABASE_URL);

// =======================
//  BASIC MOVIE SEARCH
// =======================
app.get('/api/movies', async (req, res) => {
  const { q, minYear, minRating } = req.query;
  try {
    const result = await pool.query(
      `SELECT
         m.movie_id,
         m.title,
         m.release_year,
         m.imdb_rating,
         COALESCE(STRING_AGG(DISTINCT g.name, ', ' ORDER BY g.name), '') AS genre
       FROM movies m
       LEFT JOIN movie_genres mg ON mg.movie_id = m.movie_id
       LEFT JOIN genres g       ON g.genre_id   = mg.genre_id
       WHERE ($1::text IS NULL OR m.title ILIKE '%' || $1 || '%')
         AND ($2::int IS NULL OR m.release_year >= $2)
         AND ($3::numeric IS NULL OR m.imdb_rating >= $3)
       GROUP BY m.movie_id, m.title, m.release_year, m.imdb_rating
       ORDER BY m.imdb_rating DESC NULLS LAST, m.release_year DESC
       LIMIT 50;`,
      [q || null, minYear || null, minRating || null]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Database error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// =======================
//  MOVIE CRUD ROUTES
// =======================

// CREATE
app.post('/api/movies', async (req, res) => {
  const { title, release_year, imdb_rating } = req.body;
  try {
    const r = await pool.query(
      `INSERT INTO movies (title, release_year, imdb_rating)
       VALUES ($1, $2, $3)
       RETURNING movie_id, title, release_year, imdb_rating;`,
      [title, release_year ?? null, imdb_rating ?? null]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) {
    console.error('Create movie error:', err.message);
    res.status(400).json({ error: 'Invalid movie data' });
  }
});

// UPDATE
app.put('/api/movies/:id', async (req, res) => {
  const { id } = req.params;
  const { title, release_year, imdb_rating } = req.body;
  try {
    const r = await pool.query(
      `UPDATE movies
       SET title = COALESCE($1, title),
           release_year = COALESCE($2, release_year),
           imdb_rating = COALESCE($3, imdb_rating)
       WHERE movie_id = $4
       RETURNING movie_id, title, release_year, imdb_rating;`,
      [title ?? null, release_year ?? null, imdb_rating ?? null, id]
    );
    if (r.rowCount === 0) return res.status(404).json({ error: 'Movie not found' });
    res.json(r.rows[0]);
  } catch (err) {
    console.error('Update movie error:', err.message);
    res.status(400).json({ error: 'Invalid update' });
  }
});

// DELETE
app.delete('/api/movies/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM movie_genres WHERE movie_id = $1;', [id]);
    await pool.query('DELETE FROM movie_people WHERE movie_id = $1;', [id]);
    await pool.query('DELETE FROM user_interactions WHERE movie_id = $1;', [id]);

    const r = await pool.query('DELETE FROM movies WHERE movie_id = $1;', [id]);
    if (r.rowCount === 0) return res.status(404).json({ error: 'Movie not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('Delete movie error:', err.message);
    res.status(500).json({ error: 'Could not delete movie' });
  }
});

// =======================
//  RECOMMENDATIONS
// =======================
app.get('/api/movies/:id/similar-by-director', async (req, res) => {
  const movieId = req.params.id;
  try {
    const query = `
      WITH seed AS (SELECT $1::BIGINT AS movie_id),
      dirs AS (
        SELECT mp.person_id
        FROM movie_people mp
        JOIN roles r ON r.role_id = mp.role_id AND r.name = 'Director'
        JOIN seed s ON s.movie_id = mp.movie_id
      )
      SELECT 
        m.movie_id,
        m.title,
        m.release_year,
        m.imdb_rating,
        COALESCE(STRING_AGG(DISTINCT g.name, ', ' ORDER BY g.name), '') AS genres
      FROM movies m
      JOIN movie_people mp ON mp.movie_id = m.movie_id
      JOIN roles r ON r.role_id = mp.role_id AND r.name = 'Director'
      LEFT JOIN movie_genres mg ON mg.movie_id = m.movie_id
      LEFT JOIN genres g ON g.genre_id = mg.genre_id
      WHERE mp.person_id IN (SELECT person_id FROM dirs)
        AND m.movie_id <> $1
      GROUP BY m.movie_id, m.title, m.release_year, m.imdb_rating
      ORDER BY m.imdb_rating DESC NULLS LAST, m.release_year DESC
      LIMIT 20;
    `;
    const result = await pool.query(query, [movieId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Director recommendation error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// =======================
//  USER AUTH
// =======================

// SIGNUP
app.post('/api/signup', async (req, res) => {
  const { full_name, username, password } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (full_name, username, password_hash)
       VALUES ($1, $2, $3)
       RETURNING user_id, username, created_at;`,
      [full_name, username, hash]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(400).json({ error: 'Username already exists or invalid data' });
  }
});

// LOGIN
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await pool.query(`SELECT * FROM users WHERE username=$1`, [username]);
    if (user.rows.length === 0)
      return res.status(401).json({ error: 'Invalid username or password' });

    const valid = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!valid)
      return res.status(401).json({ error: 'Invalid username or password' });

    res.json({
      user_id: user.rows[0].user_id,
      username: user.rows[0].username
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// =======================
//  USER INTERACTIONS
// =======================
app.post('/api/interactions', async (req, res) => {
  const { user_id, movie_id, action, rating } = req.body;
  try {
    await pool.query(
      `INSERT INTO user_interactions (user_id, movie_id, action, rating)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, movie_id, action)
       DO UPDATE SET rating = EXCLUDED.rating, occurred_at = NOW();`,
      [user_id, movie_id, action, rating || null]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Interaction error:', err.message);
    res.status(500).json({ error: 'Could not record interaction' });
  }
});

// =======================
//  GENRE CHART (deduped)
// =======================
app.get('/api/users/:id/genres', async (req, res) => {
  const userId = req.params.id;
  try {
    const result = await pool.query(`
      SELECT g.name AS genre, COUNT(DISTINCT ui.movie_id) AS movies
      FROM user_interactions ui
      JOIN movie_genres mg ON mg.movie_id = ui.movie_id
      JOIN genres g ON g.genre_id = mg.genre_id
      WHERE ui.user_id = $1
      GROUP BY g.name
      ORDER BY movies DESC;`,
      [userId]
    );
    res.json({
      labels: result.rows.map(r => r.genre),
      data: result.rows.map(r => parseInt(r.movies))
    });
  } catch (err) {
    console.error('Genre stats error:', err.message);
    res.status(500).json({ error: 'Error fetching genre stats' });
  }
});

// =======================
//  SERVER START
// =======================
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});
