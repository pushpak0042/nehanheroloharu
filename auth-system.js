// Authentication System
class AuthSystem {
    constructor() {
        this.usersKey = 'registeredUsers';
        this.currentUser = this.loadUserFromStorage();
    }

    // Load user from localStorage
    loadUserFromStorage() {
        try {
            const user = localStorage.getItem('currentUser');
            return user ? JSON.parse(user) : null;
        } catch (error) {
            console.warn('Unable to load saved user.', error);
            return null;
        }
    }

    // Save user to localStorage
    saveUserToStorage(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUser = user;
    }

    normalizeEmail(email) {
        return String(email || '').trim().toLowerCase();
    }

    loadRegisteredUsers() {
        try {
            const users = localStorage.getItem(this.usersKey);
            return users ? JSON.parse(users) : [];
        } catch (error) {
            console.warn('Unable to load registered users.', error);
            return [];
        }
    }

    saveRegisteredUsers(users) {
        localStorage.setItem(this.usersKey, JSON.stringify(users));
    }

    findRegisteredUser(email) {
        const normalizedEmail = this.normalizeEmail(email);
        return this.loadRegisteredUsers().find((user) => user.email === normalizedEmail) || null;
    }

    createUserId(email) {
        const normalizedEmail = this.normalizeEmail(email);
        let hash = 0;

        for (let i = 0; i < normalizedEmail.length; i += 1) {
            hash = ((hash << 5) - hash) + normalizedEmail.charCodeAt(i);
            hash |= 0;
        }

        return 'USR' + Math.abs(hash || Date.now());
    }

    buildUser(email, name, id) {
        const normalizedEmail = this.normalizeEmail(email);

        return {
            id: id || this.createUserId(normalizedEmail),
            email: normalizedEmail,
            name: name || normalizedEmail.split('@')[0] || 'User',
            loginTime: new Date().toISOString()
        };
    }

    syncUserToCloud(user, eventName) {
        if (!window.heroCloud || !user) return;

        window.heroCloud.saveUser(user, eventName).catch((error) => {
            console.warn('Unable to save user to cloud.', error);
        });
    }

    // Check if user is logged in
    isLoggedIn() {
        return this.currentUser !== null;
    }

    // Get current user info
    getCurrentUser() {
        return this.currentUser;
    }

    // Login user
    login(email, password) {
        const normalizedEmail = this.normalizeEmail(email);
        const savedUser = this.findRegisteredUser(normalizedEmail);

        if (!savedUser) {
            return {
                success: false,
                message: 'No user found. Please sign up first.'
            };
        }

        if (savedUser.password !== String(password || '')) {
            return {
                success: false,
                message: 'Incorrect password. Please try again.'
            };
        }

        const user = this.buildUser(savedUser.email, savedUser.name, savedUser.id);
        this.saveUserToStorage(user);
        this.syncUserToCloud(user, 'login');

        return {
            success: true,
            user
        };
    }

    // Logout user
    logout() {
        localStorage.removeItem('currentUser');
        this.currentUser = null;
    }

    // Register user
    register(email, password, name) {
        const normalizedEmail = this.normalizeEmail(email);
        const cleanName = String(name || '').trim();
        const cleanPassword = String(password || '');

        if (!normalizedEmail || !cleanPassword || !cleanName) {
            return {
                success: false,
                message: 'Please enter your name, email and password.'
            };
        }

        if (this.findRegisteredUser(normalizedEmail)) {
            return {
                success: false,
                message: 'Account already exists. Please login.'
            };
        }

        const users = this.loadRegisteredUsers();
        const savedUser = {
            id: this.createUserId(normalizedEmail),
            email: normalizedEmail,
            name: cleanName,
            password: cleanPassword,
            createdAt: new Date().toISOString()
        };

        users.push(savedUser);
        this.saveRegisteredUsers(users);

        const user = this.buildUser(savedUser.email, savedUser.name, savedUser.id);
        this.saveUserToStorage(user);
        this.syncUserToCloud(user, 'register');

        return {
            success: true,
            user
        };
    }
}

// Global auth instance
const auth = new AuthSystem();

// Function to show login modal
function showLoginModal() {
    const modal = document.getElementById('loginModal') || createLoginModal();
    modal.style.display = 'flex';
    modal.classList.add('active');
}

// Function to hide login modal
function hideLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
    }
}

// Create login modal if it doesn't exist
function createLoginModal() {
    if (document.getElementById('loginModal')) {
        return document.getElementById('loginModal');
    }

    const modal = document.createElement('div');
    modal.id = 'loginModal';
    modal.className = 'login-modal';
    modal.innerHTML = `
        <div class="login-modal-content">
            <div class="login-modal-header">
                <h2>Login / Sign Up</h2>
                <button class="close-btn" onclick="hideLoginModal()">&times;</button>
            </div>
            
            <div class="login-tabs">
                <button class="tab-btn active" data-tab="login">Login</button>
                <button class="tab-btn" data-tab="register">Sign Up</button>
            </div>

            <!-- Login Form -->
            <form id="loginForm" class="login-form active-tab">
                <div class="form-group">
                    <label for="loginEmail">Email Address</label>
                    <input type="email" id="loginEmail" placeholder="Enter your email" required>
                </div>
                <div class="form-group">
                    <label for="loginPassword">Password</label>
                    <input type="password" id="loginPassword" placeholder="Enter your password" required>
                </div>
                <button type="submit" class="auth-btn">Login</button>
            </form>

            <!-- Register Form -->
            <form id="registerForm" class="login-form">
                <div class="form-group">
                    <label for="registerName">Full Name</label>
                    <input type="text" id="registerName" placeholder="Enter your full name" required>
                </div>
                <div class="form-group">
                    <label for="registerEmail">Email Address</label>
                    <input type="email" id="registerEmail" placeholder="Enter your email" required>
                </div>
                <div class="form-group">
                    <label for="registerPassword">Password</label>
                    <input type="password" id="registerPassword" placeholder="Create a password" required>
                </div>
                <button type="submit" class="auth-btn">Sign Up</button>
            </form>

            <div class="login-message"></div>
        </div>
    `;

    document.body.appendChild(modal);

    // Tab switching
    const tabBtns = modal.querySelectorAll('.tab-btn');
    const forms = modal.querySelectorAll('.login-form');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            forms.forEach(f => f.classList.remove('active-tab'));
            
            btn.classList.add('active');
            const tabName = btn.dataset.tab;
            document.getElementById(tabName === 'login' ? 'loginForm' : 'registerForm').classList.add('active-tab');
        });
    });

    // Login form submission
    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        const result = auth.login(email, password);
        if (!result.success) {
            showLoginMessage(result.message, 'error');
            return;
        }

        showLoginMessage('Successfully logged in!', 'success');
        
        setTimeout(completeAuthFlow, 1500);
    });

    // Register form submission
    document.getElementById('registerForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;

        const result = auth.register(email, password, name);
        if (!result.success) {
            showLoginMessage(result.message, 'error');
            return;
        }

        showLoginMessage('Account created successfully. You are logged in.', 'success');
        
        setTimeout(completeAuthFlow, 1500);
    });

    // Close modal on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            hideLoginModal();
        }
    });

    return modal;
}

// Show message in login modal
function showLoginMessage(message, type) {
    const msgElement = document.querySelector('.login-message');
    if (msgElement) {
        msgElement.textContent = message;
        msgElement.className = `login-message ${type}`;
    }
}

function completeAuthFlow() {
    hideLoginModal();

    const redirectUrl = localStorage.getItem('redirectAfterLogin');
    if (redirectUrl) {
        localStorage.removeItem('redirectAfterLogin');
        window.location.href = redirectUrl;
        return;
    }

    if (typeof window.pendingCallback === 'function') {
        const callback = window.pendingCallback;
        window.pendingCallback = null;
        callback();
        return;
    }

    location.reload();
}

// Require login before action
function requireLogin(callback) {
    if (auth.isLoggedIn()) {
        if (callback) callback();
    } else {
        showLoginModal();
        // Store callback to execute after login
        window.pendingCallback = callback;
    }
}

// Document ready setup
document.addEventListener('DOMContentLoaded', () => {
    // Update account button if user is logged in
    updateAccountButton();
});

// Update account button text based on login status
function updateAccountButton() {
    const accountBtn = document.querySelector('.btn-account');
    if (accountBtn) {
        if (auth.isLoggedIn()) {
            const user = auth.getCurrentUser();
            accountBtn.textContent = `${user.name.toUpperCase()}`;
            accountBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const existingDropdown = accountBtn.parentElement.querySelector('.account-dropdown');

                if (existingDropdown) {
                    existingDropdown.remove();
                    return;
                }

                const dropdown = document.createElement('div');
                dropdown.className = 'account-dropdown';
                dropdown.innerHTML = `
                    <a href="account.html">My Profile</a>
                    <button onclick="logoutUser()">Logout</button>
                `;
                accountBtn.parentElement.appendChild(dropdown);
            });
        } else {
            accountBtn.textContent = 'Login';
            accountBtn.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.setItem('redirectAfterLogin', 'account.html');
                showLoginModal();
            });
        }
    }
}

// Logout user
function logoutUser() {
    auth.logout();
    localStorage.removeItem('redirectAfterLogin');
    window.location.href = 'index.html';
}
