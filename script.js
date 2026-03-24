
// Shared JavaScript across all pages
document.addEventListener('DOMContentLoaded', function() {
// Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    // Initialize feather icons
if (window.feather) {
        window.feather.replace();
    }
    // Handle join modal triggers outside shadow DOM
    document.addEventListener('click', (e) => {
        if (e.target.matches('[data-join-modal], [data-join-modal] *')) {
            e.preventDefault();
            const modal = document.querySelector('join-modal');
            if (modal) {
                modal.openModal();
            }
        }
    });
// Mobile menu toggle functionality will be added here later
    // Team carousel functionality
    // Initialize any additional carousels here if needed
});
