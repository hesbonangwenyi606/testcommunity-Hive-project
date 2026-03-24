class CustomNavbar extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
        }
        nav {
          background: rgba(233, 230, 228, 0.95);
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .logo img {
          height: 40px;
        }
.logo i {
          color: #7e9693;
        }
        .nav-links {
          display: flex;
          gap: 2rem;
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .nav-links a {
          color: #204045;
          text-decoration: none;
          font-weight: 500;
          position: relative;
          transition: color 0.3s;
        }
        .nav-links a:hover {
          color: #7e9693;
        }
        .nav-links a:not(.primary-button):after {
          content: '';
          position: absolute;
          width: 0;
          height: 2px;
          bottom: -4px;
          left: 0;
          background-color: #7e9693;
          transition: width 0.3s;
        }
        .nav-links a:not(.primary-button):hover:after {
          width: 100%;
}
        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          color: #204045;
          cursor: pointer;
        }
        .nav-links a.primary-button {
          margin-left: 1rem;
          border: 2px solid #204045;
          padding: 0.75rem 1.5rem;
          border-radius: 9999px;
          color: #204045;
          font-weight: 500;
          transition: all 0.3s;
        }
        .nav-links a.primary-button:hover {
          background: #204045;
          color: white;
        }
@media (max-width: 768px) {
          .nav-links {
            display: none;
          }
          .mobile-menu-btn {
            display: block;
          }
        }
      </style>
      <nav>
        <a href="/" class="logo">
          <img src="/static/testhive-logo.png" alt="Test Hive Logo" class="h-10">
        </a>
<ul class="nav-links">
          <li><a href="/">Home</a></li>
          <li><a href="/about.html">About</a></li>
          <li><a href="/events.html" class="active">Events</a></li>
          <li><a href="/directory.html" class="active">Directory</a></li>
<li><a href="#" class="primary-button" data-join-modal>Join the Hive</a></li>
</ul>
<button class="mobile-menu-btn">
          <i data-feather="menu"></i>
        </button>
      </nav>
    `;
  // Initialize feather icons
  const initIcons = () => {
    if (window.feather) {
      window.feather.replace();
    } else {
      setTimeout(initIcons, 100);
    }
  };
  initIcons();
  // Handle join modal trigger
  this.shadowRoot.addEventListener('click', (e) => {
    if (e.target.closest('[data-join-modal]')) {
      e.preventDefault();
      const modal = document.querySelector('join-modal');
      if (modal) {
        modal.openModal();
      }
    }
  });
}
}
customElements.define('custom-navbar', CustomNavbar);