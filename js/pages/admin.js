document.addEventListener('DOMContentLoaded', () => {
  const loginView = document.getElementById('admin-login-view');
  const appView = document.getElementById('admin-app-view');
  const loginForm = document.getElementById('admin-login-form');
  const loginError = document.getElementById('admin-login-error');
  const sessionUser = document.getElementById('admin-session-user');
  const logoutButton = document.getElementById('admin-logout');
  const statsContainer = document.getElementById('admin-stats');
  const submissionFilter = document.getElementById('submission-type-filter');
  const submissionTableBody = document.getElementById('submission-table-body');
  const tabButtons = document.querySelectorAll('.admin-tab-btn');
  const contentForm = document.getElementById('content-form');
  const contentFormTitle = document.getElementById('content-form-title');
  const contentListTitle = document.getElementById('content-list-title');
  const contentList = document.getElementById('content-list');
  const contentFormMessage = document.getElementById('content-form-message');
  const resetFormButton = document.getElementById('content-form-reset');

  const config = {
    events: {
      label: 'Event',
      title: 'Events',
      endpoint: 'events',
      fields: [
        ['title', 'Title'],
        ['slug', 'Slug'],
        ['category', 'Category'],
        ['status', 'Status'],
        ['date', 'Date', 'date'],
        ['startTime', 'Start Time'],
        ['endTime', 'End Time'],
        ['venue', 'Venue'],
        ['city', 'City'],
        ['image', 'Image URL'],
        ['registrationUrl', 'Registration URL'],
        ['excerpt', 'Excerpt', 'textarea'],
        ['description', 'Description', 'textarea']
      ],
      summarize(item) {
        return `${item.title} · ${item.date} · ${item.city || 'Unknown location'}`;
      }
    },
    members: {
      label: 'Member',
      title: 'Members',
      endpoint: 'members',
      fields: [
        ['name', 'Name'],
        ['slug', 'Slug'],
        ['role', 'Role'],
        ['location', 'Location'],
        ['country', 'Country'],
        ['workMode', 'Work Mode'],
        ['avatar', 'Avatar URL'],
        ['skills', 'Skills (comma separated)', 'textarea'],
        ['bio', 'Bio', 'textarea']
      ],
      summarize(item) {
        return `${item.name} · ${item.role} · ${item.location}`;
      }
    },
    gallery: {
      label: 'Gallery Item',
      title: 'Gallery',
      endpoint: 'gallery',
      fields: [
        ['title', 'Title'],
        ['category', 'Category'],
        ['image', 'Image URL'],
        ['date', 'Date', 'date']
      ],
      summarize(item) {
        return `${item.title} · ${item.category} · ${item.date}`;
      }
    }
  };

  let activeTab = 'events';
  let editingId = null;

  function showLoggedIn(username) {
    loginView.classList.add('hidden');
    appView.classList.remove('hidden');
    sessionUser.textContent = `Signed in as ${username}`;
  }

  function showLoggedOut() {
    appView.classList.add('hidden');
    loginView.classList.remove('hidden');
    loginError.textContent = '';
    loginForm.reset();
  }

  function renderStats(stats) {
    const cards = [
      ['Applications', stats.applications],
      ['Donations', stats.donations],
      ['Sponsorships', stats.sponsorships],
      ['Members', stats.members],
      ['KES Raised', Number(stats.totalDonationValue).toLocaleString('en-KE')]
    ];

    statsContainer.innerHTML = cards.map(([label, value]) => `
      <article class="bg-white rounded-3xl p-5 shadow-md">
        <p class="text-sm text-[#7e9693] mb-2">${label}</p>
        <p class="text-3xl font-bold">${value}</p>
      </article>
    `).join('');
  }

  async function loadDashboard() {
    const dashboard = await window.TestHiveApi.getAdminDashboard();
    renderStats(dashboard.stats);
  }

  async function loadSubmissions() {
    const type = submissionFilter.value;
    const { items } = await window.TestHiveApi.getAdminSubmissions(type);

    submissionTableBody.innerHTML = items.map((item) => `
      <tr class="border-b border-[#eef2f1]">
        <td class="py-3 pr-3">${new Date(item.createdAt).toLocaleString('en-KE')}</td>
        <td class="py-3 pr-3">${item.name || '-'}</td>
        <td class="py-3 pr-3">${item.email || '-'}</td>
        <td class="py-3 pr-3">
          <span class="inline-flex rounded-full bg-[#e9e6e4] px-3 py-1">${item.status}</span>
        </td>
        <td class="py-3">
          <select data-submission-id="${item.id}" class="submission-status rounded-full bg-[#e9e6e4] px-3 py-2">
            ${['new', 'pending', 'received', 'reviewed', 'approved', 'contacted', 'closed'].map((status) => `
              <option value="${status}" ${item.status === status ? 'selected' : ''}>${status}</option>
            `).join('')}
          </select>
        </td>
      </tr>
    `).join('');
  }

  function renderForm() {
    const current = config[activeTab];
    contentFormTitle.textContent = `${editingId ? 'Edit' : 'Create'} ${current.label}`;
    contentListTitle.textContent = current.title;
    contentForm.innerHTML = `
      <input type="hidden" name="id" value="${editingId || ''}">
      ${current.fields.map(([name, label, type]) => {
        if (type === 'textarea') {
          return `
            <div>
              <label class="block text-sm font-medium mb-2" for="field-${name}">${label}</label>
              <textarea id="field-${name}" name="${name}" class="w-full rounded-2xl border border-[#c9d2d0] px-4 py-3 min-h-24"></textarea>
            </div>
          `;
        }

        const inputType = type === 'date' ? 'date' : 'text';
        return `
          <div>
            <label class="block text-sm font-medium mb-2" for="field-${name}">${label}</label>
            <input id="field-${name}" name="${name}" type="${inputType}" class="w-full rounded-2xl border border-[#c9d2d0] px-4 py-3">
          </div>
        `;
      }).join('')}
      <label class="flex items-center gap-3 pt-1">
        <input type="checkbox" name="featured" class="w-4 h-4">
        <span class="text-sm">Featured</span>
      </label>
      <button class="w-full bg-[#204045] text-white rounded-2xl px-4 py-3 hover:bg-[#163237] transition">
        ${editingId ? `Save ${current.label}` : `Create ${current.label}`}
      </button>
    `;
  }

  function populateForm(item) {
    renderForm();
    editingId = item.id;
    for (const [key, value] of Object.entries(item)) {
      const field = contentForm.elements.namedItem(key);
      if (!field) {
        continue;
      }
      if (field.type === 'checkbox') {
        field.checked = Boolean(value);
      } else if (Array.isArray(value)) {
        field.value = value.join(', ');
      } else {
        field.value = value ?? '';
      }
    }
    contentFormTitle.textContent = `Edit ${config[activeTab].label}`;
  }

  function resetContentForm() {
    editingId = null;
    contentFormMessage.textContent = '';
    renderForm();
  }

  async function loadContentList() {
    const current = config[activeTab];
    const { items } = await window.TestHiveApi.getAdminCollection(current.endpoint);

    contentList.innerHTML = items.map((item) => `
      <article class="border border-[#e2e8e6] rounded-2xl p-4">
        <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
          <div>
            <h4 class="font-bold">${current.summarize(item)}</h4>
            <p class="text-sm text-[#7e9693] mt-1">${item.slug || item.id}</p>
          </div>
          <div class="flex gap-2">
            <button data-action="edit" data-id="${item.id}" class="content-action rounded-full bg-[#e9e6e4] px-4 py-2 text-sm">Edit</button>
            <button data-action="delete" data-id="${item.id}" class="content-action rounded-full bg-red-100 text-red-700 px-4 py-2 text-sm">Delete</button>
          </div>
        </div>
      </article>
    `).join('');

    contentList.querySelectorAll('[data-action="edit"]').forEach((button) => {
      button.addEventListener('click', () => {
        const item = items.find((entry) => entry.id === button.dataset.id);
        if (item) {
          populateForm(item);
        }
      });
    });

    contentList.querySelectorAll('[data-action="delete"]').forEach((button) => {
      button.addEventListener('click', async () => {
        if (!confirm('Delete this item?')) {
          return;
        }
        await window.TestHiveApi.deleteAdminCollectionItem(current.endpoint, button.dataset.id);
        await loadContentList();
      });
    });
  }

  async function refreshApp() {
    await Promise.all([loadDashboard(), loadSubmissions(), loadContentList()]);
  }

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    loginError.textContent = '';
    try {
      const username = document.getElementById('admin-username').value.trim();
      const password = document.getElementById('admin-password').value;
      const response = await window.TestHiveApi.adminLogin({ username, password });
      showLoggedIn(response.username);
      resetContentForm();
      await refreshApp();
    } catch (error) {
      loginError.textContent = error.message;
    }
  });

  logoutButton.addEventListener('click', async () => {
    await window.TestHiveApi.adminLogout();
    showLoggedOut();
  });

  submissionFilter.addEventListener('change', loadSubmissions);

  submissionTableBody.addEventListener('change', async (event) => {
    if (!event.target.classList.contains('submission-status')) {
      return;
    }
    await window.TestHiveApi.updateAdminSubmissionStatus(
      submissionFilter.value,
      event.target.dataset.submissionId,
      event.target.value
    );
    await loadDashboard();
  });

  tabButtons.forEach((button) => {
    button.addEventListener('click', async () => {
      activeTab = button.dataset.adminTab;
      tabButtons.forEach((item) => {
        item.classList.toggle('bg-[#204045]', item === button);
        item.classList.toggle('text-white', item === button);
        item.classList.toggle('bg-[#e9e6e4]', item !== button);
      });
      resetContentForm();
      await loadContentList();
    });
  });

  contentForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(contentForm);
    const payload = Object.fromEntries(formData.entries());
    payload.featured = formData.get('featured') === 'on';
    if (activeTab === 'members' && payload.skills) {
      payload.skills = payload.skills.split(',').map((item) => item.trim()).filter(Boolean);
    }

    const current = config[activeTab];
    try {
      if (editingId) {
        await window.TestHiveApi.updateAdminCollectionItem(current.endpoint, editingId, payload);
        contentFormMessage.textContent = `${current.label} updated.`;
      } else {
        await window.TestHiveApi.createAdminCollectionItem(current.endpoint, payload);
        contentFormMessage.textContent = `${current.label} created.`;
      }
      resetContentForm();
      await Promise.all([loadDashboard(), loadContentList()]);
    } catch (error) {
      contentFormMessage.textContent = error.message;
    }
  });

  resetFormButton.addEventListener('click', (event) => {
    event.preventDefault();
    resetContentForm();
  });

  resetContentForm();

  window.TestHiveApi.getAdminSession()
    .then(async (session) => {
      if (!session.authenticated) {
        showLoggedOut();
        return;
      }
      showLoggedIn(session.username);
      await refreshApp();
    })
    .catch(() => showLoggedOut());
});
