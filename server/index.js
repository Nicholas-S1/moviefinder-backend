import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import pool from "./db.js";
import ratingsRouter from "./Ratings.js"; // you can delete later if unused

dotenv.config({ path: "./.env" });
const app = express();

// =======================
//  Middleware
// =======================
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
}));
app.use(express.json());

console.log("✅ Loaded Environment");
console.log("PORT:", process.env.PORT);
console.log("DATABASE_URL:", process.env.DATABASE_URL);

// =======================
//  MOVIE SEARCH / CRUD
// =======================
app.get("/api/movies", async (req, res) => {
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
       LEFT JOIN genres g ON g.genre_id = mg.genre_id
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
    console.error("Database error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// =======================
//  USER AUTH
// =======================

// SIGNUP
app.post("/api/signup", async (req, res) => {
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
    console.error("Signup error:", err.message);
    res.status(400).json({ error: "Username already exists or invalid data" });
  }
});

// LOGIN
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    if (user.rows.length === 0)
      return res.status(401).json({ error: "Invalid username or password" });

    const valid = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!valid)
      return res.status(401).json({ error: "Invalid username or password" });

    console.log("✅ Login successful:", user.rows[0]);
    res.json({
      user_id: user.rows[0].user_id,
      username: user.rows[0].username,
      full_name: user.rows[0].full_name,
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});
// =======================
//  ACCOUNT MANAGEMENT
// =======================

// 🔹 1. Update email or username
app.put("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  const { full_name, username } = req.body;

  if (!full_name && !username)
    return res.status(400).json({ error: "No updates provided" });

  try {
    const result = await pool.query(
      `UPDATE users
       SET full_name = COALESCE($1, full_name),
           username  = COALESCE($2, username)
       WHERE user_id = $3
       RETURNING user_id, full_name, username, created_at;`,
      [full_name || null, username || null, id]
    );

    if (result.rowCount === 0)
      return res.status(404).json({ error: "User not found" });

    res.json({ message: "Profile updated", user: result.rows[0] });
  } catch (err) {
    console.error("Update profile error:", err.message);
    if (err.message.includes("duplicate key"))
      res.status(400).json({ error: "Username already taken" });
    else
      res.status(500).json({ error: "Server error updating profile" });
  }
});


// 🔹 2. Change password
app.put("/api/users/:id/password", async (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword)
    return res.status(400).json({ error: "Missing password fields" });

  try {
    const user = await pool.query(
      "SELECT password_hash FROM users WHERE user_id = $1",
      [id]
    );
    if (user.rows.length === 0)
      return res.status(404).json({ error: "User not found" });

    const valid = await bcrypt.compare(currentPassword, user.rows[0].password_hash);
    if (!valid)
      return res.status(401).json({ error: "Incorrect current password" });

    const newHash = await bcrypt.hash(newPassword, 10);
    await pool.query(
      "UPDATE users SET password_hash = $1 WHERE user_id = $2",
      [newHash, id]
    );

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Password update error:", err.message);
    res.status(500).json({ error: "Server error updating password" });
  }
});


// 🔹 3. Delete account (and related data)
app.delete("/api/users/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Optionally, delete related interactions first
    await pool.query("DELETE FROM user_interactions WHERE user_id = $1", [id]);

    // Delete the user
    const result = await pool.query("DELETE FROM users WHERE user_id = $1", [id]);
    if (result.rowCount === 0)
      return res.status(404).json({ error: "User not found" });

    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error("Account deletion error:", err.message);
    res.status(500).json({ error: "Failed to delete account" });
  }
});

app.get("/api/interactions", async (req, res) => {
  const { user_id, action } = req.query;

  try {
    const result = await pool.query(
      `SELECT movie_id, rating, action
       FROM user_interactions
       WHERE user_id = $1
       AND ($2::text IS NULL OR action = $2)
       AND rating IS NOT NULL;`,
      [user_id, action || null]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching user interactions:", err);
    res.status(500).json({ error: "Server error" });
  }
});



// ✅ Record or update a user interaction (rating, watch later, etc.)
app.post("/api/interactions", async (req, res) => {
  const { user_id, movie_id, action, rating } = req.body;

  if (!user_id || !movie_id || !action)
    return res.status(400).json({ error: "Missing required fields" });

  try {
    // First, check if a record already exists
    const existing = await pool.query(
      `SELECT * FROM user_interactions
       WHERE user_id = $1 AND movie_id = $2 AND action = $3`,
      [user_id, movie_id, action]
    );

    if (existing.rows.length > 0) {
      // If the rating is the same, return "already rated"
      if (existing.rows[0].rating === rating) {
        return res.json({ message: "Already rated this movie", alreadyRated: true });
      }

      // If rating is different, update it
      await pool.query(
        `UPDATE user_interactions
         SET rating = $1, occurred_at = NOW()
         WHERE user_id = $2 AND movie_id = $3 AND action = $4`,
        [rating, user_id, movie_id, action]
      );
      return res.json({ message: "Rating updated", updated: true });
    }

    // Otherwise, create new record
    await pool.query(
      `INSERT INTO user_interactions (user_id, movie_id, action, rating, occurred_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [user_id, movie_id, action, rating]
    );

    res.json({ message: "New rating added", created: true });
  } catch (err) {
    console.error("Error saving user interaction:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


// ✅ Fetch a user's existing ratings
app.get("/api/users/:id/ratings", async (req, res) => {
  const userId = req.params.id;

  try {
    const result = await pool.query(
      `
      SELECT movie_id, rating
      FROM user_interactions
      WHERE user_id = $1 AND "action" = 'rate' AND rating IS NOT NULL
      ORDER BY occurred_at DESC;
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching ratings:", err.message);
    res.status(500).json({ error: "Failed to fetch user ratings" });
  }
});

// =======================
//  WATCH LATER ROUTES
// =======================
app.get("/api/users/:id/watchlater", async (req, res) => {
  const userId = req.params.id;
  try {
    const result = await pool.query(
      `SELECT m.movie_id, m.title, m.release_year, m.imdb_rating
       FROM user_interactions ui
       JOIN movies m ON m.movie_id = ui.movie_id
       WHERE ui.user_id = $1 AND ui.action = 'watch_later'
       ORDER BY ui.occurred_at DESC;`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Watch later fetch error:", err.message);
    res.status(500).json({ error: "Error fetching watch-later list" });
  }
});

app.delete("/api/users/:id/watchlater/:movieId", async (req, res) => {
  const { id, movieId } = req.params;
  try {
    await pool.query(
      `DELETE FROM user_interactions
       WHERE user_id = $1 AND movie_id = $2 AND action = 'watch_later';`,
      [id, movieId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Remove watch later error:", err.message);
    res.status(500).json({ error: "Could not remove movie from watch-later list" });
  }
});

//===============
// GENRE CHART
//===============
app.get("/api/users/:id/genre-stats", async (req, res) => {
  const userId = req.params.id;
  try {
    const result = await pool.query(
      `SELECT * FROM get_user_genre_stats($1)`,
      [userId]
    );
    res.json(result.rows);
  } 
  catch (err) {
    console.error("Genre stats error:", err);
    res.status(500).json({error: "Error while making genre chart"});
  }
});

// =======================
//  RECOMMENDATIONS
// =======================
app.get("/api/recommendations/:userId", async (req, res) => {
  const { userId } = req.params;
  const { type } = req.query;

  console.log(`🎯 Generating recommendations for user ${userId}, type: ${type}`);

  try {
    if (type === "genre") {
      const likedGenres = await pool.query(
        `SELECT g.name AS genre, COUNT(*) AS freq
         FROM user_interactions ui
         JOIN movie_genres mg ON mg.movie_id = ui.movie_id
         JOIN genres g ON g.genre_id = mg.genre_id
         WHERE ui.user_id = $1 
           AND ui.action = 'rate' 
           AND ui.rating >= 4
         GROUP BY g.name
         ORDER BY freq DESC
         LIMIT 3;`,
        [userId]
      );

      if (!likedGenres.rows.length) {
        console.warn("⚠️ No top genres found — user may not have rated enough movies.");
        return res.json([]);
      }

      const topGenres = likedGenres.rows.map((g) => g.genre);

      const recs = await pool.query(
        `SELECT DISTINCT 
           m.movie_id, 
           m.title, 
           m.release_year, 
           m.imdb_rating
         FROM movies m
         JOIN movie_genres mg ON mg.movie_id = m.movie_id
         JOIN genres g ON g.genre_id = mg.genre_id
         WHERE g.name = ANY($1)
         ORDER BY m.imdb_rating DESC NULLS LAST, m.release_year DESC
         LIMIT 10;`,
        [topGenres]
      );

      return res.json(recs.rows);
    }

    if (type === "director") {
      console.log("🎯 Director-based recommendations for user", userId);

      const favoriteDirectors = await pool.query(
        `
        SELECT 
          mp.person_id,
          p.display_name AS director_name,
          COUNT(*) AS freq,
          AVG(ui.rating) AS avg_user_rating
        FROM user_interactions ui
        JOIN movies m ON m.movie_id = ui.movie_id
        JOIN movie_people mp ON mp.movie_id = m.movie_id
        JOIN roles r ON r.role_id = mp.role_id
        JOIN people p ON p.person_id = mp.person_id
        WHERE ui.user_id = $1
          AND ui.action = 'rate'
          AND ui.rating >= 7
          AND r.name = 'Director'
        GROUP BY mp.person_id, p.display_name
        ORDER BY freq DESC, avg_user_rating DESC
        LIMIT 3;
        `,
        [userId]
      );

      if (!favoriteDirectors.rows.length) {
        console.warn("⚠️ No favorite directors found; falling back...");
        const fallback = await pool.query(
          `
          SELECT 
            m.movie_id,
            m.title,
            m.release_year,
            m.imdb_rating,
            STRING_AGG(DISTINCT p.display_name, ', ') AS director
          FROM movies m
          JOIN movie_people mp ON mp.movie_id = m.movie_id
          JOIN roles r ON r.role_id = mp.role_id
          JOIN people p ON p.person_id = mp.person_id
          WHERE r.name = 'Director'
          GROUP BY m.movie_id, m.title, m.release_year, m.imdb_rating
          ORDER BY m.imdb_rating DESC NULLS LAST, m.release_year DESC
          LIMIT 10;
          `
        );
        return res.json(fallback.rows);
      }

      const topDirectorIds = favoriteDirectors.rows.map((row) => row.person_id);
      console.log("🎥 Target directors:", topDirectorIds);

      const recs = await pool.query(
        `
        SELECT 
          m.movie_id,
          m.title,
          m.release_year,
          m.imdb_rating,
          STRING_AGG(DISTINCT p.display_name, ', ') AS director
        FROM movies m
        JOIN movie_people mp ON mp.movie_id = m.movie_id
        JOIN roles r ON r.role_id = mp.role_id
        JOIN people p ON p.person_id = mp.person_id
        LEFT JOIN user_interactions ui
          ON ui.user_id = $1
         AND ui.movie_id = m.movie_id
         AND ui.action = 'rate'
        WHERE r.name = 'Director'
          AND mp.person_id = ANY($2)
          AND (ui.movie_id IS NULL OR ui.rating < 4)
        GROUP BY m.movie_id, m.title, m.release_year, m.imdb_rating
        ORDER BY m.imdb_rating DESC NULLS LAST, m.release_year DESC
        LIMIT 15;
        `,
        [userId, topDirectorIds]
      );

      return res.json(recs.rows);
    }

    if (type === "top") {
      const recs = await pool.query(
        `SELECT movie_id, title, release_year, imdb_rating
         FROM movies
         ORDER BY imdb_rating DESC NULLS LAST, release_year DESC
         LIMIT 10;`
      );
      return res.json(recs.rows);
    }

    return res.status(400).json({ error: "Invalid recommendation type" });
  } catch (err) {
    console.error("❌ Recommendation error:", err);

    // Fallback so demo still works
    try {
      const fallback = await pool.query(
        `SELECT movie_id, title, release_year, imdb_rating
         FROM movies
         ORDER BY imdb_rating DESC NULLS LAST, release_year DESC
         LIMIT 10;`
      );
      console.warn("⚠️ Using fallback recommendations due to error above.");
      return res.json(fallback.rows);
    } catch (fallbackErr) {
      console.error("❌ Fallback recommendation error:", fallbackErr);
      return res.status(500).json({ error: "Server error" });
    }
  }
});







// =======================
//  SERVER START
// =======================
const port = process.env.PORT || 5000;
app.listen(port, () =>
  console.log(`✅ Server running on http://localhost:${port}`)
);
