class Notification {
    constructor() {
        this.container = document.getElementById('toastContainer');
        this.notifications = [];
        this.maxNotifications = 5;
    }

    /**
     * عرض إشعار
     */
    show(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        `;

        this.container.appendChild(toast);
        this.notifications.push(toast);

        // إزالة الإشعارات الزائدة
        if (this.notifications.length > this.maxNotifications) {
            const old = this.notifications.shift();
            old.remove();
        }

        // إزالة الإشعار تلقائياً
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
                const index = this.notifications.indexOf(toast);
                if (index > -1) {
                    this.notifications.splice(index, 1);
                }
            }
        }, duration);

        return toast;
    }

    /**
     * إشعار نجاح
     */
    success(message, duration = 3000) {
        return this.show(message, 'success', duration);
    }

    /**
     * إشعار خطأ
     */
    error(message, duration = 4000) {
        return this.show(message, 'error', duration);
    }

    /**
     * إشعار تحذير
     */
    warning(message, duration = 3000) {
        return this.show(message, 'warning', duration);
    }

    /**
     * إشعار معلومات
     */
    info(message, duration = 3000) {
        return this.show(message, 'info', duration);
    }
}

export default Notification;