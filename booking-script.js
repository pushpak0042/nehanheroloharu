document.addEventListener('DOMContentLoaded', () => {
    if (!auth.isLoggedIn()) {
        localStorage.setItem('redirectAfterLogin', 'booking.html' + window.location.search);
        document.querySelector('.booking-container')?.classList.add('is-locked');
        showLoginModal();
        return;
    }

    initializeBookingPage();
});

let bookingData = {
    productName: '',
    variant: '',
    color: '',
    vehiclePrice: 0,
    basePrice: 0,
    serviceType: 'vehicle',
    handlingFee: 0,
    rtoTax: 0,
    totalPrice: 0
};

function parseAmount(value, fallback = 0) {
    const parsed = parseInt(String(value || '').replace(/[^\d]/g, ''), 10);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

function escapeBookingHtml(value) {
    const element = document.createElement('div');
    element.textContent = value == null ? '' : String(value);
    return element.innerHTML;
}

function getField(selector, fallbackSelector) {
    return document.querySelector(selector) || (fallbackSelector ? document.querySelector(fallbackSelector) : null);
}

function initializeBookingPage() {
    const urlParams = new URLSearchParams(window.location.search);

    bookingData.serviceType = urlParams.get('type') || 'vehicle';
    bookingData.productName = urlParams.get('product') || urlParams.get('bike') ||
        (bookingData.serviceType === 'service' ? 'Vehicle Service Booking' : 'Vehicle Advance Booking');
    bookingData.variant = urlParams.get('variant') || '';
    bookingData.color = urlParams.get('color') || '';
    bookingData.basePrice = 0;
    bookingData.vehiclePrice = parseAmount(urlParams.get('vehiclePrice'), 0);
    bookingData.handlingFee = 0;
    bookingData.rtoTax = 0;
    bookingData.totalPrice = 0;

    const user = auth.getCurrentUser();
    prefillUserDetails(user);
    renderBookingSummary();
    setupBookingSlots();
    setupPaymentMethods();
    setupConfirmButton();
}

function prefillUserDetails(user) {
    if (!user) return;

    const nameInput = getField('#client-name', 'input[placeholder="Enter your full name"], input[placeholder="Enter Name"]');
    const emailInput = getField('#client-email', 'input[placeholder="email@example.com"], input[placeholder="example@email.com"]');

    if (nameInput && !nameInput.value) nameInput.value = user.name || '';
    if (emailInput && !emailInput.value) emailInput.value = user.email || '';
}

function renderBookingSummary() {
    setText('bikeName', bookingData.productName);
    setText('bikeVariant', bookingData.variant || 'Standard');
    setText('bookingType', bookingData.serviceType === 'service' ? 'Service' : 'Vehicle');

    const variantRow = document.getElementById('variant-row');
    if (variantRow) variantRow.style.display = bookingData.variant || bookingData.color ? 'flex' : 'none';

    const feeRow = document.getElementById('summary-fees-row') ||
        document.querySelector('[data-fee-row]') ||
        Array.from(document.querySelectorAll('.summary-box .summary-item'))
            .find((row) => /booking fee|service fee|additional fees/i.test(row.textContent));
    if (feeRow) feeRow.style.display = 'none';

    const payButton = document.getElementById('pay-button') || document.getElementById('payBtn');
    if (payButton) {
        payButton.textContent = bookingData.serviceType === 'service' ? 'Confirm Service Booking' : 'Confirm Vehicle Booking';
    }
}

function setupBookingSlots() {
    const bookingDateInput = document.getElementById('booking-date');
    if (!bookingDateInput) return;

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const minDate = tomorrow.toISOString().split('T')[0];
    const maxDate = new Date(tomorrow);
    maxDate.setDate(maxDate.getDate() + 30);

    bookingDateInput.setAttribute('min', minDate);
    bookingDateInput.setAttribute('max', maxDate.toISOString().split('T')[0]);
    bookingDateInput.addEventListener('change', loadAvailableSlots);
}

function loadAvailableSlots() {
    const bookingDateInput = document.getElementById('booking-date');
    const slotContainer = document.getElementById('available-slots');
    const selectedDate = bookingDateInput?.value;

    if (!slotContainer || !selectedDate) return;

    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const bookedSlots = bookings
        .filter((booking) => booking.bookingDate === selectedDate)
        .map((booking) => booking.bookingSlot);

    const allSlots = [
        '09:00-10:00',
        '10:00-11:00',
        '11:00-12:00',
        '14:00-15:00',
        '15:00-16:00',
        '16:00-17:00',
        '17:00-18:00'
    ];

    slotContainer.innerHTML = `
        <div class="slots-info">
            <p><strong>Available Slots for ${new Date(selectedDate).toLocaleDateString('en-IN')}:</strong></p>
            <div class="slots-grid">
                ${allSlots.map((slot) => {
                    const isBooked = bookedSlots.includes(slot);
                    return `
                        <div class="slot-option ${isBooked ? 'booked' : 'available'}"
                             data-slot="${slot}"
                             onclick="selectSlot('${slot}', this)"
                             style="cursor: ${isBooked ? 'not-allowed' : 'pointer'}; opacity: ${isBooked ? 0.5 : 1};">
                            <span>${formatSlotTime(slot.split('-')[0])}</span>
                            <small>${isBooked ? 'Booked' : 'Available'}</small>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

function formatSlotTime(time) {
    const [hours, mins] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${mins} ${ampm}`;
}

window.selectSlot = function selectSlot(slot, element) {
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const selectedDate = document.getElementById('booking-date')?.value;
    const isBooked = bookings.some((booking) => booking.bookingDate === selectedDate && booking.bookingSlot === slot);

    if (isBooked) {
        alert('This slot is already booked. Please select another slot.');
        return;
    }

    document.querySelectorAll('.slot-option').forEach((item) => item.classList.remove('selected'));
    element.classList.add('selected');

    const slotInput = document.getElementById('booking-slot');
    if (slotInput) slotInput.value = slot;
};

function setupPaymentMethods() {
    const paymentRadios = document.querySelectorAll('input[name="payment"]');
    const upiDetails = document.getElementById('payment-details-upi');
    const cardDetails = document.getElementById('payment-details-card');

    if (!paymentRadios.length || !upiDetails || !cardDetails) return;

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
}

function setupConfirmButton() {
    const payButton = document.getElementById('pay-button') || document.getElementById('payBtn');
    if (!payButton) return;

    payButton.addEventListener('click', async () => {
        const clientForm = document.getElementById('client-form');
        const bookingDate = document.getElementById('booking-date')?.value || '';
        const bookingSlot = document.getElementById('booking-slot')?.value || '';

        if (clientForm && !clientForm.checkValidity()) {
            clientForm.reportValidity();
            return;
        }

        if (!bookingDate) {
            alert('Please select a preferred booking date.');
            document.getElementById('booking-date')?.focus();
            return;
        }

        if (!bookingSlot) {
            alert('Please select an available time slot.');
            return;
        }

        const booking = buildBooking(bookingDate, bookingSlot);
        payButton.disabled = true;
        payButton.textContent = 'Saving Booking...';

        try {
            await saveBooking(booking);
            showBookingSuccess(booking);
        } catch (error) {
            console.error('Unable to save booking.', error);
            alert('Unable to save the booking. Please try again.');
            payButton.disabled = false;
            renderBookingSummary();
        }
    });
}

function buildBooking(bookingDate, bookingSlot) {
    const user = auth.getCurrentUser();
    const fullName = getField('#client-name', 'input[placeholder="Enter your full name"], input[placeholder="Enter Name"]')?.value || user.name || '';
    const mobileNumber = getField('#client-mobile', 'input[placeholder="+91"]')?.value || '';
    const email = getField('#client-email', 'input[placeholder="email@example.com"], input[placeholder="example@email.com"]')?.value || user.email || '';
    const address = getField('#client-address', 'textarea')?.value || '';
    const city = getField('#client-city', 'input[placeholder="Enter City"]')?.value || '';
    const pinCode = getField('#client-pincode', 'input[placeholder="e.g. 127021"]')?.value || '';

    return {
        id: 'BK' + Date.now(),
        service: bookingData.productName,
        amount: 0,
        date: new Date().toISOString(),
        status: 'Confirmed',
        transactionId: 'NO_PAYMENT',
        type: bookingData.serviceType,
        variant: bookingData.variant,
        color: bookingData.color,
        vehiclePrice: bookingData.vehiclePrice,
        basePrice: bookingData.basePrice,
        handlingFee: 0,
        tax: 0,
        userId: user.id,
        userEmail: user.email,
        clientName: fullName.trim(),
        clientMobile: mobileNumber.trim(),
        clientEmail: email.trim().toLowerCase(),
        clientAddress: address.trim(),
        clientCity: city.trim(),
        clientPinCode: pinCode.trim(),
        bookingDate,
        bookingSlot
    };
}

async function saveBooking(booking) {
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]').filter((item) => item.id !== booking.id);
    bookings.unshift(booking);
    localStorage.setItem('bookings', JSON.stringify(bookings));

    if (window.heroCloud) {
        await window.heroCloud.saveBooking(booking);
    }
}

function showBookingSuccess(booking) {
    const bookingDate = booking.bookingDate
        ? new Date(booking.bookingDate).toLocaleDateString('en-IN')
        : 'N/A';
    const successHTML = `
        <div class="payment-success-modal">
            <div class="success-content">
                <div class="success-icon">&#10003;</div>
                <h2>Booking Confirmed!</h2>
                <p>Thank you for your ${escapeBookingHtml(booking.service)} booking.</p>
                <div class="success-details">
                    <p><strong>Booking ID:</strong> ${escapeBookingHtml(booking.id)}</p>
                    <p><strong>Visit Date:</strong> ${escapeBookingHtml(bookingDate)}</p>
                    <p><strong>Time Slot:</strong> ${escapeBookingHtml(booking.bookingSlot || 'N/A')}</p>
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

function exportBookingsToExcel() {
    const user = auth.getCurrentUser();
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]')
        .filter((booking) => !booking.userId || booking.userId === user.id || booking.userEmail === user.email);

    if (bookings.length === 0) {
        alert('No bookings to export');
        return;
    }

    let csvContent = 'data:text/csv;charset=utf-8,';
    const headers = ['Booking ID', 'Product', 'Booking Date', 'Time Slot', 'Status', 'Client Name', 'Mobile', 'Email', 'Address', 'PIN', 'Created Date'];
    csvContent += headers.join(',') + '\n';

    bookings.forEach((booking) => {
        const row = [
            booking.id,
            `"${booking.service || ''}"`,
            booking.bookingDate || 'N/A',
            booking.bookingSlot || 'N/A',
            booking.status,
            `"${booking.clientName || 'N/A'}"`,
            `"${booking.clientMobile || 'N/A'}"`,
            `"${booking.clientEmail || 'N/A'}"`,
            `"${booking.clientAddress || 'N/A'}"`,
            `"${booking.clientPinCode || 'N/A'}"`,
            new Date(booking.date).toLocaleDateString('en-IN')
        ];
        csvContent += row.join(',') + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bookings_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
