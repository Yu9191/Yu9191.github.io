class M3u8Downloader {
    constructor() {
        this.downloader = document.querySelector('.futuristic-m3u8-downloader');
        this.closeBtn = document.querySelector('.m3u8-close');
        this.input = document.querySelector('.m3u8-input');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.convertBtn = document.getElementById('convertBtn');
        this.progressBar = document.querySelector('.m3u8-progress-bar');
        this.statusText = document.querySelector('.m3u8-status');
        this.segmentsContainer = document.querySelector('.m3u8-segments');
        
        this.isDownloading = false;
        this.isConverting = false;
        this.segments = [];
        this.currentSegment = 0;
        
        this.init();
    }
    
    init() {
        this.closeBtn.addEventListener('click', () => this.hide());
        this.downloadBtn.addEventListener('click', () => this.download());
        this.convertBtn.addEventListener('click', () => this.convert());
    }
    
    show() {
        this.downloader.style.display = 'block';
    }
    
    hide() {
        this.downloader.style.display = 'none';
        this.reset();
    }
    
    reset() {
        this.isDownloading = false;
        this.isConverting = false;
        this.segments = [];
        this.currentSegment = 0;
        this.progressBar.style.width = '0%';
        this.statusText.textContent = '准备就绪';
        this.segmentsContainer.innerHTML = '';
        this.downloadBtn.disabled = false;
        this.convertBtn.disabled = false;
    }
    
    async download() {
        const url = this.input.value.trim();
        if (!url) {
            alert('请输入m3u8地址');
            return;
        }
        
        if (!url.toLowerCase().includes('m3u8')) {
            alert('请输入有效的m3u8地址');
            return;
        }
        
        if (this.isDownloading) {
            alert('正在下载中，请等待完成');
            return;
        }
        
        try {
            this.isDownloading = true;
            this.downloadBtn.disabled = true;
            this.convertBtn.disabled = true;
            this.statusText.textContent = '正在解析m3u8文件...';
            
            const response = await fetch(url);
            const m3u8Content = await response.text();
            
            this.segments = this.parseM3u8(m3u8Content, url);
            if (this.segments.length === 0) {
                throw new Error('未找到有效的视频片段');
            }
            
            this.createSegmentsUI();
            await this.downloadSegments();
            
        } catch (error) {
            console.error('下载失败:', error);
            this.statusText.textContent = `下载失败: ${error.message}`;
            this.reset();
        }
    }
    
    async convert() {
        if (!this.segments.length) {
            alert('请先下载视频片段');
            return;
        }
        
        if (this.isConverting) {
            alert('正在转换中，请等待完成');
            return;
        }
        
        try {
            this.isConverting = true;
            this.convertBtn.disabled = true;
            this.statusText.textContent = '正在转换为MP4...';
            
            const videoBlob = await this.mergeSegments();
            
            const url = URL.createObjectURL(videoBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `video_${Date.now()}.mp4`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.statusText.textContent = '转换完成';
            this.reset();
            
        } catch (error) {
            console.error('转换失败:', error);
            this.statusText.textContent = `转换失败: ${error.message}`;
            this.reset();
        }
    }
    
    parseM3u8(content, baseUrl) {
        const lines = content.split('\n');
        const segments = [];
        let currentDuration = 0;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (line.startsWith('#EXTINF:')) {
                currentDuration = parseFloat(line.split(':')[1].split(',')[0]);
            } else if (line && !line.startsWith('#')) {
                const segmentUrl = new URL(line, baseUrl).href;
                segments.push({
                    url: segmentUrl,
                    duration: currentDuration
                });
            }
        }
        
        return segments;
    }
    
    createSegmentsUI() {
        this.segmentsContainer.innerHTML = '';
        this.segments.forEach((segment, index) => {
            const segmentElement = document.createElement('div');
            segmentElement.className = 'm3u8-segment';
            segmentElement.innerHTML = `
                <div class="m3u8-segment-status pending"></div>
                <div class="m3u8-segment-info">片段 ${index + 1}</div>
            `;
            this.segmentsContainer.appendChild(segmentElement);
        });
    }
    
    async downloadSegments() {
        const segmentElements = document.querySelectorAll('.m3u8-segment');
        const downloadedSegments = [];
        
        for (let i = 0; i < this.segments.length; i++) {
            if (!this.isDownloading) break;
            
            const segment = this.segments[i];
            const segmentElement = segmentElements[i];
            const statusElement = segmentElement.querySelector('.m3u8-segment-status');
            const infoElement = segmentElement.querySelector('.m3u8-segment-info');
            
            try {
                statusElement.className = 'm3u8-segment-status downloading';
                infoElement.textContent = `正在下载片段 ${i + 1}`;
                
                const response = await fetch(segment.url);
                const blob = await response.blob();
                downloadedSegments.push(blob);
                
                statusElement.className = 'm3u8-segment-status completed';
                infoElement.textContent = `片段 ${i + 1} 下载完成`;
                
                const progress = ((i + 1) / this.segments.length) * 100;
                this.progressBar.style.width = `${progress}%`;
                this.statusText.textContent = `已下载 ${i + 1}/${this.segments.length} 个片段`;
                
            } catch (error) {
                console.error(`片段 ${i + 1} 下载失败:`, error);
                statusElement.className = 'm3u8-segment-status error';
                infoElement.textContent = `片段 ${i + 1} 下载失败`;
                throw error;
            }
        }
        
        if (this.isDownloading) {
            this.statusText.textContent = '下载完成';
            this.downloadBtn.disabled = false;
            this.convertBtn.disabled = false;
        }
    }
    
    async mergeSegments() {
        const blobs = [];
        const segmentElements = document.querySelectorAll('.m3u8-segment');
        
        for (let i = 0; i < this.segments.length; i++) {
            const segment = this.segments[i];
            const segmentElement = segmentElements[i];
            const statusElement = segmentElement.querySelector('.m3u8-segment-status');
            const infoElement = segmentElement.querySelector('.m3u8-segment-info');
            
            try {
                statusElement.className = 'm3u8-segment-status downloading';
                infoElement.textContent = `正在处理片段 ${i + 1}`;
                
                const response = await fetch(segment.url);
                const blob = await response.blob();
                blobs.push(blob);
                
                statusElement.className = 'm3u8-segment-status completed';
                infoElement.textContent = `片段 ${i + 1} 处理完成`;
                
            } catch (error) {
                console.error(`片段 ${i + 1} 处理失败:`, error);
                statusElement.className = 'm3u8-segment-status error';
                infoElement.textContent = `片段 ${i + 1} 处理失败`;
                throw error;
            }
        }
        
        return new Blob(blobs, { type: 'video/mp4' });
    }
}

// 初始化m3u8下载器
const m3u8Downloader = new M3u8Downloader();

// 导出实例
window.m3u8Downloader = m3u8Downloader; 