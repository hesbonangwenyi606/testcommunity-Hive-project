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
            <h3>Test Hive</h3>
            <p>Buzzing with Quality. Kenya's premier QA community.</p>
            <div class="social-links">
              <a href="#"><i data-feather="twitter"></i></a>
              <a href="#"><i data-feather="linkedin"></i></a>
              <a href="#"><i data-feather="facebook"></i></a>
              <a href="#"><i data-feather="instagram"></i></a>
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