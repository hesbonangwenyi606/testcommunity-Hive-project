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
