/**
 * Simple toast notification utility
 */

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
    message: string;
    type?: ToastType;
    duration?: number;
}

class ToastManager {
    private toastContainer: HTMLDivElement | null = null;

    constructor() {
        this.initContainer();
    }

    private initContainer() {
        if (typeof window === 'undefined') return;

        // Create toast container if it doesn't exist
        let container = document.getElementById('toast-container') as HTMLDivElement;
        
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 10px;
                pointer-events: none;
            `;
            document.body.appendChild(container);
        }

        this.toastContainer = container;
    }

    show(options: ToastOptions) {
        if (!this.toastContainer) {
            this.initContainer();
        }

        const { message, type = 'info', duration = 5000 } = options;

        const toast = document.createElement('div');
        toast.style.cssText = `
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            max-width: 400px;
            word-wrap: break-word;
            pointer-events: auto;
            animation: slideIn 0.3s ease-out;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            font-size: 14px;
            line-height: 1.5;
        `;

        // Set color based on type
        switch (type) {
            case 'success':
                toast.style.backgroundColor = '#48bb78';
                toast.style.color = 'white';
                break;
            case 'error':
                toast.style.backgroundColor = '#f56565';
                toast.style.color = 'white';
                break;
            case 'warning':
                toast.style.backgroundColor = '#ed8936';
                toast.style.color = 'white';
                break;
            case 'info':
                toast.style.backgroundColor = '#4299e1';
                toast.style.color = 'white';
                break;
        }

        toast.textContent = message;

        // Add animation styles to document if not already present
        if (!document.getElementById('toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = `
                @keyframes slideIn {
                    from {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        this.toastContainer?.appendChild(toast);

        // Remove toast after duration
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, duration);
    }

    success(message: string, duration?: number) {
        this.show({ message, type: 'success', duration });
    }

    error(message: string, duration?: number) {
        this.show({ message, type: 'error', duration });
    }

    warning(message: string, duration?: number) {
        this.show({ message, type: 'warning', duration });
    }

    info(message: string, duration?: number) {
        this.show({ message, type: 'info', duration });
    }
}

export const toast = new ToastManager();
