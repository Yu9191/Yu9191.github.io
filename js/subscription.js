class SubscriptionConverter {
    constructor() {
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
                    // 这里添加您的转换逻辑
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
        // 这里实现具体的转换逻辑
        // 例如：将V2ray订阅转换为Clash配置
        try {
            // 示例转换逻辑
            const decoded = atob(line);
            const config = JSON.parse(decoded);
            
            // 转换为目标格式
            return JSON.stringify(config, null, 2);
        } catch (error) {
            console.warn('转换行失败:', error);
            return null;
        }
    }
}

// 初始化订阅转换器
const subscriptionConverter = new SubscriptionConverter();

// 导出实例
window.subscriptionConverter = subscriptionConverter; 