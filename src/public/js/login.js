// Login JavaScript
class LoginManager {
    constructor() {
        this.baseURL = window.location.origin;
        this.init();
    }

    init() {
        // Check if already logged in
        this.checkExistingSession();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Focus username field
        document.getElementById('username').focus();
    }

    setupEventListeners() {
        // Login form submission
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Alert close button
        document.getElementById('alertClose').addEventListener('click', () => {
            this.hideAlert();
        });

        // Enter key on form fields
        document.querySelectorAll('#username, #password').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleLogin();
                }
            });
        });

        // Remove loading state on page unload
        window.addEventListener('beforeunload', () => {
            this.setLoading(false);
        });
    }

    checkExistingSession() {
        const token = localStorage.getItem('admin_token');
        const username = localStorage.getItem('admin_username');
        
        if (token && username) {
            // Verify token is still valid
            fetch(`${this.baseURL}/auth/verify`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (!data.error) {
                    // Token is valid, redirect to dashboard
                    this.redirectToDashboard();
                } else {
                    // Token is invalid, clear storage
                    this.clearSession();
                }
            })
            .catch(() => {
                // Network error or server down, clear session
                this.clearSession();
            });
        }
    }

    async handleLogin() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        // Validation
        if (!username || !password) {
            this.showAlert('Please enter both username and password', 'error');
            return;
        }

        this.setLoading(true);

        try {
            const response = await fetch(`${this.baseURL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    password,
                    rememberMe
                })
            });

            const data = await response.json();

            if (data.error) {
                this.showAlert(data.message || 'Login failed', 'error');
                this.setLoading(false);
                return;
            }

            // Login successful
            this.saveSession(data.token, username, rememberMe);
            this.showAlert('Login successful! Redirecting...', 'success');
            
            // Redirect after short delay
            setTimeout(() => {
                this.redirectToDashboard();
            }, 1000);

        } catch (error) {
            console.error('Login error:', error);
            this.showAlert('Network error. Please try again.', 'error');
            this.setLoading(false);
        }
    }

    saveSession(token, username, rememberMe) {
        if (rememberMe) {
            // Save to localStorage for persistent login
            localStorage.setItem('admin_token', token);
            localStorage.setItem('admin_username', username);
            localStorage.setItem('admin_remember', 'true');
        } else {
            // Save to sessionStorage for session-only login
            sessionStorage.setItem('admin_token', token);
            sessionStorage.setItem('admin_username', username);
            // Also save to localStorage for dashboard access
            localStorage.setItem('admin_token', token);
            localStorage.setItem('admin_username', username);
        }
    }

    clearSession() {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_username');
        localStorage.removeItem('admin_remember');
        sessionStorage.removeItem('admin_token');
        sessionStorage.removeItem('admin_username');
    }

    redirectToDashboard() {
        const urlParams = new URLSearchParams(window.location.search);
        const returnUrl = urlParams.get('return') || '/dashboard';
        window.location.href = returnUrl;
    }

    setLoading(loading) {
        const loginBtn = document.getElementById('loginBtn');
        const btnText = loginBtn.querySelector('.btn-text');
        const spinner = loginBtn.querySelector('.loading-spinner');

        if (loading) {
            loginBtn.disabled = true;
            loginBtn.classList.add('loading');
            btnText.style.opacity = '0';
            spinner.style.display = 'block';
        } else {
            loginBtn.disabled = false;
            loginBtn.classList.remove('loading');
            btnText.style.opacity = '1';
            spinner.style.display = 'none';
        }
    }

    showAlert(message, type = 'error') {
        const alert = document.getElementById('alert');
        const alertMessage = document.getElementById('alertMessage');
        
        alertMessage.textContent = message;
        alert.className = `alert ${type}`;
        alert.style.display = 'block';
        
        // Auto-hide after 5 seconds for success messages
        if (type === 'success') {
            setTimeout(() => {
                this.hideAlert();
            }, 5000);
        } else {
            // Auto-hide after 8 seconds for error messages
            setTimeout(() => {
                this.hideAlert();
            }, 8000);
        }
    }

    hideAlert() {
        const alert = document.getElementById('alert');
        alert.style.display = 'none';
    }
}

// Initialize login manager when page loads
document.addEventListener('DOMContentLoaded', () => {
    new LoginManager();
});

// Handle browser back/forward navigation
window.addEventListener('popstate', () => {
    // Clear any loading states
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.disabled = false;
        loginBtn.classList.remove('loading');
    }
});

// Clear form on page refresh
window.addEventListener('beforeunload', () => {
    const rememberMe = document.getElementById('rememberMe');
    if (!rememberMe || !rememberMe.checked) {
        // Clear form if not remembering
        setTimeout(() => {
            document.getElementById('loginForm').reset();
        }, 100);
    }
});

// Auto-fill remembered credentials
window.addEventListener('load', () => {
    const remembered = localStorage.getItem('admin_remember');
    if (remembered === 'true') {
        const username = localStorage.getItem('admin_username');
        if (username) {
            document.getElementById('username').value = username;
            document.getElementById('rememberMe').checked = true;
            document.getElementById('password').focus();
        }
    }
});