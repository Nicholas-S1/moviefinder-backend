import express from "express";
import pool from "./db.js";

const router = express.Router();

// Add or update rating
router.post("/", async (req, res) => {
  const { user_id, movie_id, rating } = req.body;
  try {
    await pool.query(
      `INSERT INTO ratings (user_id, movie_id, rating)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, movie_id)
       DO UPDATE SET rating = EXCLUDED.rating`,
      [user_id, movie_id, rating]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Rating error:", err);
    res.status(500).json({ error: "Failed to save rating" });
  }
});

// Simple recommendations based on top rated genres
router.get("/recommendations/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    // Get user's top 3 genres based on 4+ star ratings
    const likedGenres = await pool.query(`
      SELECT g.name AS genre, COUNT(*) AS freq
      FROM ratings r
      JOIN movies m ON m.movie_id = r.movie_id
      JOIN movie_genres mg ON m.movie_id = mg.movie_id
      JOIN genres g ON g.genre_id = mg.genre_id
      WHERE r.id_user = $1 AND r.rating >= 4
      GROUP BY g.name
      ORDER BY freq DESC
      LIMIT 3;
    `, [userId]);

    const topGenres = likedGenres.rows.map(g => g.genre);

    if (topGenres.length === 0) {
      return res.json([]); // no recommendations yet
    }

    // Get random 10 movies from the user's top genres
    const recs = await pool.query(`
      SELECT m.*
      FROM movies m
      JOIN movie_genres mg ON m.movie_id = mg.movie_id
      JOIN genres g ON g.genre_id = mg.genre_id
      WHERE g.name = ANY($1)
      GROUP BY m.movie_id
      ORDER BY RANDOM()
      LIMIT 10;
    `, [topGenres]);

    res.json(recs.rows);
  } catch (err) {
    console.error("Recommendation error:", err.message);
    res.status(500).json({ error: err.message });
  }
});




export default router;
