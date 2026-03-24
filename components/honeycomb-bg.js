class HoneycombBackground extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: 0;
        }
        .honeycomb {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
          width: 100%;
          height: 100%;
          transform: rotate(120deg);
        }
        .hexagon {
          position: relative;
          width: 100px;
          height: 55px;
          margin: 2px;
          background: rgba(255, 204, 102, 0.1);
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
          transition: all 0.3s ease;
          animation: float 15s infinite ease-in-out;
        }
        .hexagon:nth-child(2n) {
          animation-delay: 2s;
        }
        .hexagon:nth-child(3n) {
          animation-delay: 4s;
        }
        .hexagon:nth-child(4n) {
          animation-delay: 6s;
        }
        .hexagon:nth-child(5n) {
          animation-delay: 8s;
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.1;
          }
          50% {
            transform: translateY(-20px) rotate(10deg);
            opacity: 0.3;
          }
        }
      </style>
      <div class="honeycomb" id="honeycomb"></div>
    `;

    // Generate honeycomb pattern
    const honeycomb = this.shadowRoot.getElementById('honeycomb');
    const hexCount = Math.ceil(window.innerWidth / 50) * Math.ceil(window.innerHeight / 50);
    
    for (let i = 0; i < hexCount; i++) {
      const hex = document.createElement('div');
      hex.className = 'hexagon';
      hex.style.animationDelay = `${Math.random() * 10}s`;
      honeycomb.appendChild(hex);
    }
  }
}

customElements.define('honeycomb-bg', HoneycombBackground);