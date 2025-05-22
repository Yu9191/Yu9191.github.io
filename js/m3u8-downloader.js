class M3u8Downloader {
    constructor() {
<<<<<<< HEAD
        this.downloaderElement = document.querySelector('.futuristic-m3u8-downloader');
        this.closeButton = this.downloaderElement.querySelector('.m3u8-close');
        this.urlInput = this.downloaderElement.querySelector('.m3u8-input');
        this.downloadButton = this.downloaderElement.querySelector('#downloadBtn');
        this.convertButton = this.downloaderElement.querySelector('#convertBtn');
        this.progressBar = this.downloaderElement.querySelector('.m3u8-progress-bar');
        this.statusText = this.downloaderElement.querySelector('.m3u8-status');
        this.segmentsContainer = this.downloaderElement.querySelector('.m3u8-segments');
        
        this.segments = [];
        this.isDownloading = false;
        this.isConverting = false;
=======
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
>>>>>>> 63eb12e22c69d285fe92fcee92a0b82cca492d11
        
        this.init();
    }
    
    init() {
<<<<<<< HEAD
        if (!this.downloaderElement) return;
        
        this.closeButton.addEventListener('click', () => this.hide());
        this.downloadButton.addEventListener('click', () => this.downloadM3u8());
        this.convertButton.addEventListener('click', () => this.convertToMp4());
        
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.downloaderElement.style.display === 'block') {
                this.hide();
            }
        });
    }
    
    show() {
        if (!this.downloaderElement) return;
        this.downloaderElement.style.display = 'block';
        this.downloaderElement.style.opacity = '0';
        this.downloaderElement.style.transform = 'translate(-50%, -50%) scale(0.95)';
        requestAnimationFrame(() => {
            this.downloaderElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            this.downloaderElement.style.opacity = '1';
            this.downloaderElement.style.transform = 'translate(-50%, -50%) scale(1)';
        });
        this.urlInput.focus();
        this.resetState();
    }
    
    hide() {
        if (!this.downloaderElement) return;
        this.downloaderElement.style.opacity = '0';
        this.downloaderElement.style.transform = 'translate(-50%, -50%) scale(0.95)';
        setTimeout(() => {
            this.downloaderElement.style.display = 'none';
        }, 300);
    }
    
    resetState() {
        this.segments = [];
        this.isDownloading = false;
        this.isConverting = false;
        this.urlInput.value = '';
        this.progressBar.style.width = '0%';
        this.statusText.textContent = '准备就绪';
        this.segmentsContainer.innerHTML = '';
        this.downloadButton.disabled = false;
        this.convertButton.disabled = true;
    }
    
    async downloadM3u8() {
        const m3u8Url = this.urlInput.value.trim();
        if (!m3u8Url) {
            alert('请输入M3U8链接！');
=======
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
>>>>>>> 63eb12e22c69d285fe92fcee92a0b82cca492d11
            return;
        }
        
        if (this.isDownloading) {
<<<<<<< HEAD
            alert('已有一个下载任务正在进行！');
            return;
        }
        
        this.resetState();
        this.isDownloading = true;
        this.downloadButton.disabled = true;
        this.statusText.textContent = '正在解析M3U8...';
        
        try {
            const response = await fetch(m3u8Url);
            if (!response.ok) throw new Error(`无法获取M3U8文件: ${response.statusText}`);
            const m3u8Content = await response.text();
            
            this.parseM3u8Content(m3u8Content, m3u8Url);
            if (this.segments.length === 0) throw new Error('M3U8文件中没有找到有效的视频片段。');
            
            this.renderSegmentsUI();
            await this.downloadAllSegments();
            
            this.statusText.textContent = '所有片段下载完成！';
            this.convertButton.disabled = false;
            
        } catch (error) {
            console.error('M3U8下载失败:', error);
            this.statusText.textContent = `错误: ${error.message}`;
            alert(`下载失败: ${error.message}`);
        } finally {
            this.isDownloading = false;
            this.downloadButton.disabled = false;
        }
    }
    
    parseM3u8Content(content, baseUrl) {
        const lines = content.split(/\r?\n/);
        let segmentIndex = 0;
        for (const line of lines) {
            if (line.startsWith('#EXTINF:')) {
                // Potentially parse duration or other info here if needed
            } else if (line && !line.startsWith('#')) {
                let segmentUrl = line;
                if (!segmentUrl.startsWith('http')) {
                    const base = new URL(baseUrl);
                    const pathParts = base.pathname.split('/');
                    pathParts.pop();
                    segmentUrl = new URL(line, `${base.origin}${pathParts.join('/')}/`).href;
                }
                this.segments.push({ id: segmentIndex++, url: segmentUrl, status: 'pending', blob: null });
            }
        }
    }
    
    renderSegmentsUI() {
        this.segmentsContainer.innerHTML = '';
        this.segments.forEach(segment => {
            const div = document.createElement('div');
            div.className = 'm3u8-segment';
            div.dataset.segmentId = segment.id;
            div.innerHTML = `
                <div class="m3u8-segment-status ${segment.status}"></div>
                <div class="m3u8-segment-info">片段 ${segment.id + 1} (${segment.status})</div>
            `;
            this.segmentsContainer.appendChild(div);
        });
    }
    
    async downloadAllSegments() {
        let downloadedCount = 0;
        const totalSegments = this.segments.length;
        this.statusText.textContent = `开始下载 ${totalSegments} 个片段...`;
        
        for (const segment of this.segments) {
            try {
                this.updateSegmentStatus(segment.id, 'downloading');
                const response = await fetch(segment.url);
                if (!response.ok) throw new Error(`片段 ${segment.id + 1} 下载失败: ${response.statusText}`);
                segment.blob = await response.blob();
                segment.status = 'completed';
                this.updateSegmentStatus(segment.id, 'completed');
                downloadedCount++;
                this.progressBar.style.width = `${(downloadedCount / totalSegments) * 100}%`;
                this.statusText.textContent = `已下载 ${downloadedCount}/${totalSegments} 个片段...`;
            } catch (error) {
                console.error(`下载片段 ${segment.id + 1} 失败:`, error);
                segment.status = 'error';
                this.updateSegmentStatus(segment.id, 'error');
                throw new Error(`下载片段 ${segment.id + 1} 失败. ${error.message}`);
            }
        }
    }
    
    updateSegmentStatus(segmentId, status) {
        const segmentDiv = this.segmentsContainer.querySelector(`.m3u8-segment[data-segment-id="${segmentId}"]`);
        if (segmentDiv) {
            const statusDiv = segmentDiv.querySelector('.m3u8-segment-status');
            const infoDiv = segmentDiv.querySelector('.m3u8-segment-info');
            statusDiv.className = `m3u8-segment-status ${status}`;
            infoDiv.textContent = `片段 ${segmentId + 1} (${status})`;
        }
    }
    
    async convertToMp4() {
        if (this.segments.length === 0 || this.segments.some(s => s.status !== 'completed')) {
            alert('请先完成所有片段的下载！');
            return;
        }
        if (this.isConverting) {
            alert('正在转换中，请稍候...');
            return;
        }
        
        this.isConverting = true;
        this.convertButton.disabled = true;
        this.statusText.textContent = '正在合并片段为MP4...';
        
        try {
            const blobs = this.segments.map(s => s.blob);
            const mergedBlob = new Blob(blobs, { type: 'video/mp4' });
            
            const downloadUrl = URL.createObjectURL(mergedBlob);
            const a = document.createElement('a');
            a.href = downloadUrl;
=======
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
>>>>>>> 63eb12e22c69d285fe92fcee92a0b82cca492d11
            a.download = `video_${Date.now()}.mp4`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
<<<<<<< HEAD
            URL.revokeObjectURL(downloadUrl);
            
            this.statusText.textContent = 'MP4转换并下载完成！';
            this.resetState();
            
        } catch (error) {
            console.error('MP4转换失败:', error);
            this.statusText.textContent = `MP4转换错误: ${error.message}`;
            alert(`MP4转换失败: ${error.message}`);
        } finally {
            this.isConverting = false;
            this.convertButton.disabled = false;
        }
    }
}

if (document.querySelector('.futuristic-m3u8-downloader')) {
    window.m3u8Downloader = new M3u8Downloader();
} 
=======
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
>>>>>>> 63eb12e22c69d285fe92fcee92a0b82cca492d11
