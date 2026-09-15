const spotListEl = document.getElementById('spotList');
const searchEl = document.getElementById('search');
const categoryFilterEl = document.getElementById('categoryFilter');
const modal = document.getElementById('reportModal');
const modalTitle = document.getElementById('modalTitle');
const modalSubtitle = document.getElementById('modalSubtitle');
const modalStatus = document.getElementById('modalStatus');
const modalClose = document.getElementById('modalClose');

let spots = [];
let activeSpotId = null;

async function fetchSpots() {
  const res = await fetch('/api/spots');
  spots = await res.json();
  populateCategoryFilter();
  render();
}

function populateCategoryFilter() {
  const categories = [...new Set(spots.map((s) => s.category))].sort();
  const current = categoryFilterEl.value;
  categoryFilterEl.innerHTML = '<option value="">All categories</option>';
  for (const cat of categories) {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    categoryFilterEl.appendChild(opt);
  }
  categoryFilterEl.value = current;
}

function timeAgo(ts) {
  if (!ts) return '';
  const mins = Math.round((Date.now() - ts) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  return `${hours}h ago`;
}

function render() {
  const query = searchEl.value.trim().toLowerCase();
  const category = categoryFilterEl.value;

  const filtered = spots.filter((s) => {
    const matchesQuery =
      !query || s.name.toLowerCase().includes(query) || s.building.toLowerCase().includes(query);
    const matchesCategory = !category || s.category === category;
    return matchesQuery && matchesCategory;
  });

  spotListEl.innerHTML = '';

  if (filtered.length === 0) {
    spotListEl.innerHTML = '<p style="color:#6b7280; text-align:center;">No study spots match your search.</p>';
    return;
  }

  for (const spot of filtered) {
    const card = document.createElement('div');
    card.className = 'spot-card';

    const badgeClass = spot.crowd.level ? `level-${spot.crowd.level}` : 'level-none';
    const badgeLabel = spot.crowd.level
      ? `${spot.crowd.label} · ${timeAgo(spot.crowd.updatedAt)}`
      : 'No recent reports';

    card.innerHTML = `
      <div class="spot-info">
        <h3>${spot.name}</h3>
        <p class="meta">${spot.building} · ${spot.category}</p>
      </div>
      <div class="spot-status">
        <span class="badge ${badgeClass}">${badgeLabel}</span>
        <button class="report-btn" data-id="${spot.id}">Report</button>
      </div>
    `;

    card.querySelector('.report-btn').addEventListener('click', () => openModal(spot));
    spotListEl.appendChild(card);
  }
}

function openModal(spot) {
  activeSpotId = spot.id;
  modalTitle.textContent = spot.name;
  modalSubtitle.textContent = `${spot.building} · How crowded is it right now?`;
  modalStatus.textContent = '';
  modal.classList.remove('hidden');
}

function closeModal() {
  modal.classList.add('hidden');
  activeSpotId = null;
}

async function submitReport(level) {
  if (!activeSpotId) return;
  modalStatus.textContent = 'Submitting...';
  try {
    const res = await fetch(`/api/spots/${activeSpotId}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level }),
    });
    if (!res.ok) throw new Error('Failed to submit report');
    modalStatus.textContent = 'Thanks! Crowd level updated.';
    await fetchSpots();
    setTimeout(closeModal, 700);
  } catch (err) {
    modalStatus.textContent = 'Something went wrong. Try again.';
  }
}

document.querySelectorAll('.level-btn').forEach((btn) => {
  btn.addEventListener('click', () => submitReport(Number(btn.dataset.level)));
});

modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});

searchEl.addEventListener('input', render);
categoryFilterEl.addEventListener('change', render);

fetchSpots();
setInterval(fetchSpots, 30000);
