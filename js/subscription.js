class SubscriptionConverter {
    constructor() {
<<<<<<< HEAD
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
=======
        this.converter = document.querySelector('.subscription-converter');
        this.closeBtn = document.querySelector('.subscription-close');
        this.input = document.querySelector('.subscription-input');
        this.output = document.querySelector('.subscription-output');
        this.convertBtn = document.querySelector('.subscription-btn');
        this.status = document.querySelector('.subscription-status');
        
        this.init();
    }
    
    init() {
        this.closeBtn.addEventListener('click', () => this.hide());
        this.convertBtn.addEventListener('click', () => this.convert());
    }
    
    show() {
        this.converter.style.display = 'block';
    }
    
    hide() {
        this.converter.style.display = 'none';
        this.reset();
    }
    
    reset() {
        this.input.value = '';
        this.output.value = '';
        this.status.textContent = '';
    }
    
    async convert() {
        const content = this.input.value.trim();
        if (!content) {
            this.status.textContent = '请输入订阅内容';
            return;
        }
        
        try {
            this.status.textContent = '正在转换...';
            this.convertBtn.disabled = true;
            
            // 解析订阅内容
            const lines = content.split('\n');
            const convertedLines = [];
            
            for (const line of lines) {
                if (line.trim() && !line.startsWith('#')) {

                    const convertedLine = await this.convertLine(line);
                    if (convertedLine) {
                        convertedLines.push(convertedLine);
                    }
                }
            }
            
            this.output.value = convertedLines.join('\n');
            this.status.textContent = '转换完成';
            
        } catch (error) {
            console.error('转换失败:', error);
            this.status.textContent = '转换失败: ' + error.message;
        } finally {
            this.convertBtn.disabled = false;
        }
    }
    
    async convertLine(line) {

        try {

            const decoded = atob(line);
            const config = JSON.parse(decoded);

            return JSON.stringify(config, null, 2);
        } catch (error) {
            console.warn('转换行失败:', error);
            return null;
>>>>>>> 63eb12e22c69d285fe92fcee92a0b82cca492d11
        }
    }
}

<<<<<<< HEAD
// Initialize if on the correct page and elements exist
if (document.querySelector('.subscription-converter')) {
    window.subscriptionConverter = new SubscriptionConverter();
} 
=======
// 初始化订阅转换器
const subscriptionConverter = new SubscriptionConverter();

// 导出实例
window.subscriptionConverter = subscriptionConverter; 
>>>>>>> 63eb12e22c69d285fe92fcee92a0b82cca492d11
