(function () {
    const BOOKINGS_KEY = 'bookings';
    const SERVER_TIMEOUT_MS = 5000;

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

    function isHttpPage() {
        return window.location.protocol === 'http:' || window.location.protocol === 'https:';
    }

    function mergeById(localItems, remoteItems) {
        const itemsById = new Map();

        [...localItems, ...remoteItems].forEach((item) => {
            if (item && item.id) itemsById.set(item.id, item);
        });

        return Array.from(itemsById.values()).sort((first, second) => {
            const firstDate = new Date(first.date || first.createdAt || 0).getTime();
            const secondDate = new Date(second.date || second.createdAt || 0).getTime();
            return secondDate - firstDate;
        });
    }

    function getAllBookings() {
        return readJson(BOOKINGS_KEY, []);
    }

    function saveBookingLocally(booking) {
        const bookings = getAllBookings().filter((item) => item.id !== booking.id);
        bookings.unshift(booking);
        writeJson(BOOKINGS_KEY, bookings);
    }

    function hasEnoughBookingDetails(booking) {
        return Boolean(booking && booking.id && booking.clientName && (booking.clientMobile || booking.clientEmail));
    }

    async function saveBookingToServer(booking) {
        if (!isHttpPage()) {
            return { saved: false, reason: 'server-not-running' };
        }

        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => controller.abort(), SERVER_TIMEOUT_MS);

        try {
            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(booking),
                signal: controller.signal
            });

            const data = await response.json().catch(() => ({}));

            if (response.status === 409) {
                return {
                    saved: false,
                    conflict: true,
                    status: response.status,
                    message: data.message || 'This slot is already booked. Please select another slot.',
                    data
                };
            }

            if (!response.ok) {
                throw new Error(`Excel save failed with status ${response.status}`);
            }

            return { saved: Boolean(data.ok), status: response.status, data };
        } catch (error) {
            console.warn('Excel booking save unavailable.', error);
            return { saved: false, reason: 'server-error', error };
        } finally {
            window.clearTimeout(timeoutId);
        }
    }

    async function saveBookingToCloud(booking) {
        if (!window.heroCloud) {
            return { saved: false, reason: 'cloud-unavailable' };
        }

        try {
            await window.heroCloud.saveBooking(booking);
            return { saved: window.heroCloud.getStatus?.().mode === 'cloud' };
        } catch (error) {
            console.warn('Unable to save booking to cloud.', error);
            return { saved: false, reason: 'cloud-error', error };
        }
    }

    async function saveBooking(booking) {
        const bookingToSave = {
            ...booking,
            date: booking.date || new Date().toISOString(),
            status: booking.status || 'Confirmed'
        };

        const serverResult = await saveBookingToServer(bookingToSave);

        if (serverResult.conflict) {
            const error = new Error(serverResult.message);
            error.code = 'SLOT_ALREADY_BOOKED';
            error.server = serverResult;
            throw error;
        }

        saveBookingLocally(bookingToSave);

        const cloudResult = await saveBookingToCloud(bookingToSave);

        return {
            booking: bookingToSave,
            excelSaved: serverResult.saved,
            cloudSaved: cloudResult.saved,
            server: serverResult,
            cloud: cloudResult
        };
    }

    async function syncLocalBookingsToServer() {
        if (!isHttpPage()) {
            return { synced: 0, skipped: 0, reason: 'server-not-running' };
        }

        const localBookings = getAllBookings();
        let synced = 0;
        let skipped = 0;

        for (const booking of localBookings) {
            if (!hasEnoughBookingDetails(booking)) {
                skipped += 1;
                continue;
            }

            const result = await saveBookingToServer(booking);

            if (result.saved) {
                synced += 1;
            } else {
                skipped += 1;
            }
        }

        return { synced, skipped };
    }

    async function loadBookedSlots(bookingDate) {
        if (!isHttpPage() || !bookingDate) return [];

        try {
            const response = await fetch(`/api/booking-slots?date=${encodeURIComponent(bookingDate)}`);

            if (!response.ok) {
                throw new Error(`Unable to load booked slots: ${response.status}`);
            }

            const data = await response.json();
            return Array.isArray(data.bookedSlots) ? data.bookedSlots : [];
        } catch (error) {
            console.warn('Unable to load booked slots from server.', error);
            return [];
        }
    }

    async function loadServerBookings(user) {
        if (!isHttpPage()) return [];

        const params = new URLSearchParams();
        if (user?.id) params.set('userId', user.id);
        if (user?.email) params.set('email', user.email);

        try {
            const query = params.toString();
            const response = await fetch(`/api/bookings${query ? `?${query}` : ''}`);

            if (!response.ok) {
                throw new Error(`Unable to load server bookings: ${response.status}`);
            }

            const data = await response.json();
            const serverBookings = Array.isArray(data.bookings) ? data.bookings : [];
            const merged = mergeById(getAllBookings(), serverBookings);
            writeJson(BOOKINGS_KEY, merged);
            return serverBookings;
        } catch (error) {
            console.warn('Unable to load bookings from server.', error);
            return [];
        }
    }

    async function downloadServerWorkbook(user) {
        if (!isHttpPage()) return false;

        const params = new URLSearchParams();
        if (user?.id) params.set('userId', user.id);
        if (user?.email) params.set('email', user.email);

        try {
            const query = params.toString();
            const response = await fetch(`/api/bookings/export${query ? `?${query}` : ''}`);

            if (!response.ok) return false;

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `bookings_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(link);
            link.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(link);
            return true;
        } catch (error) {
            console.warn('Unable to download server workbook.', error);
            return false;
        }
    }

    window.heroBookingStorage = {
        getAllBookings,
        loadBookedSlots,
        loadServerBookings,
        saveBooking,
        saveBookingLocally,
        syncLocalBookingsToServer,
        downloadServerWorkbook
    };

    document.addEventListener('DOMContentLoaded', () => {
        syncLocalBookingsToServer();
    });
})();
