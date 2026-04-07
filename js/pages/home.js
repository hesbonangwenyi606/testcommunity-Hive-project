const ICONS = {
  event: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  member: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  gallery: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
};

function collapseHighlights() {
  const extra = document.getElementById('extra-highlights');
  const wrapper = document.getElementById('view-all-btn-wrapper');
  extra.classList.add('hidden');
  extra.innerHTML = '';
  wrapper.innerHTML = `
    <button onclick="loadAllHighlights()" class="bg-[#204045] hover:bg-[#7e9693] text-white px-8 py-3 rounded-full font-medium transition duration-300 shadow-lg">View All Highlights</button>
  `;
  document.getElementById('highlights').scrollIntoView({ behavior: 'smooth' });
}

async function loadAllHighlights() {
  const btn = document.getElementById('view-all-highlights-btn');
  const wrapper = document.getElementById('view-all-btn-wrapper');
  const extra = document.getElementById('extra-highlights');

  btn.textContent = 'Loading...';
  btn.disabled = true;

  try {
    const res = await fetch('/data/content.json');
    const data = await res.json();
    const items = [];

    data.events.forEach(e => {
      const date = new Date(e.date).toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' });
      items.push({ type: 'event', label: e.category.charAt(0).toUpperCase() + e.category.slice(1), title: e.title, description: e.description, meta: `${date} · ${e.venue}, ${e.city}`, link: '/events.html', accent: e.featured ? '#204045' : '#7e9693' });
    });

    data.members.forEach(m => {
      items.push({ type: 'member', label: 'Member Spotlight', title: `${m.name} — ${m.role}`, description: m.bio, meta: `${m.location} · ${m.workMode} · ${m.skills.join(', ')}`, link: '/directory.html', accent: '#7e9693' });
    });

    data.gallery.forEach(g => {
      const date = new Date(g.date).toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' });
      items.push({ type: 'gallery', label: g.category.charAt(0).toUpperCase() + g.category.slice(1), title: g.title, description: 'Browse photos and moments from this community event.', meta: date, link: '/gallery.html', accent: '#204045' });
    });

    extra.innerHTML = items.map(item => `
      <div class="bg-white rounded-xl shadow-md overflow-hidden flex flex-col md:flex-row">
        <div class="p-6 flex items-center gap-4 text-white md:w-1/3" style="background:${item.accent}">
          ${ICONS[item.type]}
          <div>
            <div class="text-xs uppercase tracking-wide opacity-75">${item.label}</div>
            <h3 class="text-lg font-bold leading-tight">${item.title}</h3>
          </div>
        </div>
        <div class="p-6 md:w-2/3 flex flex-col justify-center">
          <p class="text-gray-700 mb-2">${item.description}</p>
          <p class="text-xs text-[#7e9693] mb-3">${item.meta}</p>
          <a href="${item.link}" class="text-[#204045] font-medium hover:underline">Read More →</a>
        </div>
      </div>
    `).join('');

    extra.classList.remove('hidden');
    wrapper.innerHTML = `
      <button onclick="collapseHighlights()" class="bg-white border-2 border-[#204045] text-[#204045] hover:bg-[#204045] hover:text-white px-8 py-3 rounded-full font-medium transition duration-300 shadow-lg">
        ↑ Show Less
      </button>
    `;
  } catch (err) {
    btn.textContent = 'View All Highlights';
    btn.disabled = false;
    console.error(err);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const highlightsContainer = document.getElementById('community-highlights');
  const heroDate = document.getElementById('featured-event-date');
  const heroLocation = document.getElementById('featured-event-location');
  const heroTitle = document.getElementById('featured-event-title');
  const heroDescription = document.getElementById('featured-event-description');
  const heroLink = document.getElementById('featured-event-link');

  if (!highlightsContainer && !heroTitle) {
    return;
  }

  try {
    const content = await window.TestHiveApi.getHomeContent();

    if (content.featuredEvent && heroTitle) {
      heroTitle.textContent = content.featuredEvent.title;
      heroDate.textContent = `${window.TestHiveApi.formatLongDate(content.featuredEvent.date)} | ${content.featuredEvent.startTime} - ${content.featuredEvent.endTime}`;
      heroLocation.textContent = `${content.featuredEvent.venue}, ${content.featuredEvent.city}`;
      heroDescription.textContent = content.featuredEvent.excerpt;
      heroLink.setAttribute('href', '/events.html');
    }

    if (highlightsContainer) {
      highlightsContainer.innerHTML = content.highlights.map((item) => `
        <div class="bg-white rounded-xl shadow-md overflow-hidden flex flex-col md:flex-row">
          <div class="p-6 flex items-center text-white md:w-1/3" style="background:${item.accent}">
            <i data-feather="${item.icon}" class="h-12 w-12 mr-4"></i>
            <h3 class="text-xl font-bold">${item.type}</h3>
          </div>
          <div class="p-6 md:w-2/3">
            <p class="text-gray-700 mb-2 font-semibold">${item.title}</p>
            <p class="text-gray-700 mb-4">${item.description}</p>
            <a href="${item.link}" class="text-[#204045] font-medium hover:underline">Read More →</a>
          </div>
        </div>
      `).join('');

      if (window.feather) {
        window.feather.replace();
      }
    }
  } catch (error) {
    console.error(error);
  }
});
