class CustomFooter extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        footer {
          background: #204045;
          color: #e9e6e4;
          padding: 3rem 2rem;
        }
        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2rem;
        }
        .footer-column h3 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.25rem;
          margin-bottom: 1.5rem;
          color: white;
        }
        .footer-column ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .footer-column li {
          margin-bottom: 0.75rem;
        }
        .footer-column a {
          color: #7e9693;
          text-decoration: none;
          transition: color 0.3s;
        }
        .footer-column a:hover {
          color: white;
        }
        .social-links {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }
        .social-links a {
          color: white;
          background: rgba(255, 255, 255, 0.1);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.3s;
        }
        .social-links a:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        .copyright {
          text-align: center;
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          color: #7e9693;
          font-size: 0.875rem;
        }
      </style>
      <footer>
        <div class="footer-content">
          <div class="footer-column">
            <img src="/images/logo.png" alt="Test Community Kenya Logo" style="height: 80px; margin-bottom: 0.25rem; filter: brightness(0) invert(1);">
            <p>Buzzing with Quality. Kenya's premier QA community.</p>
            <div class="social-links">
              <a href="#" title="LinkedIn">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
                </svg>
              </a>
              <a href="mailto:hello@testhive.co.ke" title="Email">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
              </a>
              <a href="#" title="X (Twitter)">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>
          <div class="footer-column">
            <h3>Quick Links</h3>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/about.html">About</a></li>
              <li><a href="/events.html">Events</a></li>
              <li><a href="/directory.html">Directory</a></li>
            </ul>
          </div>
          <div class="footer-column">
            <h3>Resources</h3>
            <ul>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Learning Materials</a></li>
              <li><a href="#">Job Board</a></li>
              <li><a href="#">Mentorship</a></li>
            </ul>
          </div>
          <div class="footer-column">
            <h3>Contact</h3>
            <ul>
              <li><a href="mailto:hello@testhive.co.ke">hello@testhive.co.ke</a></li>
              <li><a href="tel:+254700000000">+254 700 000 000</a></li>
              <li>Nairobi, Kenya</li>
            </ul>
          </div>
        </div>
        <div class="copyright">
          <p>&copy; ${new Date().getFullYear()} Test Hive. All rights reserved.</p>
          <p>@TestCommunityKenya</p>
        </div>
      </footer>
    `;
    // Initialize feather icons after component loads
    const initIcons = () => {
      if (window.feather) {
        window.feather.replace();
      } else {
        setTimeout(initIcons, 100);
      }
    };
    initIcons();
}
}
customElements.define('custom-footer', CustomFooter);