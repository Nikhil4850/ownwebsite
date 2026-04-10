const grid = document.getElementById('projectsGrid');

projects.forEach(p => {
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <img class="card-thumb" src="${p.thumbnail}" alt="${p.title}" />
    <div class="card-body">
      <div class="card-title">${p.title}</div>
      <div class="card-desc">${p.description}</div>
      <div class="card-tech">
        ${p.tech.map(t => `<span class="tech-tag">${t}</span>`).join('')}
      </div>
      <div class="card-footer">
        <div class="price">₹${p.price} <span>one-time</span></div>
        <div class="card-actions">
          <a href="${p.demoUrl}" target="_blank" class="btn btn-outline">Live Demo</a>
          <a href="project.html?id=${p.id}" class="btn btn-primary">Buy Now</a>
        </div>
      </div>
    </div>
  `;
  grid.appendChild(card);
});
