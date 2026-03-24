document.addEventListener('DOMContentLoaded', async () => {
  const donationType = document.getElementById('donation-type');
  const amountButtons = document.querySelectorAll('.donation-amount');
  const customAmount = document.getElementById('custom-amount');
  const donateButton = document.getElementById('donate-button');
  const sponsorToggle = document.getElementById('sponsor-toggle');
  const sponsorForm = document.getElementById('sponsor-form');
  const sponsorSubmit = document.getElementById('sponsor-submit');
  const sponsorEventSelect = document.getElementById('event');

  let selectedAmount = '';

  amountButtons.forEach((button) => {
    button.addEventListener('click', () => {
      selectedAmount = button.dataset.amount;
      customAmount.value = '';
      amountButtons.forEach((item) => item.classList.remove('bg-[#204045]', 'text-white'));
      button.classList.add('bg-[#204045]', 'text-white');
    });
  });

  customAmount.addEventListener('input', () => {
    selectedAmount = '';
    amountButtons.forEach((item) => item.classList.remove('bg-[#204045]', 'text-white'));
  });

  sponsorToggle.addEventListener('click', () => {
    sponsorForm.classList.toggle('hidden');
  });

  donateButton.addEventListener('click', async () => {
    const amount = customAmount.value.trim() || selectedAmount;
    const payload = {
      donationType: donationType.value,
      amount,
      name: document.getElementById('name').value.trim(),
      email: document.getElementById('email').value.trim()
    };

    donateButton.disabled = true;
    donateButton.textContent = 'Submitting...';

    try {
      const response = await window.TestHiveApi.submitDonation(payload);
      alert(response.message);
      document.getElementById('name').value = '';
      document.getElementById('email').value = '';
      customAmount.value = '';
      selectedAmount = '';
      amountButtons.forEach((item) => item.classList.remove('bg-[#204045]', 'text-white'));
    } catch (error) {
      alert(error.message);
    } finally {
      donateButton.disabled = false;
      donateButton.textContent = 'Donate Now';
    }
  });

  sponsorSubmit.addEventListener('click', async () => {
    const payload = {
      event: sponsorEventSelect.value,
      company: document.getElementById('company').value.trim(),
      message: document.getElementById('message').value.trim(),
      name: document.getElementById('name').value.trim(),
      email: document.getElementById('email').value.trim()
    };

    sponsorSubmit.disabled = true;
    sponsorSubmit.textContent = 'Submitting...';

    try {
      const response = await window.TestHiveApi.submitSponsorship(payload);
      alert(response.message);
      sponsorForm.querySelectorAll('input, textarea, select').forEach((field) => {
        if (field.id !== 'name' && field.id !== 'email') {
          field.value = '';
        }
      });
      sponsorForm.classList.add('hidden');
    } catch (error) {
      alert(error.message);
    } finally {
      sponsorSubmit.disabled = false;
      sponsorSubmit.textContent = 'Submit Sponsorship Request';
    }
  });

  try {
    const { items } = await window.TestHiveApi.getEvents('?status=upcoming');
    sponsorEventSelect.innerHTML = `
      <option value="">Select an event</option>
      ${items.map((event) => `<option value="${event.slug}">${event.title}</option>`).join('')}
    `;
  } catch (error) {
    console.error(error);
  }
});
