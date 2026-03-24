class SponsorModal extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(32, 64, 69, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
        }
        .modal-overlay.active {
          opacity: 1;
          visibility: visible;
        }
        .modal-content {
          background: #f8f9fa;
          border-radius: 12px;
          width: 90%;
          max-width: 500px;
          max-height: 80vh;
          overflow-y: auto;
          padding: 2rem;
          position: relative;
          transform: translateY(20px);
          transition: transform 0.3s ease;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }
        .modal-overlay.active .modal-content {
          transform: translateY(0);
        }
        .close-btn {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          background: none;
          border: none;
          font-size: 1.75rem;
          cursor: pointer;
          color: #7e9693;
          transition: color 0.2s;
        }
        .close-btn:hover {
          color: #204045;
        }
        h2 {
          color: #204045;
          margin-bottom: 1.5rem;
          font-size: 1.5rem;
          text-align: center;
          font-weight: 700;
        }
        .form-group {
          margin-bottom: 1.5rem;
        }
        label {
          display: block;
          margin-bottom: 0.5rem;
          color: #204045;
          font-weight: 600;
          font-size: 0.95rem;
        }
        input, select, textarea {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-family: inherit;
          font-size: 0.95rem;
          transition: all 0.3s;
          background: white;
          box-sizing: border-box;
        }
        input:focus, select:focus, textarea:focus {
          border-color: #204045;
          outline: none;
          box-shadow: 0 0 0 3px rgba(32, 64, 69, 0.1);
        }
        textarea {
          min-height: 100px;
          resize: vertical;
        }
        .submit-btn {
          background: #204045;
          color: white;
          border: none;
          padding: 0.75rem;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          width: 100%;
          margin-top: 1rem;
          font-size: 0.9rem;
        }
        .submit-btn:hover {
          background: #7e9693;
          transform: translateY(-2px);
        }
      </style>
      <div class="modal-overlay">
        <div class="modal-content">
          <button class="close-btn">&times;</button>
          <h2>Event Sponsorship Inquiry</h2>
          <form id="sponsorForm">
            <div class="form-group">
              <label for="sponsor-name">Full Name</label>
              <input type="text" id="sponsor-name" required placeholder="John Doe">
            </div>
            <div class="form-group">
              <label for="sponsor-email">Email</label>
              <input type="email" id="sponsor-email" required placeholder="john.doe@company.com">
            </div>
            <div class="form-group">
              <label for="sponsor-company">Company Name</label>
              <input type="text" id="sponsor-company" required placeholder="Company Ltd">
            </div>
            <div class="form-group">
              <label for="sponsor-phone">Phone Number</label>
              <input type="tel" id="sponsor-phone" placeholder="+254 712 345 678">
            </div>
            <div class="form-group">
              <label for="sponsor-event">Event of Interest</label>
              <select id="sponsor-event" required>
                <option value="">Select an event</option>
                <option value="annual-conference">Annual QA Conference</option>
                <option value="workshop">QA Workshop</option>
                <option value="networking">Networking Event</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div class="form-group">
              <label for="sponsor-message">Your Message</label>
              <textarea id="sponsor-message" placeholder="Tell us about your sponsorship interest..."></textarea>
            </div>
            <button type="submit" class="submit-btn">Submit Inquiry</button>
          </form>
        </div>
      </div>
    `;

    this.closeBtn = this.shadowRoot.querySelector('.close-btn');
    this.modal = this.shadowRoot.querySelector('.modal-overlay');
    this.form = this.shadowRoot.querySelector('#sponsorForm');

    this.closeBtn.addEventListener('click', () => this.closeModal());
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.closeModal();
    });
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  openModal() {
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  handleSubmit(e) {
    e.preventDefault();
    const formData = {
      name: this.shadowRoot.getElementById('sponsor-name').value,
      email: this.shadowRoot.getElementById('sponsor-email').value,
      company: this.shadowRoot.getElementById('sponsor-company').value,
      phone: this.shadowRoot.getElementById('sponsor-phone').value,
      event: this.shadowRoot.getElementById('sponsor-event').value,
      message: this.shadowRoot.getElementById('sponsor-message').value
    };

    // Here you would typically send the data to your backend
    console.log('Sponsorship form submitted:', formData);
    
    // Show success message
    alert('Thank you for your sponsorship inquiry! We will contact you soon.');
    this.closeModal();
    this.form.reset();
  }
}

customElements.define('sponsor-modal', SponsorModal);