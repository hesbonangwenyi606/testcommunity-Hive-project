document.addEventListener('DOMContentLoaded', async () => {
  const galleryGrid = document.getElementById('gallery-grid');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const loadMoreBtn = document.getElementById('load-more');

  if (!galleryGrid) {
    return;
  }

  let galleryItems = [];
  let visibleCount = 6;
  let activeFilter = 'all';

  function filteredItems() {
    return activeFilter === 'all'
      ? galleryItems
      : galleryItems.filter((item) => item.category === activeFilter);
  }

  function renderGallery() {
    const items = filteredItems().slice(0, visibleCount);
    galleryGrid.innerHTML = items.map((item) => `
      <div class="gallery-item group relative overflow-hidden rounded-xl shadow-md transition-all hover:shadow-lg">
        <img src="${item.image}" alt="${item.title}" class="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110">
        <div class="absolute inset-0 bg-gradient-to-t from-[#204045]/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-6 flex flex-col justify-end">
          <h3 class="text-xl font-bold text-white mb-1">${item.title}</h3>
          <p class="text-[#a3c1bd] text-sm">${window.TestHiveApi.formatShortDate(item.date)}</p>
        </div>
      </div>
    `).join('');

    const hasMore = filteredItems().length > visibleCount;
    loadMoreBtn.disabled = !hasMore;
    loadMoreBtn.querySelector('span').textContent = hasMore ? 'Load More' : 'All Items Loaded';
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((item) => item.classList.remove('active', 'bg-[#204045]', 'text-white'));
      btn.classList.add('active', 'bg-[#204045]', 'text-white');
      activeFilter = btn.dataset.filter;
      visibleCount = 6;
      renderGallery();
    });
  });

  loadMoreBtn.addEventListener('click', () => {
    visibleCount += 3;
    renderGallery();
  });

  try {
    const { items } = await window.TestHiveApi.getGallery();
    galleryItems = items;
    renderGallery();
  } catch (error) {
    console.error(error);
  }
});
