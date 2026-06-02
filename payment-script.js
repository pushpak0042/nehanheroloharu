document.addEventListener('DOMContentLoaded', () => {
    if (!auth.isLoggedIn()) {
        localStorage.setItem('redirectAfterLogin', 'payment.html' + window.location.search);
        window.location.href = 'index.html';
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const productName = urlParams.get('product') || 'Vehicle Advance Booking';
    const basePrice = 0;
    const serviceType = urlParams.get('type') || 'vehicle';
    const totalPrice = 0;

    const user = auth.getCurrentUser();
    const userName = document.querySelector('input[placeholder="Enter your full name"]');
    const userEmail = document.querySelector('input[placeholder="email@example.com"]');

    if (userName && !userName.value) userName.value = user.name || '';
    if (userEmail && !userEmail.value) userEmail.value = user.email || '';

    document.getElementById('pay-button').textContent = 'Confirm Booking';

    const paymentRadios = document.querySelectorAll('input[name="payment"]');
    const upiDetails = document.getElementById('payment-details-upi');
    const cardDetails = document.getElementById('payment-details-card');

    paymentRadios.forEach((radio) => {
        radio.addEventListener('change', (event) => {
            upiDetails.style.display = 'none';
            cardDetails.style.display = 'none';

            if (event.target.value === 'upi') {
                upiDetails.style.display = 'block';
            } else if (event.target.value === 'card') {
                cardDetails.style.display = 'block';
            }
        });
    });

    const payButton = document.getElementById('pay-button');
    if (!payButton) return;

    payButton.addEventListener('click', async () => {
        const clientForm = document.getElementById('client-form');
        if (clientForm && !clientForm.checkValidity()) {
            alert('Please fill all required fields');
            clientForm.reportValidity();
            return;
        }

        const booking = buildPaymentBooking(productName, totalPrice, serviceType, basePrice, user);
        payButton.disabled = true;
        payButton.textContent = 'Saving Booking...';

        try {
            await savePaymentBooking(booking);
            showPaymentSuccess(productName, booking.id);
        } catch (error) {
            console.error('Unable to save booking.', error);
            alert('Unable to save booking details. Please try again.');
            payButton.disabled = false;
            payButton.textContent = 'Confirm Booking';
        }
    });
});

function buildPaymentBooking(productName, totalPrice, serviceType, basePrice, user) {
    const clientForm = document.getElementById('client-form');
    const inputs = clientForm ? clientForm.querySelectorAll('input') : [];
    const address = clientForm?.querySelector('textarea')?.value || '';

    return {
        id: 'BK' + Date.now(),
        service: productName,
        amount: totalPrice,
        date: new Date().toISOString(),
        status: 'Confirmed',
        transactionId: 'NO_PAYMENT',
        type: serviceType,
        basePrice,
        tax: 0,
        handlingFee: 0,
        userId: user.id,
        userEmail: user.email,
        clientName: inputs[0]?.value.trim() || user.name || '',
        clientMobile: inputs[1]?.value.trim() || '',
        clientEmail: inputs[2]?.value.trim().toLowerCase() || user.email || '',
        clientAddress: address.trim(),
        clientPinCode: inputs[3]?.value.trim() || ''
    };
}

async function savePaymentBooking(booking) {
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]').filter((item) => item.id !== booking.id);
    bookings.unshift(booking);
    localStorage.setItem('bookings', JSON.stringify(bookings));

    if (window.heroCloud) {
        await window.heroCloud.saveBooking(booking);
    }
}

function showPaymentSuccess(productName, bookingId) {
    const successHTML = `
        <div class="payment-success-modal">
            <div class="success-content">
                <div class="success-icon">&#10003;</div>
                <h2>Booking Confirmed!</h2>
                <p>Thank you for your ${productName} booking.</p>
                <div class="success-details">
                    <p><strong>Booking ID:</strong> ${bookingId}</p>
                    <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')}</p>
                </div>
                <p class="success-message">Your booking details have been saved to your account${window.heroCloud?.getStatus().mode === 'cloud' ? ' and cloud database' : ''}.</p>
                <div class="success-actions">
                    <button onclick="window.location.href='index.html'" class="success-btn">Back to Home</button>
                    <button onclick="window.location.href='account.html'" class="success-btn secondary">View My Bookings</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', successHTML);
}
