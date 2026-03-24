document.addEventListener('DOMContentLoaded', async () => {
  const featuredBlock = document.getElementById('featured-event');
  const upcomingGrid = document.getElementById('events-grid');

  if (!featuredBlock && !upcomingGrid) {
    return;
  }

  try {
    const { items } = await window.TestHiveApi.getEvents('?status=upcoming');
    const featuredEvent = items.find((event) => event.featured) || items[0];
    const otherEvents = items.filter((event) => event.slug !== featuredEvent?.slug);

    if (featuredBlock && featuredEvent) {
      document.getElementById('hero-banner-image').src = featuredEvent.image;
      document.getElementById('hero-banner-image').alt = featuredEvent.title;
      document.getElementById('hero-banner-kicker').textContent = 'Mark Your Calendar!';
      document.getElementById('hero-banner-title').textContent = featuredEvent.title;
      document.getElementById('hero-banner-date').textContent = `${window.TestHiveApi.formatLongDate(featuredEvent.date)} | ${featuredEvent.startTime} - ${featuredEvent.endTime}`;
      document.getElementById('hero-banner-location').textContent = `${featuredEvent.venue}, ${featuredEvent.city}`;
      document.getElementById('hero-banner-description').textContent = featuredEvent.description;
      document.getElementById('hero-banner-register').setAttribute('href', featuredEvent.registrationUrl || '#');
    }

    if (upcomingGrid) {
      const cards = otherEvents.length ? otherEvents : items;
      upcomingGrid.innerHTML = cards.map((event) => `
        <div class="bg-[#e9e6e4] rounded-xl shadow-md overflow-hidden transition-transform hover:scale-105">
          <img src="${event.image}" alt="${event.title}" class="w-full h-48 object-cover">
          <div class="p-6">
            <h3 class="text-xl font-bold text-[#204045] mb-2">${event.title}</h3>
            <div class="flex items-center gap-2 mb-3">
              <i data-feather="calendar" class="text-[#7e9693]"></i>
              <span class="text-[#7e9693]">${window.TestHiveApi.formatShortDate(event.date)}</span>
            </div>
            <p class="text-[#7e9693] mb-4">${event.excerpt}</p>
            <a href="${event.registrationUrl || '#'}" class="text-[#204045] font-medium hover:underline">Learn More →</a>
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
