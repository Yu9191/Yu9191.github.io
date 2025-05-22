class SubscriptionConverter {
    constructor() {
        this.converterElement = document.querySelector('.subscription-converter');
        this.closeButton = this.converterElement.querySelector('.subscription-close');
        this.inputElement = this.converterElement.querySelector('.subscription-input');
        this.outputElement = this.converterElement.querySelector('.subscription-output');
        this.convertButton = this.converterElement.querySelector('.subscription-btn');
        this.statusElement = this.converterElement.querySelector('.subscription-status');

        this.init();
    }

    init() {
        if (!this.converterElement) return; // Element might not exist if not on tools.html

        this.closeButton.addEventListener('click', () => this.hide());
        this.convertButton.addEventListener('click', () => this.convert());
        
        // Allow closing with Escape key
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.converterElement.style.display === 'block') {
                this.hide();
            }
        });
    }

    show() {
        if (!this.converterElement) return;
        this.converterElement.style.display = 'block';
        this.converterElement.style.opacity = '0';
        this.converterElement.style.transform = 'translate(-50%, -50%) scale(0.95)';
        requestAnimationFrame(() => {
            this.converterElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            this.converterElement.style.opacity = '1';
            this.converterElement.style.transform = 'translate(-50%, -50%) scale(1)';
        });
        this.inputElement.focus();
    }

    hide() {
        if (!this.converterElement) return;
        this.converterElement.style.opacity = '0';
        this.converterElement.style.transform = 'translate(-50%, -50%) scale(0.95)';
        setTimeout(() => {
            this.converterElement.style.display = 'none';
        }, 300); // Match transition duration
    }

    reset() {
        this.inputElement.value = '';
        this.outputElement.value = '';
        this.statusElement.textContent = '';
    }

    convert() {
        const content = this.inputElement.value.trim();
        if (!content) {
            this.statusElement.textContent = '请输入订阅内容！';
            return;
        }

        try {
            // This is a placeholder for actual conversion logic.
            // Replace with your specific conversion requirements.
            let lines = content.split('\n');
            let convertedLines = lines.map(line => {
                if (line.startsWith('#') || line.trim() === '') return line; // Keep comments and empty lines
                // Example: decode base64 if applicable, or parse and reformat
                try {
                    // Attempt to decode if it looks like base64, then re-encode to show a change
                    // This is just a DEMO, replace with actual logic
                    if (btoa(atob(line)) === line) { 
                        return `converted:${btoa(atob(line).toUpperCase())}`;
                    }
                } catch (e) { /* Not base64 or invalid */ }
                return `processed:${line}`;
            });
            
            this.outputElement.value = convertedLines.join('\n');
            this.statusElement.textContent = '转换完成！';
        } catch (error) {
            console.error('Conversion error:', error);
            this.statusElement.textContent = '转换失败，请检查内容或控制台错误。';
        }
    }
}

// Initialize if on the correct page and elements exist
if (document.querySelector('.subscription-converter')) {
    window.subscriptionConverter = new SubscriptionConverter();
} 