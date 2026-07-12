class Modal {
    constructor() {
        this.container = document.getElementById('modalContainer');
        this.currentModal = null;
        this.listeners = [];
    }

    /**
     * فتح مودال
     */
    open(options) {
        const {
            title,
            content,
            size = 'md',
            buttons = [],
            onClose = null,
            onOpen = null
        } = options;

        // إغلاق المودال المفتوح
        if (this.currentModal) {
            this.close();
        }

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.maxWidth = this.getSize(size);

        modal.innerHTML = `
            <div class="modal-header">
                <h2>${title}</h2>
                <button class="modal-close" data-close>×</button>
            </div>
            <div class="modal-body">
                ${typeof content === 'string' ? content : ''}
            </div>
            <div class="modal-footer">
                ${buttons.map(btn => `
                    <button class="btn ${btn.class || 'btn-primary'}" data-action="${btn.action || 'close'}">
                        ${btn.label}
                    </button>
                `).join('')}
            </div>
        `;

        // إذا كان المحتوى DOM عنصر
        if (typeof content !== 'string' && content instanceof HTMLElement) {
            const body = modal.querySelector('.modal-body');
            body.innerHTML = '';
            body.appendChild(content);
        }

        this.container.innerHTML = '';
        this.container.appendChild(modal);
        this.container.classList.add('active');
        this.currentModal = modal;

        // إضافة المستمعين
        this.setupListeners(modal, options);

        if (onOpen) onOpen(modal);
        if (onClose) {
            this.listeners.push({ event: 'close', callback: onClose });
        }

        return modal;
    }

    /**
     * إغلاق المودال
     */
    close() {
        if (this.currentModal) {
            this.container.classList.remove('active');
            this.currentModal = null;
            
            // تنفيذ مستمعي الإغلاق
            this.listeners.forEach(l => {
                if (l.event === 'close') l.callback();
            });
            this.listeners = [];
        }
    }

    /**
     * إعداد المستمعين
     */
    setupListeners(modal, options) {
        // زر الإغلاق
        const closeBtn = modal.querySelector('[data-close]');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        // الأزرار
        modal.querySelectorAll('[data-action]').forEach(btn => {
            const action = btn.dataset.action;
            if (action === 'close') {
                btn.addEventListener('click', () => this.close());
            } else if (options[action]) {
                btn.addEventListener('click', () => {
                    options[action](modal);
                });
            }
        });

        // إغلاق بالنقر خارج المودال
        this.container.addEventListener('click', (e) => {
            if (e.target === this.container) {
                this.close();
            }
        });

        // إغلاق بالضغط على ESC
        const escHandler = (e) => {
            if (e.key === 'Escape' && this.currentModal) {
                this.close();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }

    /**
     * الحصول على حجم المودال
     */
    getSize(size) {
        const sizes = {
            sm: '400px',
            md: '600px',
            lg: '800px',
            xl: '1000px',
            full: '100%'
        };
        return sizes[size] || sizes.md;
    }
}

export default Modal;