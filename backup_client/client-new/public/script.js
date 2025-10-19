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


async function load(userId) {
  const res = await fetch(`http://localhost:5000/api/users/${userId}/genres`);
  const json = await res.json();

  new Chart(document.getElementById(''), {
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


