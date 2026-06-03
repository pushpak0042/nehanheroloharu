document.addEventListener('DOMContentLoaded', () => {
    const serviceCards = document.querySelectorAll('.service-action-card');

    serviceCards.forEach((card) => {
        if (!card.hasAttribute('role')) card.setAttribute('role', 'button');
        if (!card.hasAttribute('tabindex')) card.setAttribute('tabindex', '0');

        card.addEventListener('click', () => {
            const serviceName = card.getAttribute('data-service') || card.querySelector('strong')?.textContent || 'Hero Service';
            redirectToServiceBooking(serviceName);
        });

        card.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;

            event.preventDefault();
            const serviceName = card.getAttribute('data-service') || card.querySelector('strong')?.textContent || 'Hero Service';
            redirectToServiceBooking(serviceName);
        });
    });
});

function redirectToServiceBooking(serviceName) {
    const params = new URLSearchParams({
        product: serviceName,
        type: 'service'
    });
    const bookingUrl = `booking.html?${params.toString()}`;

    if (typeof auth !== 'undefined' && !auth.isLoggedIn()) {
        localStorage.setItem('redirectAfterLogin', bookingUrl);
        showLoginModal();
        return;
    }

    window.location.href = bookingUrl;
}
