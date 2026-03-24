document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('member-search');
  const skillSelect = document.getElementById('skill-filter');
  const locationSelect = document.getElementById('location-filter');
  const membersGrid = document.getElementById('members-grid');
  const emptyState = document.getElementById('directory-empty-state');

  if (!searchInput || !skillSelect || !locationSelect || !membersGrid) {
    return;
  }

  async function loadMembers() {
    const params = new URLSearchParams();
    if (searchInput.value.trim()) {
      params.set('search', searchInput.value.trim());
    }
    if (skillSelect.value) {
      params.set('skill', skillSelect.value);
    }
    if (locationSelect.value) {
      params.set('location', locationSelect.value);
    }

    try {
      const query = params.toString() ? `?${params.toString()}` : '';
      const { items } = await window.TestHiveApi.getMembers(query);

      membersGrid.innerHTML = items.map((member) => `
        <div class="bg-[#e9e6e4] rounded-xl p-6 shadow-md transition-all hover:shadow-lg">
          <div class="flex items-center gap-4 mb-4">
            <img src="${member.avatar}" alt="${member.name}" class="w-16 h-16 rounded-full object-cover">
            <div>
              <h3 class="text-xl font-bold text-[#204045]">${member.name}</h3>
              <p class="text-[#7e9693]">${member.role}</p>
            </div>
          </div>
          <div class="space-y-3">
            <div class="flex items-center gap-2">
              <i data-feather="map-pin" class="text-[#7e9693] w-4 h-4"></i>
              <span class="text-sm text-[#7e9693]">${member.location}, ${member.country}</span>
            </div>
            <div class="flex flex-wrap gap-2">
              ${member.skills.map((skill) => `<span class="bg-[#204045] text-white px-3 py-1 rounded-full text-xs">${skill}</span>`).join('')}
            </div>
            <p class="text-sm text-[#7e9693] mt-3">${member.bio}</p>
            <p class="text-sm text-[#204045] font-medium">Work mode: ${member.workMode}</p>
          </div>
        </div>
      `).join('');

      emptyState.classList.toggle('hidden', items.length > 0);

      if (window.feather) {
        window.feather.replace();
      }
    } catch (error) {
      console.error(error);
      emptyState.classList.remove('hidden');
      emptyState.textContent = error.message;
    }
  }

  searchInput.addEventListener('input', loadMembers);
  skillSelect.addEventListener('change', loadMembers);
  locationSelect.addEventListener('change', loadMembers);
  loadMembers();
});
