document.addEventListener('DOMContentLoaded', () => {
    const serviceCards = document.querySelectorAll('.service-action-card');

    serviceCards.forEach((card) => {
        card.addEventListener('click', () => {
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
