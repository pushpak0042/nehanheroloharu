(function () {
    const CLOUD_STATUS_KEY = "heroCloudStatus";
    const FIREBASE_APP_URL = "https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js";
    const FIREBASE_FIRESTORE_URL = "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore-compat.js";

    function readJson(key, fallback) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : fallback;
        } catch (error) {
            console.warn("Unable to read local data", key, error);
            return fallback;
        }
    }

    function writeJson(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.warn("Unable to save local data", key, error);
        }
    }

    function hasFirebaseConfig() {
        const firebase = window.HERO_CLOUD_CONFIG && window.HERO_CLOUD_CONFIG.firebase;
        return Boolean(firebase && firebase.apiKey && firebase.projectId && firebase.appId);
    }

    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const existing = document.querySelector(`script[src="${src}"]`);
            if (existing) {
                existing.addEventListener("load", resolve, { once: true });
                existing.addEventListener("error", reject, { once: true });
                if (existing.dataset.loaded === "true") resolve();
                return;
            }

            const script = document.createElement("script");
            script.src = src;
            script.async = true;
            script.onload = () => {
                script.dataset.loaded = "true";
                resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    function mergeById(localItems, remoteItems) {
        const map = new Map();
        [...localItems, ...remoteItems].forEach((item) => {
            if (item && item.id) map.set(item.id, item);
        });
        return Array.from(map.values()).sort((a, b) => {
            const aDate = new Date(a.date || a.createdAt || 0).getTime();
            const bDate = new Date(b.date || b.createdAt || 0).getTime();
            return bDate - aDate;
        });
    }

    class HeroCloudSync {
        constructor() {
            this.db = null;
            this.ready = this.initialize();
        }

        async initialize() {
            if (!hasFirebaseConfig()) {
                this.setStatus("local", "Firebase config missing; using local browser storage.");
                return false;
            }

            try {
                await loadScript(FIREBASE_APP_URL);
                await loadScript(FIREBASE_FIRESTORE_URL);

                if (!window.firebase.apps.length) {
                    window.firebase.initializeApp(window.HERO_CLOUD_CONFIG.firebase);
                }

                this.db = window.firebase.firestore();
                this.setStatus("cloud", "Cloud save enabled.");
                return true;
            } catch (error) {
                console.warn("Cloud save unavailable; using local storage.", error);
                this.setStatus("local", "Cloud unavailable; using local browser storage.");
                return false;
            }
        }

        setStatus(mode, message) {
            writeJson(CLOUD_STATUS_KEY, {
                mode,
                message,
                updatedAt: new Date().toISOString()
            });
        }

        getStatus() {
            return readJson(CLOUD_STATUS_KEY, {
                mode: "local",
                message: "Using local browser storage."
            });
        }

        async saveUser(user, eventName) {
            if (!user || !user.id) return;
            await this.ready;

            if (!this.db) return;

            const cleanUser = {
                id: user.id,
                name: user.name || "",
                email: user.email || "",
                loginTime: user.loginTime || "",
                updatedAt: new Date().toISOString()
            };

            await this.db.collection("users").doc(user.id).set(cleanUser, { merge: true });

            if (eventName) {
                await this.db.collection("loginEvents").add({
                    userId: user.id,
                    email: user.email || "",
                    event: eventName,
                    createdAt: new Date().toISOString()
                });
            }
        }

        async saveProfile(userId, profile) {
            if (!userId || !profile) return;
            await this.ready;
            if (!this.db) return;

            await this.db.collection("users").doc(userId).set({
                profile,
                updatedAt: new Date().toISOString()
            }, { merge: true });
        }

        async saveBooking(booking) {
            if (!booking || !booking.id) return;
            await this.ready;
            if (!this.db) return;

            const userId = booking.userId || "guest";
            const payload = {
                ...booking,
                updatedAt: new Date().toISOString()
            };

            await this.db.collection("bookings").doc(booking.id).set(payload, { merge: true });
            await this.db.collection("users").doc(userId).collection("bookings").doc(booking.id).set(payload, { merge: true });
        }

        async loadBookings(userId) {
            const localBookings = readJson("bookings", []);
            await this.ready;

            if (!this.db || !userId) return localBookings;

            try {
                const snapshot = await this.db
                    .collection("users")
                    .doc(userId)
                    .collection("bookings")
                    .orderBy("date", "desc")
                    .get();

                const cloudBookings = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                const merged = mergeById(localBookings, cloudBookings);
                writeJson("bookings", merged);
                return merged;
            } catch (error) {
                console.warn("Unable to load cloud bookings.", error);
                return localBookings;
            }
        }
    }

    window.heroCloud = window.heroCloud || new HeroCloudSync();
})();
