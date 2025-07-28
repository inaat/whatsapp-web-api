// Dashboard JavaScript
class WhatsAppDashboard {
    constructor() {
        this.baseURL = window.location.origin;
        this.token = localStorage.getItem('admin_token') || '';
        this.instances = [];
        this.checkAuthentication();
        this.init();
    }

    checkAuthentication() {
        if (!this.token) {
            window.location.href = '/auth/login?return=' + encodeURIComponent(window.location.pathname);
            return;
        }
    }

    init() {
        this.setupEventListeners();
        this.loadUserInfo();
        this.loadInstances();
        
        // Auto-refresh every 30 seconds
        setInterval(() => {
            this.loadInstances();
        }, 30000);
    }

    async loadUserInfo() {
        try {
            const response = await fetch(`${this.baseURL}/auth/me`, {
                headers: this.getHeaders()
            });
            
            if (response.ok) {
                const data = await response.json();
                const welcomeText = document.getElementById('welcomeText');
                if (welcomeText && data.user) {
                    const roleText = data.user.role === 'admin' ? 'Admin' : 'User';
                    welcomeText.textContent = `Welcome, ${data.user.username} (${roleText})!`;
                }
            } else {
                // Fallback if API call fails
                const welcomeText = document.getElementById('welcomeText');
                if (welcomeText) {
                    welcomeText.textContent = 'Welcome!';
                }
            }
        } catch (error) {
            console.error('Error loading user info:', error);
            const welcomeText = document.getElementById('welcomeText');
            if (welcomeText) {
                welcomeText.textContent = 'Welcome!';
            }
        }
    }

    logout() {
        localStorage.removeItem('admin_token');
        window.location.href = '/auth/login';
    }

    setupEventListeners() {
        // Refresh button
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.loadInstances();
        });

        // New instance button
        document.getElementById('newInstanceBtn').addEventListener('click', () => {
            this.showNewInstanceModal();
        });

        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });

        // Send message button
        document.getElementById('sendMessageBtn').addEventListener('click', () => {
            this.sendMessage();
        });

        // New instance form
        document.getElementById('newInstanceForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createInstance();
        });

        // Modal close buttons
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                this.closeModal(e.target.closest('.modal'));
            });
        });

        // Click outside modal to close
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target);
            }
        });
    }

    async loadInstances() {
        try {
            const response = await fetch(`${this.baseURL}/instance/list-dashboard`, {
                headers: this.getHeaders()
            });
            
            if (!response.ok) {
                throw new Error('Failed to load instances');
            }
            
            const data = await response.json();
            this.instances = data.data || [];
            this.renderInstances();
            this.populateInstanceSelect();
            
        } catch (error) {
            console.error('Error loading instances:', error);
            this.showToast('Failed to load instances', 'error');
        }
    }

    renderInstances() {
        const container = document.getElementById('instancesList');
        
        if (this.instances.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No instances found. Create your first instance to get started.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.instances.map(instance => `
            <div class="instance-card">
                <div class="instance-header">
                    <div class="instance-key">${instance.instance_key}</div>
                    <span class="status-badge ${instance.phone_connected ? 'status-connected' : 'status-disconnected'}">
                        ${instance.phone_connected ? 'Connected' : 'Disconnected'}
                    </span>
                </div>
                <div class="instance-info">
                    <div class="info-item">
                        <span class="info-label">Browser:</span>
                        <span class="info-value">${instance.browser || 'Unknown'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Webhook:</span>
                        <span class="info-value">${instance.webhook ? 'Enabled' : 'Disabled'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Base64:</span>
                        <span class="info-value">${instance.base64 ? 'Enabled' : 'Disabled'}</span>
                    </div>
                    ${instance.user && instance.user.name ? `
                    <div class="info-item">
                        <span class="info-label">User:</span>
                        <span class="info-value">${instance.user.name}</span>
                    </div>
                    ` : ''}
                </div>
                <div class="instance-actions">
                    ${!instance.phone_connected ? `
                        <button class="btn btn-primary" onclick="dashboard.showQRCode('${instance.instance_key}')">
                            Show QR
                        </button>
                        <button class="btn btn-warning" onclick="dashboard.requestPairingCode('${instance.instance_key}')">
                            Pairing Code
                        </button>
                    ` : `
                        <button class="btn btn-success" onclick="dashboard.getInstanceInfo('${instance.instance_key}')">
                            Info
                        </button>
                    `}
                    <button class="btn btn-secondary" onclick="dashboard.logoutInstance('${instance.instance_key}')">
                        Logout
                    </button>
                    <button class="btn btn-danger" onclick="dashboard.deleteInstance('${instance.instance_key}')">
                        Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    populateInstanceSelect() {
        const select = document.getElementById('instanceKey');
        select.innerHTML = '<option value="">Select Instance</option>';
        
        this.instances.forEach(instance => {
            if (instance.phone_connected) {
                const option = document.createElement('option');
                option.value = instance.instance_key;
                option.textContent = `${instance.instance_key} (Connected)`;
                select.appendChild(option);
            }
        });
    }

    async showQRCode(instanceKey) {
        try {
            const response = await fetch(`${this.baseURL}/instance/qrbase64?key=${instanceKey}&admintoken=${this.token}`, {
                headers: this.getHeaders()
            });
            
            const data = await response.json();
            
            if (data.error) {
                this.showToast(data.message, 'error');
                return;
            }

            if (data.qrcode === 'mock-qr-code') {
                this.showToast('Instance not properly initialized. Please restart the server.', 'error');
                return;
            }

            const modal = document.getElementById('qrModal');
            const qrImage = document.getElementById('qrCodeImage');
            qrImage.src = data.qrcode;
            modal.style.display = 'block';

            // Auto-refresh QR code every 30 seconds
            this.qrRefreshInterval = setInterval(async () => {
                const refreshResponse = await fetch(`${this.baseURL}/instance/qrbase64?key=${instanceKey}&admintoken=${this.token}`, {
                    headers: this.getHeaders()
                });
                const refreshData = await refreshResponse.json();
                if (!refreshData.error && refreshData.qrcode !== 'mock-qr-code') {
                    qrImage.src = refreshData.qrcode;
                }
            }, 30000);

        } catch (error) {
            console.error('Error showing QR code:', error);
            this.showToast('Failed to load QR code', 'error');
        }
    }

    async requestPairingCode(instanceKey) {
        const phoneNumber = prompt('Enter your phone number (with country code, e.g., 923xxxxxxxxx):');
        if (!phoneNumber) return;

        try {
            const response = await fetch(`${this.baseURL}/instance/getcode?key=${instanceKey}`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ number: phoneNumber })
            });

            const data = await response.json();
            
            if (data.error) {
                this.showToast(data.message, 'error');
                return;
            }

            alert(`Your pairing code is: ${data.code}\n\nEnter this code in WhatsApp > Linked Devices > Link a Device`);
            
        } catch (error) {
            console.error('Error requesting pairing code:', error);
            this.showToast('Failed to get pairing code', 'error');
        }
    }

    async getInstanceInfo(instanceKey) {
        try {
            const response = await fetch(`${this.baseURL}/instance/info?key=${instanceKey}`, {
                headers: this.getHeaders()
            });

            const data = await response.json();
            
            if (data.error) {
                this.showToast(data.message, 'error');
                return;
            }

            const info = JSON.stringify(data, null, 2);
            alert(`Instance Info:\n\n${info}`);
            
        } catch (error) {
            console.error('Error getting instance info:', error);
            this.showToast('Failed to get instance info', 'error');
        }
    }

    async logoutInstance(instanceKey) {
        if (!confirm(`Are you sure you want to logout instance: ${instanceKey}?`)) {
            return;
        }

        try {
            const response = await fetch(`${this.baseURL}/instance/logout?key=${instanceKey}`, {
                headers: this.getHeaders()
            });

            const data = await response.json();
            
            if (data.error) {
                this.showToast(data.message, 'error');
                return;
            }

            this.showToast('Instance logged out successfully', 'success');
            this.loadInstances();
            
        } catch (error) {
            console.error('Error logging out instance:', error);
            this.showToast('Failed to logout instance', 'error');
        }
    }

    async deleteInstance(instanceKey) {
        if (!confirm(`Are you sure you want to delete instance: ${instanceKey}? This action cannot be undone.`)) {
            return;
        }

        try {
            const response = await fetch(`${this.baseURL}/instance/delete?key=${instanceKey}`, {
                headers: this.getHeaders()
            });

            const data = await response.json();
            
            if (data.error) {
                this.showToast(data.message, 'error');
                return;
            }

            this.showToast('Instance deleted successfully', 'success');
            this.loadInstances();
            
        } catch (error) {
            console.error('Error deleting instance:', error);
            this.showToast('Failed to delete instance', 'error');
        }
    }

    showNewInstanceModal() {
        const modal = document.getElementById('newInstanceModal');
        modal.style.display = 'block';
    }

    async createInstance() {
        const formData = {
            key: document.getElementById('newInstanceKey').value,
            browser: document.getElementById('browserName').value,
            webhookUrl: document.getElementById('webhookUrl').value,
            webhook: document.getElementById('enableWebhook').checked,
            base64: document.getElementById('enableBase64').checked,
            webhookEvents: ['messages.upsert', 'connection.update', 'qrCode.update'],
            messagesRead: false,
            ignoreGroups: false
        };

        try {
            const response = await fetch(`${this.baseURL}/instance/init`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            
            if (data.error) {
                this.showToast(data.message, 'error');
                return;
            }

            this.showToast('Instance created successfully', 'success');
            this.closeModal(document.getElementById('newInstanceModal'));
            document.getElementById('newInstanceForm').reset();
            this.loadInstances();
            
        } catch (error) {
            console.error('Error creating instance:', error);
            this.showToast('Failed to create instance', 'error');
        }
    }

    async sendMessage() {
        const instanceKey = document.getElementById('instanceKey').value;
        const recipientType = document.getElementById('recipientType').value;
        const recipientId = document.getElementById('recipientId').value;
        const messageText = document.getElementById('messageText').value;

        if (!instanceKey || !recipientId || !messageText) {
            this.showToast('Please fill in all required fields', 'warning');
            return;
        }

        const messageData = {
            id: recipientId,
            typeId: recipientType,
            message: messageText
        };

        try {
            const response = await fetch(`${this.baseURL}/message/text?key=${instanceKey}`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(messageData)
            });

            const data = await response.json();
            
            if (data.error) {
                this.showToast(data.message || 'Failed to send message', 'error');
                return;
            }

            if (data.data && data.data.message === 'Mock message sent') {
                this.showToast('Message was mocked - instance not connected to WhatsApp', 'warning');
                return;
            }

            this.showToast('Message sent successfully', 'success');
            document.getElementById('messageText').value = '';
            
        } catch (error) {
            console.error('Error sending message:', error);
            this.showToast('Failed to send message', 'error');
        }
    }

    closeModal(modal) {
        modal.style.display = 'none';
        
        // Clear QR refresh interval when closing QR modal
        if (modal.id === 'qrModal' && this.qrRefreshInterval) {
            clearInterval(this.qrRefreshInterval);
            this.qrRefreshInterval = null;
        }
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 4000);
    }

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }
}

// Initialize dashboard when page loads
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new WhatsAppDashboard();
});

// Make dashboard available globally for onclick handlers
window.dashboard = dashboard;