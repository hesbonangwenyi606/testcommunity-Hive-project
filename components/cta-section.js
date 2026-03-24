class CtaSection extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        section {
          padding: 5rem 1.5rem;
          text-align: center;
        }
        .cta-container {
          max-width: 48rem;
          margin-left: auto;
          margin-right: auto;
        }
        h2 {
          font-size: 2.25rem;
          line-height: 2.5rem;
          font-weight: 700;
          color: #204045;
          margin-bottom: 1.5rem;
        }
        p {
          font-size: 1.125rem;
          line-height: 1.75rem;
          color: #7e9693;
          margin-bottom: 2rem;
        }
        .cta-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          justify-content: center;
        }
        a {
          display: inline-block;
          border-radius: 9999px;
          padding: 0.75rem 2rem;
          font-weight: 500;
          transition-property: all;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 300ms;
          text-decoration: none;
        }
        .primary {
          background-color: #204045;
          color: white;
        }
        .primary:hover {
          background-color: #7e9693;
        }
        .secondary {
          border: 2px solid #204045;
          color: #204045;
        }
        .secondary:hover {
          background-color: #204045;
          color: white;
        }
        .dark {
          background-color: #204045;
          color: white;
        }
        .dark-text {
          color: white;
        }
        .dark-secondary {
          border: 2px solid white;
          color: white;
        }
        .dark-secondary:hover {
          background-color: white;
          color: #204045;
        }
      </style>
      <section class="${this.getAttribute('dark') ? 'bg-[#204045]' : 'bg-[#e9e6e4]'}">
        <div class="cta-container">
          <h2 class="${this.getAttribute('dark') ? 'dark-text' : ''}">${this.getAttribute('title') || 'Join Our Community'}</h2>
          <p class="${this.getAttribute('dark') ? 'dark-text' : ''}">${this.getAttribute('description') || 'Become part of Kenya\'s most vibrant QA community'}</p>
          <div class="cta-buttons">
            <a href="${this.getAttribute('primary-link') || '/join.html'}" class="${this.getAttribute('dark') ? 'primary' : 'primary'}">${this.getAttribute('primary-text') || 'Join Now'}</a>
            <a href="${this.getAttribute('secondary-link') || '/events.html'}" class="${this.getAttribute('dark') ? 'dark-secondary' : 'secondary'}">${this.getAttribute('secondary-text') || 'Learn More'}</a>
          </div>
        </div>
      </section>
    `;
  }
}
customElements.define('cta-section', CtaSection);