async function search() {
  const q = document.getElementById('search').value;
  const res = await fetch(`http://localhost:5000/api/movies?q=${encodeURIComponent(q)}`);
  const movies = await res.json();
  const list = document.getElementById('results');
  list.innerHTML = '';
  movies.forEach(m => {
    const li = document.createElement('li');
    li.textContent = `${m.title} (${m.release_year}) — ${m.imdb_rating ?? 'N/A'}`;
    list.appendChild(li);
  });
}

// Example static genre chart (replace with /api/users/:id/genres later)
const ctx = document.getElementById('genreChart');
new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['Action', 'Comedy', 'Drama', 'Sci-Fi'],
    datasets: [{
      label: 'Your Top Genres',
      data: [12, 8, 5, 3],
      backgroundColor: 'rgba(75,192,192,0.5)'
    }]
  }
});
async function loadGenreChart(userId) {
  const res = await fetch(`http://localhost:5000/api/users/${userId}/genres`);
  const json = await res.json();

  new Chart(document.getElementById('genreChart'), {
    type: 'bar',
    data: {
      labels: json.labels,
      datasets: [{
        label: 'Your Top Genres',
        data: json.data,
        backgroundColor: 'rgba(75,192,192,0.5)'
      }]
    }
  });
}


