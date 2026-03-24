class JoinModal extends HTMLElement {
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
          max-width: 400px;
          max-height: 80vh;
          overflow-y: auto;
          padding: 1.5rem;
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
          margin-bottom: 0.75rem;
          color: #204045;
          font-weight: 600;
          font-size: 0.95rem;
        }
        input, select, textarea {
          width: 100%;
          padding: 0.875rem 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-family: inherit;
          font-size: 0.95rem;
          transition: all 0.3s;
          background: white;
          box-sizing: border-box;
        }

        input::placeholder,
        textarea::placeholder {
          color: #9ca3af;
          opacity: 1;
        }

        select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%237e9693' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          background-size: 12px;
          padding-right: 2.5rem;
        }
input:focus, select:focus, textarea:focus {
          border-color: #204045;
          outline: none;
          box-shadow: 0 0 0 3px rgba(32, 64, 69, 0.1);
        }
        textarea {
          min-height: 60px;
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
        .submit-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem;
        }
.submit-btn:hover {
          background: #7e9693;
          transform: translateY(-2px);
        }
        .status-message {
          margin-top: 1rem;
          font-size: 0.9rem;
          text-align: center;
          color: #204045;
        }

        .button-icon {
          font-weight: 700;
          transition: transform 0.3s ease;
        }

        .submit-btn:hover .button-icon {
          transform: translateX(3px);
        }
</style>
      <div class="modal-overlay">
        <div class="modal-content">
          <button class="close-btn">&times;</button>
          <h2>Join the Hive</h2>
          <form id="joinForm">
            <div class="form-group">
              <label for="name">Full Name</label>
              <input type="text" id="name" required placeholder="John Doe">
            </div>
<div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" required placeholder="john.doe@example.com">
</div>
            <div class="form-group">
              <label for="phone">Phone Number</label>
              <input type="tel" id="phone" placeholder="+254 712 345 678">
</div>
            <div class="form-group">
              <label for="linkedin">LinkedIn Profile URL</label>
              <input type="url" id="linkedin" placeholder="https://linkedin.com/in/johndoe">
</div>
            <div class="form-group">
              <label for="location">Location</label>
              <select id="location" required>
                <option value="">Select your location</option>
                <option value="Nairobi">Nairobi</option>
                <option value="Mombasa">Mombasa</option>
                <option value="Kisumu">Kisumu</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div class="form-group">
              <label for="experience">Years of QA Experience</label>
              <select id="experience" required>
                <option value="">Select experience level</option>
                <option value="0-1">0-1 years</option>
                <option value="1-3">1-3 years</option>
                <option value="3-5">3-5 years</option>
                <option value="5+">5+ years</option>
              </select>
            </div>
            <div class="form-group">
              <label for="skills">Primary QA Skills</label>
                            <textarea id="skills" placeholder="Main QA skills (e.g. automation, manual, performance testing)"></textarea>
</div>
                            <button type="submit" class="submit-btn">
                              <span class="button-text">Submit</span>
                              <span class="button-icon">→</span>
                            </button>
            <div class="status-message" aria-live="polite"></div>
</form>
</div>
      </div>
    `;

    this.closeBtn = this.shadowRoot.querySelector('.close-btn');
    this.modal = this.shadowRoot.querySelector('.modal-overlay');
    this.form = this.shadowRoot.querySelector('#joinForm');
    this.submitButton = this.shadowRoot.querySelector('.submit-btn');
    this.statusMessage = this.shadowRoot.querySelector('.status-message');

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
    async handleSubmit(e) {
    e.preventDefault();
    const formData = {
      name: this.shadowRoot.getElementById('name').value,
      email: this.shadowRoot.getElementById('email').value,
      phone: this.shadowRoot.getElementById('phone').value,
      linkedin: this.shadowRoot.getElementById('linkedin').value,
      location: this.shadowRoot.getElementById('location').value,
      experience: this.shadowRoot.getElementById('experience').value,
      skills: this.shadowRoot.getElementById('skills').value
    };

    this.submitButton.disabled = true;
    this.statusMessage.textContent = 'Submitting...';

    try {
      const response = await window.TestHiveApi.submitApplication(formData);
      alert(response.message);
      this.closeModal();
      this.form.reset();
      this.statusMessage.textContent = '';
    } catch (error) {
      this.statusMessage.textContent = error.message;
    } finally {
      this.submitButton.disabled = false;
    }
  }
}

customElements.define('join-modal', JoinModal);
