// Account Page Script
const currencyFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
});

document.addEventListener('DOMContentLoaded', async () => {
    if (!auth.isLoggedIn()) {
        localStorage.setItem('redirectAfterLogin', 'account.html');
        document.querySelector('.account-container')?.classList.add('is-locked');
        showLoginModal();
        return;
    }

    const user = auth.getCurrentUser();

    displayUserInfo(user);
    initializeAccountTabs();
    initializeProfileSettings(user);
    await hydrateBookingsFromCloud(user);
    await loadBookingData(user);
    initializeBookingsService(user);
    initializeOffersRewards(user);
    initializeSupportRequests(user);
});

function formatCurrency(amount) {
    return currencyFormatter.format(Number(amount) || 0);
}

function escapeHtml(value) {
    const element = document.createElement('div');
    element.textContent = value == null ? '' : String(value);
    return element.innerHTML;
}

function readJson(key, fallback) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
    } catch (error) {
        console.warn('Unable to read saved data:', key, error);
        return fallback;
    }
}

function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function profileKey(user) {
    return `userProfile_${user.id}`;
}

function getInitials(name, email) {
    const source = (name || email || 'User').trim();
    const words = source.includes('@') ? [source.split('@')[0]] : source.split(/\s+/);
    return words.slice(0, 2).map((word) => word.charAt(0).toUpperCase()).join('') || 'U';
}

function displayUserInfo(user) {
    const nameDisplay = document.getElementById('userNameDisplay');
    const emailDisplay = document.getElementById('userEmailDisplay');
    const memberSinceDisplay = document.getElementById('memberSinceDisplay');
    const avatar = document.querySelector('.profile-avatar');

    if (nameDisplay) nameDisplay.textContent = user.name || 'User';
    if (emailDisplay) emailDisplay.textContent = user.email || 'email@example.com';
    if (avatar) avatar.textContent = getInitials(user.name, user.email);
    if (memberSinceDisplay) {
        const date = user.loginTime ? new Date(user.loginTime) : new Date();
        memberSinceDisplay.textContent = Number.isNaN(date.getFullYear()) ? new Date().getFullYear() : date.getFullYear();
    }
}

function initializeAccountTabs() {
    const tabBtns = document.querySelectorAll('.account-tab-btn');
    const tabPanes = document.querySelectorAll('.account-tab-pane');

    tabBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            const pane = document.getElementById(`tab-${tabName}`);

            if (!pane) return;

            tabBtns.forEach((button) => button.classList.remove('active'));
            tabPanes.forEach((item) => item.classList.remove('active'));
            btn.classList.add('active');
            pane.classList.add('active');
        });
    });
}

function initializeProfileSettings(user) {
    const profileForm = document.getElementById('profileForm');
    if (!profileForm) return;

    const savedProfile = readJson(profileKey(user), readJson('userProfile', {}));

    document.getElementById('profileName').value = savedProfile.fullName || user.name || '';
    document.getElementById('profileEmail').value = savedProfile.email || user.email || '';
    document.getElementById('profilePhone').value = savedProfile.phone || '';
    document.getElementById('profileAddress').value = savedProfile.address || '';
    document.getElementById('profileCity').value = savedProfile.city || '';
    document.getElementById('profileState').value = savedProfile.state || '';
    document.getElementById('profilePincode').value = savedProfile.pincode || '';

    profileForm.onsubmit = async (event) => {
        event.preventDefault();

        const profileData = {
            fullName: document.getElementById('profileName').value.trim(),
            email: document.getElementById('profileEmail').value.trim().toLowerCase(),
            phone: document.getElementById('profilePhone').value.trim(),
            address: document.getElementById('profileAddress').value.trim(),
            city: document.getElementById('profileCity').value.trim(),
            state: document.getElementById('profileState').value.trim(),
            pincode: document.getElementById('profilePincode').value.trim(),
            lastUpdated: new Date().toISOString()
        };

        writeJson(profileKey(user), profileData);
        writeJson('userProfile', profileData);

        const updatedUser = {
            ...user,
            name: profileData.fullName || user.name,
            email: profileData.email || user.email
        };
        auth.saveUserToStorage(updatedUser);
        displayUserInfo(updatedUser);

        try {
            await window.heroCloud?.saveProfile(updatedUser.id, profileData);
            await window.heroCloud?.saveUser(updatedUser, 'profile-update');
        } catch (error) {
            console.warn('Unable to sync profile to cloud.', error);
        }

        showNotification('Profile updated successfully.', 'success');
    };
}

async function hydrateBookingsFromCloud(user) {
    if (!window.heroCloud) return;

    try {
        await window.heroCloud.loadBookings(user.id);
    } catch (error) {
        console.warn('Unable to load cloud bookings.', error);
    }
}

function bookingBelongsToUser(booking, user) {
    if (!booking || !user) return false;
    if (!booking.userId && !booking.userEmail && !booking.clientEmail) return true;
    return booking.userId === user.id ||
        String(booking.userEmail || '').toLowerCase() === String(user.email || '').toLowerCase() ||
        String(booking.clientEmail || '').toLowerCase() === String(user.email || '').toLowerCase();
}

function getAllBookings() {
    return readJson('bookings', []);
}

function getBookings(user = auth.getCurrentUser()) {
    return getAllBookings().filter((booking) => bookingBelongsToUser(booking, user));
}

function saveBookingLocally(booking) {
    const bookings = getAllBookings().filter((item) => item.id !== booking.id);
    bookings.unshift(booking);
    writeJson('bookings', bookings);
}

async function addBooking(bookingData, user = auth.getCurrentUser()) {
    const booking = {
        id: bookingData.id || 'BK' + Date.now(),
        service: bookingData.service || 'Service Booking',
        amount: Number(bookingData.amount) || 0,
        date: bookingData.date || new Date().toISOString(),
        status: bookingData.status || 'Confirmed',
        transactionId: bookingData.transactionId || 'TXN' + Date.now(),
        userId: user?.id || '',
        userEmail: user?.email || '',
        ...bookingData
    };

    saveBookingLocally(booking);

    try {
        await window.heroCloud?.saveBooking(booking);
    } catch (error) {
        console.warn('Unable to save booking to cloud.', error);
    }

    return booking;
}

function initializeBookingsService(user) {
    const bookingList = document.getElementById('bookingsList');
    if (!bookingList) return;

    const bookings = getBookings(user);

    if (bookings.length === 0) {
        bookingList.innerHTML = '<p class="empty-message">No bookings yet. <a href="service.html">Book a service now</a></p>';
        return;
    }

    bookingList.innerHTML = bookings.map((booking) => `
        <div class="booking-card">
            <div class="booking-header">
                <h4>${escapeHtml(booking.service || 'Booking')}</h4>
                <span class="booking-id">#${escapeHtml(booking.id)}</span>
            </div>
            <div class="booking-details">
                <p><strong>Booking Date:</strong> ${booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString('en-IN') : 'Not specified'}</p>
                <p><strong>Time Slot:</strong> ${escapeHtml(booking.bookingSlot || 'Not specified')}</p>
                <p><strong>Client Name:</strong> ${escapeHtml(booking.clientName || 'N/A')}</p>
                <p><strong>Status:</strong> <span class="status ${escapeHtml(String(booking.status || '').toLowerCase())}">${escapeHtml(booking.status || 'Confirmed')}</span></p>
            </div>
            <div class="booking-actions">
                <button class="action-btn download-btn" onclick="downloadReceipt('${escapeHtml(booking.id)}')">Download Receipt</button>
                <button class="action-btn reschedule-btn" onclick="rescheduleBooking('${escapeHtml(booking.id)}')">Reschedule</button>
            </div>
        </div>
    `).join('');
}

function getLoyaltyPoints(userId) {
    const points = localStorage.getItem('loyaltyPoints_' + userId);
    return points ? parseInt(points, 10) : 0;
}

function addLoyaltyPoints(userId, points) {
    const current = getLoyaltyPoints(userId);
    localStorage.setItem('loyaltyPoints_' + userId, (current + points).toString());
}

function initializeOffersRewards(user) {
    const offersContainer = document.getElementById('offersContainer');
    if (!offersContainer) return;

    const loyaltyPoints = getLoyaltyPoints(user.id);
    const offers = [
        {
            title: 'Free Service Discount',
            description: '20% off on next service booking',
            discount: '20%',
            code: 'SERVICE20',
            expiry: '30 June 2026'
        },
        {
            title: 'Extended Warranty',
            description: 'Extra year warranty at 50% discount',
            discount: '50%',
            code: 'WARRANT50',
            expiry: '15 August 2026'
        },
        {
            title: 'Genuine Parts Offer',
            description: 'Free delivery on parts orders above Rs. 500',
            discount: 'FREE',
            code: 'PARTS500',
            expiry: '30 September 2026'
        },
        {
            title: 'Referral Bonus',
            description: 'Get Rs. 500 for each friend who books a service',
            discount: 'Rs. 500',
            code: 'REFER500',
            expiry: '31 December 2026'
        }
    ];

    offersContainer.innerHTML = `
        <div class="rewards-summary">
            <div class="points-card">
                <h3>Loyalty Points</h3>
                <div class="points-amount">${loyaltyPoints}</div>
                <p>Earn points on every booking and redeem for discounts</p>
            </div>
        </div>
        <div class="offers-grid">
            ${offers.map((offer) => `
                <div class="offer-card">
                    <div class="offer-badge">${escapeHtml(offer.discount)}</div>
                    <h4>${escapeHtml(offer.title)}</h4>
                    <p>${escapeHtml(offer.description)}</p>
                    <div class="offer-details">
                        <p><strong>Code:</strong> <code>${escapeHtml(offer.code)}</code></p>
                        <p><strong>Expires:</strong> ${escapeHtml(offer.expiry)}</p>
                    </div>
                    <button class="offer-btn" onclick="applyOffer('${escapeHtml(offer.code)}')">Apply Offer</button>
                </div>
            `).join('')}
        </div>
    `;
}

function getSupportRequests(user = auth.getCurrentUser()) {
    const requests = readJson('supportRequests', []);
    return requests.filter((request) => !request.userId || request.userId === user.id);
}

function initializeSupportRequests(user) {
    const supportForm = document.getElementById('supportForm');
    const supportList = document.getElementById('supportList');
    if (!supportForm || !supportList) return;

    renderSupportRequests(user);

    supportForm.onsubmit = (event) => {
        event.preventDefault();

        const request = {
            id: 'TKT' + Date.now(),
            userId: user.id,
            category: document.getElementById('supportCategory').value,
            subject: document.getElementById('supportSubject').value.trim(),
            message: document.getElementById('supportMessage').value.trim(),
            status: 'Open',
            date: new Date().toISOString(),
            response: null
        };

        const requests = readJson('supportRequests', []);
        requests.unshift(request);
        writeJson('supportRequests', requests);

        showNotification('Support request submitted. Ticket ID: ' + request.id, 'success');
        supportForm.reset();
        renderSupportRequests(user);
    };
}

function renderSupportRequests(user) {
    const supportList = document.getElementById('supportList');
    if (!supportList) return;

    const requests = getSupportRequests(user);

    if (requests.length === 0) {
        supportList.innerHTML = '<p class="empty-message">No support requests yet</p>';
        return;
    }

    supportList.innerHTML = requests.map((request) => `
        <div class="support-ticket">
            <div class="ticket-header">
                <h4>${escapeHtml(request.subject)}</h4>
                <span class="ticket-id">#${escapeHtml(request.id)}</span>
            </div>
            <div class="ticket-details">
                <p><strong>Category:</strong> ${escapeHtml(request.category)}</p>
                <p><strong>Status:</strong> <span class="status ${escapeHtml(String(request.status || '').toLowerCase())}">${escapeHtml(request.status)}</span></p>
                <p><strong>Created:</strong> ${new Date(request.date).toLocaleDateString('en-IN')}</p>
            </div>
            <div class="ticket-message">
                <p>${escapeHtml(request.message)}</p>
            </div>
            ${request.response ? `
                <div class="ticket-response">
                    <h5>Response from Support:</h5>
                    <p>${escapeHtml(request.response)}</p>
                </div>
            ` : ''}
        </div>
    `).join('');
}

async function loadBookingData(user) {
    const urlParams = new URLSearchParams(window.location.search);
    const fromPayment = urlParams.get('from') === 'payment';

    if (!fromPayment) return;

    const bookingId = urlParams.get('bookingId') || 'BK' + Date.now();
    const alreadySaved = getAllBookings().some((booking) => booking.id === bookingId);
    if (alreadySaved) return;

    const booking = await addBooking({
        id: bookingId,
        service: urlParams.get('service') || 'Service Booking',
        amount: parseInt(urlParams.get('amount') || '0', 10)
    }, user);

    addLoyaltyPoints(user.id, Math.floor((booking.amount || 0) / 100));
}

function downloadReceipt(bookingId) {
    const booking = getBookings().find((item) => item.id === bookingId);

    if (!booking) return;

    const receipt = `
HERO MOTOCORP - BOOKING RECEIPT
================================
Booking ID: ${booking.id}
Service: ${booking.service}
Date: ${new Date(booking.date).toLocaleDateString('en-IN')}
Status: ${booking.status}

Thank you for booking with Hero MotoCorp.
    `;

    const blob = new Blob([receipt], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt_${bookingId}.txt`;
    document.body.appendChild(link);
    link.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);

    showNotification('Receipt downloaded successfully.', 'success');
}

function rescheduleBooking() {
    showNotification('Reschedule support is coming soon. Please contact support.', 'info');
}

function applyOffer(code) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(code);
    }
    showNotification(`Offer code "${code}" copied.`, 'success');
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function csvValue(value) {
    return `"${String(value ?? 'N/A').replace(/"/g, '""')}"`;
}

function exportBookingsToExcel() {
    const bookings = getBookings();

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
            csvValue(booking.service),
            booking.bookingDate || 'N/A',
            booking.bookingSlot || 'N/A',
            booking.status,
            csvValue(booking.clientName),
            csvValue(booking.clientMobile),
            csvValue(booking.clientEmail),
            csvValue(booking.clientAddress),
            csvValue(booking.clientPinCode),
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
